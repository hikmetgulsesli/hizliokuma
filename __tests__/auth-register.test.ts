import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getDatabase, closeDatabase } from '@/lib/db/connection';

describe('Auth Registration API', () => {
  beforeAll(() => {
    // Clean up test users
    const db = getDatabase();
    db.prepare("DELETE FROM users WHERE email LIKE '%@testregister.com'").run();
  });

  afterAll(() => {
    const db = getDatabase();
    db.prepare("DELETE FROM users WHERE email LIKE '%@testregister.com'").run();
    closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const uniqueEmail = `newuser${Date.now()}@testregister.com`;
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Test User',
          email: uniqueEmail,
          password: 'password123',
        }),
      });

      const response = await POST(request as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe(uniqueEmail.toLowerCase());
      expect(data.data.user.name).toBe('New Test User');
    });

    it('should reject registration with short name', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A',
          email: 'test@testregister.com',
          password: 'password123',
        }),
      });

      const response = await POST(request as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'name' })
      );
    });

    it('should reject registration with invalid email', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      const response = await POST(request as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });

    it('should reject registration with short password', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@testregister.com',
          password: '123',
        }),
      });

      const response = await POST(request as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'password' })
      );
    });

    it('should reject duplicate email registration', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const uniqueEmail = `duplicate${Date.now()}@testregister.com`;
      
      // First registration
      const request1 = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'First User',
          email: uniqueEmail,
          password: 'password123',
        }),
      });

      await POST(request1 as unknown as import('next/server').NextRequest);

      // Second registration with same email
      const request2 = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Second User',
          email: uniqueEmail,
          password: 'password123',
        }),
      });

      const response = await POST(request2 as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe('CONFLICT');
    });

    it('should reject registration with missing fields', async () => {
      const { POST } = await import('@/app/api/auth/register/route');
      
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as unknown as import('next/server').NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.length).toBeGreaterThanOrEqual(3);
    });
  });
});
