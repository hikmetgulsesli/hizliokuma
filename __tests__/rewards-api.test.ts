/**
 * @jest-environment node
 */

import { GET as getAllRewards, POST as createReward } from '@/app/api/rewards/route';
import { GET as getReward, PUT as updateReward, DELETE as deleteReward } from '@/app/api/rewards/[id]/route';
import { GET as getUserRewards } from '@/app/api/users/[id]/rewards/route';
import { getDatabase, closeDatabase } from '@/lib/db/connection';
import { createSchema, dropSchema } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import * as fs from 'fs';
import * as path from 'path';

// Mock NextRequest
function createMockNextRequest(options: { method?: string; body?: unknown; url?: string } = {}): any {
  const { method = 'GET', body, url = 'http://localhost:3000/api/rewards' } = options;
  
  return {
    method,
    url,
    json: async () => body || {},
    headers: new Map(),
  };
}

describe('Rewards API', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'hizliokuma.db');

  beforeAll(() => {
    // Ensure clean state
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    createSchema();
    seedDatabase();
  });

  afterEach(() => {
    dropSchema();
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('GET /api/rewards', () => {
    it('should return all rewards', async () => {
      const response = await getAllRewards();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.meta).toBeDefined();
      expect(json.meta.total).toBe(json.data.length);
    });

    it('should return rewards ordered by threshold ASC', async () => {
      const response = await getAllRewards();
      const json = await response.json();

      const thresholds = json.data.map((r: any) => r.threshold);
      const sortedThresholds = [...thresholds].sort((a, b) => a - b);
      expect(thresholds).toEqual(sortedThresholds);
    });

    it('should have correct reward structure', async () => {
      const response = await getAllRewards();
      const json = await response.json();

      const reward = json.data[0];
      expect(reward).toHaveProperty('id');
      expect(reward).toHaveProperty('title');
      expect(reward).toHaveProperty('description');
      expect(reward).toHaveProperty('type');
      expect(reward).toHaveProperty('threshold');
      expect(reward).toHaveProperty('icon');
      expect(reward).toHaveProperty('created_at');
      expect(reward).toHaveProperty('updated_at');
    });
  });

  describe('GET /api/rewards/[id]', () => {
    it('should return a single reward by ID', async () => {
      // First get all rewards to find a valid ID
      const allResponse = await getAllRewards();
      const allJson = await allResponse.json();
      const firstReward = allJson.data[0];

      const request = createMockNextRequest({
        url: `http://localhost:3000/api/rewards/${firstReward.id}`,
      });

      const response = await getReward(request, { params: { id: String(firstReward.id) } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(firstReward.id);
      expect(json.data.title).toBe(firstReward.title);
    });

    it('should return 404 for non-existent reward', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/rewards/99999',
      });

      const response = await getReward(request, { params: { id: '99999' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid reward ID', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/rewards/invalid',
      });

      const response = await getReward(request, { params: { id: 'invalid' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/rewards', () => {
    it('should create a new reward with valid data', async () => {
      const newReward = {
        title: 'Test Reward',
        description: 'A test reward description',
        type: 'achievement',
        threshold: 100,
        icon: 'trophy',
      };

      const request = createMockNextRequest({
        method: 'POST',
        body: newReward,
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data).toBeDefined();
      expect(json.data.title).toBe(newReward.title);
      expect(json.data.type).toBe(newReward.type);
      expect(json.data.threshold).toBe(newReward.threshold);
      expect(json.data.description).toBe(newReward.description);
      expect(json.data.icon).toBe(newReward.icon);
      expect(json.data.id).toBeDefined();
      expect(json.data.created_at).toBeDefined();
      expect(json.data.updated_at).toBeDefined();
    });

    it('should create a reward with minimal data', async () => {
      const newReward = {
        title: 'Minimal Reward',
        type: 'points',
        threshold: 50,
      };

      const request = createMockNextRequest({
        method: 'POST',
        body: newReward,
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.title).toBe(newReward.title);
      expect(json.data.description).toBeNull();
      expect(json.data.icon).toBeNull();
    });

    it('should return 400 when title is missing', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        body: { type: 'achievement', threshold: 100 },
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toContainEqual(
        expect.objectContaining({ field: 'title', message: 'Title is required' })
      );
    });

    it('should return 400 when type is missing', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        body: { title: 'Test', threshold: 100 },
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toContainEqual(
        expect.objectContaining({ field: 'type', message: 'Type is required' })
      );
    });

    it('should return 400 when threshold is negative', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        body: { title: 'Test', type: 'achievement', threshold: -1 },
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toContainEqual(
        expect.objectContaining({ field: 'threshold', message: 'Threshold must be a non-negative number' })
      );
    });

    it('should trim whitespace from title and type', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        body: { title: '  Trimmed Reward  ', type: '  points  ', threshold: 100 },
        url: 'http://localhost:3000/api/rewards',
      });

      const response = await createReward(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.title).toBe('Trimmed Reward');
      expect(json.data.type).toBe('points');
    });
  });

  describe('PUT /api/rewards/[id]', () => {
    it('should update a reward with valid data', async () => {
      // Get first reward
      const allResponse = await getAllRewards();
      const allJson = await allResponse.json();
      const firstReward = allJson.data[0];

      const updates = {
        title: 'Updated Title',
        threshold: 999,
      };

      const request = createMockNextRequest({
        method: 'PUT',
        body: updates,
        url: `http://localhost:3000/api/rewards/${firstReward.id}`,
      });

      const response = await updateReward(request, { params: { id: String(firstReward.id) } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.title).toBe(updates.title);
      expect(json.data.threshold).toBe(updates.threshold);
      expect(json.data.type).toBe(firstReward.type); // Unchanged
    });

    it('should return 404 when updating non-existent reward', async () => {
      const request = createMockNextRequest({
        method: 'PUT',
        body: { title: 'Updated' },
        url: 'http://localhost:3000/api/rewards/99999',
      });

      const response = await updateReward(request, { params: { id: '99999' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when no fields provided', async () => {
      const allResponse = await getAllRewards();
      const allJson = await allResponse.json();
      const firstReward = allJson.data[0];

      const request = createMockNextRequest({
        method: 'PUT',
        body: {},
        url: `http://localhost:3000/api/rewards/${firstReward.id}`,
      });

      const response = await updateReward(request, { params: { id: String(firstReward.id) } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.message).toBe('No fields to update');
    });

    it('should validate threshold is non-negative', async () => {
      const allResponse = await getAllRewards();
      const allJson = await allResponse.json();
      const firstReward = allJson.data[0];

      const request = createMockNextRequest({
        method: 'PUT',
        body: { threshold: -5 },
        url: `http://localhost:3000/api/rewards/${firstReward.id}`,
      });

      const response = await updateReward(request, { params: { id: String(firstReward.id) } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/rewards/[id]', () => {
    it('should delete a reward', async () => {
      // Create a reward to delete
      const newReward = {
        title: 'To Be Deleted',
        type: 'test',
        threshold: 1,
      };

      const createRequest = createMockNextRequest({
        method: 'POST',
        body: newReward,
        url: 'http://localhost:3000/api/rewards',
      });

      const createResponse = await createReward(createRequest);
      const createJson = await createResponse.json();
      const rewardId = createJson.data.id;

      // Delete the reward
      const deleteReq = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/rewards/${rewardId}`,
      });

      const response = await deleteReward(deleteReq, { params: { id: String(rewardId) } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.message).toBe('Reward deleted successfully');

      // Verify it's gone
      const getReq = createMockNextRequest({
        url: `http://localhost:3000/api/rewards/${rewardId}`,
      });
      const getResponse = await getReward(getReq, { params: { id: String(rewardId) } });
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent reward', async () => {
      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/rewards/99999',
      });

      const response = await deleteReward(request, { params: { id: '99999' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid reward ID', async () => {
      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/rewards/invalid',
      });

      const response = await deleteReward(request, { params: { id: 'invalid' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/users/[id]/rewards', () => {
    it('should return rewards earned by a user', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/users/1/rewards',
      });

      const response = await getUserRewards(request, { params: { id: '1' } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.meta).toBeDefined();
      expect(json.meta.user_id).toBe(1);
    });

    it('should return 404 for non-existent user', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/users/99999/rewards',
      });

      const response = await getUserRewards(request, { params: { id: '99999' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid user ID', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/users/invalid/rewards',
      });

      const response = await getUserRewards(request, { params: { id: 'invalid' } });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include reward details in response', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/users/1/rewards',
      });

      const response = await getUserRewards(request, { params: { id: '1' } });
      const json = await response.json();

      if (json.data.length > 0) {
        const userReward = json.data[0];
        expect(userReward).toHaveProperty('id');
        expect(userReward).toHaveProperty('user_id');
        expect(userReward).toHaveProperty('reward_id');
        expect(userReward).toHaveProperty('earned_at');
        expect(userReward).toHaveProperty('reward_title');
        expect(userReward).toHaveProperty('reward_type');
        expect(userReward).toHaveProperty('reward_threshold');
      }
    });

    it('should return rewards ordered by earned_at DESC', async () => {
      const request = createMockNextRequest({
        url: 'http://localhost:3000/api/users/1/rewards',
      });

      const response = await getUserRewards(request, { params: { id: '1' } });
      const json = await response.json();

      if (json.data.length > 1) {
        const earnedDates = json.data.map((ur: any) => new Date(ur.earned_at).getTime());
        const sortedDates = [...earnedDates].sort((a, b) => b - a);
        expect(earnedDates).toEqual(sortedDates);
      }
    });
  });
});
