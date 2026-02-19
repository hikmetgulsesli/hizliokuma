import { getDatabase } from '@/lib/db/connection';
import { User, UserResponse, CreateUserInput, UpdateUserInput, toUserResponse } from './users';
import { NotFoundError, ConflictError, DatabaseError } from './errors';
import crypto from 'crypto';

// Helper to hash password (simple hash for demo - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Get all users with pagination (excluding soft-deleted)
export function getUsers(page: number = 1, limit: number = 20): { users: UserResponse[]; total: number } {
  try {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // Get total count (excluding soft-deleted)
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    const { count: total } = countStmt.get() as { count: number };

    // Get paginated users
    const stmt = db.prepare(
      'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $limit OFFSET $offset'
    );
    const users = stmt.all({ limit, offset }) as User[];

    return {
      users: users.map(toUserResponse),
      total,
    };
  } catch (error) {
    throw new DatabaseError('Failed to fetch users');
  }
}

// Get single user by ID
export function getUserById(id: number): UserResponse {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = $id AND deleted_at IS NULL');
    const user = stmt.get({ id }) as User | undefined;

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return toUserResponse(user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch user');
  }
}

// Create new user
export function createUser(input: CreateUserInput): UserResponse {
  try {
    const db = getDatabase();
    const passwordHash = hashPassword(input.password);

    const stmt = db.prepare(
      `INSERT INTO users (name, email, password_hash, level, points, streak_days, created_at, updated_at)
       VALUES ($name, $email, $passwordHash, $level, $points, $streakDays, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );

    const result = stmt.run({
      name: input.name,
      email: input.email,
      passwordHash,
      level: input.level ?? 1,
      points: input.points ?? 0,
      streakDays: input.streak_days ?? 0,
    });

    // Fetch and return the created user
    return getUserById(result.lastInsertRowid as number);
  } catch (error) {
    // Check for unique constraint violation (SQLite error code 19, constraint failed)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      throw new ConflictError('User with this email already exists');
    }
    throw new DatabaseError('Failed to create user');
  }
}

// Update user
export function updateUser(id: number, input: UpdateUserInput): UserResponse {
  try {
    // First check if user exists
    getUserById(id);

    const db = getDatabase();
    const updates: string[] = [];
    const params: Record<string, unknown> = { id };

    if (input.name !== undefined) {
      updates.push('name = $name');
      params.name = input.name;
    }

    if (input.email !== undefined) {
      updates.push('email = $email');
      params.email = input.email;
    }

    if (input.password !== undefined) {
      updates.push('password_hash = $passwordHash');
      params.passwordHash = hashPassword(input.password);
    }

    if (input.level !== undefined) {
      updates.push('level = $level');
      params.level = input.level;
    }

    if (input.points !== undefined) {
      updates.push('points = $points');
      params.points = input.points;
    }

    if (input.streak_days !== undefined) {
      updates.push('streak_days = $streakDays');
      params.streakDays = input.streak_days;
    }

    if (updates.length === 0) {
      // No updates, just return current user
      return getUserById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $id AND deleted_at IS NULL`
    );

    stmt.run(params);

    // Return updated user
    return getUserById(id);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      throw new ConflictError('User with this email already exists');
    }
    throw new DatabaseError('Failed to update user');
  }
}

// Soft delete user
export function deleteUser(id: number): void {
  try {
    // First check if user exists
    getUserById(id);

    const db = getDatabase();
    const stmt = db.prepare(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $id'
    );

    stmt.run({ id });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to delete user');
  }
}
