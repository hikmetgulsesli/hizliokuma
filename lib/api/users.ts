// User types for API

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  level: number;
  points: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// User without sensitive fields for API responses
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  level: number;
  points: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  level?: number;
  points?: number;
  streak_days?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  level?: number;
  points?: number;
  streak_days?: number;
}

// Validation functions
export function validateCreateUser(input: unknown): CreateUserInput {
  const errors: Array<{ field: string; message: string }> = [];

  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input: expected an object');
  }

  const data = input as Record<string, unknown>;

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    } else if (data.email.trim().length > 255) {
      errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
    }
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string' || data.password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  } else if (data.password.length > 255) {
    errors.push({ field: 'password', message: 'Password must be less than 255 characters' });
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    (error as Error & { details: typeof errors }).details = errors;
    throw error;
  }

  return {
    name: String(data.name).trim(),
    email: String(data.email).trim().toLowerCase(),
    password: String(data.password),
    level: typeof data.level === 'number' ? data.level : 1,
    points: typeof data.points === 'number' ? data.points : 0,
    streak_days: typeof data.streak_days === 'number' ? data.streak_days : 0,
  };
}

export function validateUpdateUser(input: unknown): UpdateUserInput {
  const errors: Array<{ field: string; message: string }> = [];

  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input: expected an object');
  }

  const data = input as Record<string, unknown>;
  const result: UpdateUserInput = {};

  // Name validation (optional for update)
  if ('name' in data) {
    if (data.name === null || data.name === undefined) {
      // Allow null/undefined to skip update
    } else if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
    } else {
      result.name = data.name.trim();
    }
  }

  // Email validation (optional for update)
  if ('email' in data) {
    if (data.email === null || data.email === undefined) {
      // Allow null/undefined to skip update
    } else if (typeof data.email !== 'string' || data.email.trim().length === 0) {
      errors.push({ field: 'email', message: 'Email cannot be empty' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
      } else if (data.email.trim().length > 255) {
        errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
      } else {
        result.email = data.email.trim().toLowerCase();
      }
    }
  }

  // Password validation (optional for update)
  if ('password' in data) {
    if (data.password === null || data.password === undefined) {
      // Allow null/undefined to skip update
    } else if (typeof data.password !== 'string' || data.password.length === 0) {
      errors.push({ field: 'password', message: 'Password cannot be empty' });
    } else if (data.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    } else if (data.password.length > 255) {
      errors.push({ field: 'password', message: 'Password must be less than 255 characters' });
    } else {
      result.password = data.password;
    }
  }

  // Level validation
  if ('level' in data && data.level !== undefined && data.level !== null) {
    if (typeof data.level !== 'number' || data.level < 1) {
      errors.push({ field: 'level', message: 'Level must be a positive number' });
    } else {
      result.level = data.level;
    }
  }

  // Points validation
  if ('points' in data && data.points !== undefined && data.points !== null) {
    if (typeof data.points !== 'number' || data.points < 0) {
      errors.push({ field: 'points', message: 'Points must be a non-negative number' });
    } else {
      result.points = data.points;
    }
  }

  // Streak days validation
  if ('streak_days' in data && data.streak_days !== undefined && data.streak_days !== null) {
    if (typeof data.streak_days !== 'number' || data.streak_days < 0) {
      errors.push({ field: 'streak_days', message: 'Streak days must be a non-negative number' });
    } else {
      result.streak_days = data.streak_days;
    }
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    (error as Error & { details: typeof errors }).details = errors;
    throw error;
  }

  return result;
}

// Helper to convert User to UserResponse (remove sensitive fields)
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    level: user.level,
    points: user.points,
    streak_days: user.streak_days,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
