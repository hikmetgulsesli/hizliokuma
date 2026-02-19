import { GET as getUsers, POST as createUserHandler } from '@/app/api/users/route';
import { GET as getUser, PUT as updateUser, DELETE as deleteUser } from '@/app/api/users/[id]/route';
import { getDatabase, closeDatabase } from '@/lib/db/connection';
import { createSchema, dropSchema } from '@/lib/db/schema';
import * as fs from 'fs';
import * as path from 'path';

describe('Users API', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'hizliokuma.db');

  // Reset database before all tests
  beforeAll(() => {
    closeDatabase();
    // Clean up any existing database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Remove WAL files if they exist
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  afterAll(() => {
    closeDatabase();
    // Clean up
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  // Reset schema before each test
  beforeEach(() => {
    closeDatabase();
    dropSchema();
    createSchema();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('GET /api/users', () => {
    it('returns empty list when no users exist', async () => {
      const request = new Request('http://localhost:3518/api/users');
      const response = await getUsers(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('returns paginated list of users', async () => {
      // Create test users
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash, level, points, streak_days) VALUES (?, ?, ?, ?, ?, ?)'
      );
      stmt.run('User 1', 'user1@test.com', 'hash1', 1, 0, 0);
      stmt.run('User 2', 'user2@test.com', 'hash2', 2, 100, 5);
      stmt.run('User 3', 'user3@test.com', 'hash3', 3, 200, 10);

      const request = new Request('http://localhost:3518/api/users?page=1&limit=2');
      const response = await getUsers(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.meta.total).toBe(3);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(2);
      expect(data.meta.totalPages).toBe(2);
    });

    it('excludes soft-deleted users from list', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash, deleted_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
      );
      stmt.run('Deleted User', 'deleted@test.com', 'hash');

      const request = new Request('http://localhost:3518/api/users');
      const response = await getUsers(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.meta.total).toBe(0);
    });

    it('returns users without password_hash', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      stmt.run('Test User', 'test@test.com', 'secret_hash');

      const request = new Request('http://localhost:3518/api/users');
      const response = await getUsers(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0]).not.toHaveProperty('password_hash');
      expect(data.data[0]).toHaveProperty('name', 'Test User');
      expect(data.data[0]).toHaveProperty('email', 'test@test.com');
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user with valid data', async () => {
      const request = new Request('http://localhost:3518/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
        }),
      });

      const response = await createUserHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name', 'New User');
      expect(data.data).toHaveProperty('email', 'newuser@test.com');
      expect(data.data).toHaveProperty('level', 1);
      expect(data.data).toHaveProperty('points', 0);
      expect(data.data).toHaveProperty('streak_days', 0);
      expect(data.data).not.toHaveProperty('password_hash');
    });

    it('returns 400 for missing name', async () => {
      const request = new Request('http://localhost:3518/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
        }),
      });

      const response = await createUserHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual({ field: 'name', message: 'Name is required' });
    });

    it('returns 400 for invalid email format', async () => {
      const request = new Request('http://localhost:3518/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      const response = await createUserHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual({ field: 'email', message: 'Invalid email format' });
    });

    it('returns 400 for short password', async () => {
      const request = new Request('http://localhost:3518/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          password: '123',
        }),
      });

      const response = await createUserHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual({ field: 'password', message: 'Password must be at least 6 characters' });
    });

    it('returns 409 for duplicate email', async () => {
      // Create first user
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      stmt.run('Existing User', 'existing@test.com', 'hash');

      // Try to create user with same email
      const request = new Request('http://localhost:3518/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'existing@test.com',
          password: 'password123',
        }),
      });

      const response = await createUserHandler(request as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/users/[id]', () => {
    it('returns a single user by ID', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash, level, points) VALUES (?, ?, ?, ?, ?)'
      );
      const result = stmt.run('Test User', 'test@test.com', 'hash', 5, 500);
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`);
      const response = await getUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('id', Number(userId));
      expect(data.data).toHaveProperty('name', 'Test User');
      expect(data.data).toHaveProperty('email', 'test@test.com');
      expect(data.data).toHaveProperty('level', 5);
      expect(data.data).toHaveProperty('points', 500);
      expect(data.data).not.toHaveProperty('password_hash');
    });

    it('returns 404 for non-existent user', async () => {
      const request = new Request('http://localhost:3518/api/users/99999');
      const response = await getUser(request as unknown as Request, { params: Promise.resolve({ id: '99999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid ID format', async () => {
      const request = new Request('http://localhost:3518/api/users/invalid');
      const response = await getUser(request as unknown as Request, { params: Promise.resolve({ id: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for soft-deleted user', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash, deleted_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
      );
      const result = stmt.run('Deleted User', 'deleted@test.com', 'hash');
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`);
      const response = await getUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('updates user name', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Old Name', 'test@test.com', 'hash');
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('name', 'New Name');
      expect(data.data).toHaveProperty('email', 'test@test.com'); // unchanged
    });

    it('updates user email', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Test User', 'old@test.com', 'hash');
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@test.com' }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('email', 'new@test.com');
    });

    it('updates multiple fields', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash, level, points) VALUES (?, ?, ?, ?, ?)'
      );
      const result = stmt.run('Test User', 'test@test.com', 'hash', 1, 0);
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 5, points: 100, streak_days: 3 }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('level', 5);
      expect(data.data).toHaveProperty('points', 100);
      expect(data.data).toHaveProperty('streak_days', 3);
    });

    it('returns 404 for non-existent user', async () => {
      const request = new Request('http://localhost:3518/api/users/99999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: '99999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid email format', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Test User', 'test@test.com', 'hash');
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 for duplicate email', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      stmt.run('User 1', 'user1@test.com', 'hash1');
      const result2 = stmt.run('User 2', 'user2@test.com', 'hash2');
      const userId2 = result2.lastInsertRowid;

      // Try to update user2 with user1's email
      const request = new Request(`http://localhost:3518/api/users/${userId2}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user1@test.com' }),
      });

      const response = await updateUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId2) }) });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('soft-deletes a user', async () => {
      const db = getDatabase();
      const stmt = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Test User', 'test@test.com', 'hash');
      const userId = result.lastInsertRowid;

      const request = new Request(`http://localhost:3518/api/users/${userId}`, {
        method: 'DELETE',
      });

      const response = await deleteUser(request as unknown as Request, { params: Promise.resolve({ id: String(userId) }) });

      expect(response.status).toBe(204);

      // Verify user is soft-deleted (not in list)
      const listRequest = new Request('http://localhost:3518/api/users');
      const listResponse = await getUsers(listRequest as unknown as Request);
      const listData = await listResponse.json();

      expect(listData.data).toHaveLength(0);
      expect(listData.meta.total).toBe(0);
    });

    it('returns 404 for non-existent user', async () => {
      const request = new Request('http://localhost:3518/api/users/99999', {
        method: 'DELETE',
      });

      const response = await deleteUser(request as unknown as Request, { params: Promise.resolve({ id: '99999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid ID format', async () => {
      const request = new Request('http://localhost:3518/api/users/invalid', {
        method: 'DELETE',
      });

      const response = await deleteUser(request as unknown as Request, { params: Promise.resolve({ id: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
