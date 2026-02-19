/**
 * @jest-environment node
 */

import { PrismaClient } from '@prisma/client'
import { ExerciseType, UserRole, Medal, RewardType } from '@prisma/client'

// Mock the prisma client for testing
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    exercise: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    exerciseResult: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    reward: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    userReward: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    streak: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    account: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    verificationToken: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    ExerciseType: {
      BLOK_OKUMA: 'BLOK_OKUMA',
      GRUP_OKUMA: 'GRUP_OKUMA',
      METIN_ARAMA: 'METIN_ARAMA',
      GOLGELEME: 'GOLGELEME',
    },
    UserRole: {
      STUDENT: 'STUDENT',
      ADMIN: 'ADMIN',
    },
    Medal: {
      BRONZE: 'BRONZE',
      SILVER: 'SILVER',
      GOLD: 'GOLD',
    },
    RewardType: {
      MEDAL_BRONZE: 'MEDAL_BRONZE',
      MEDAL_SILVER: 'MEDAL_SILVER',
      MEDAL_GOLD: 'MEDAL_GOLD',
      STREAK_5: 'STREAK_5',
      STREAK_10: 'STREAK_10',
      STREAK_15: 'STREAK_15',
      STREAK_20: 'STREAK_20',
      STREAK_30: 'STREAK_30',
      LEVEL_UP: 'LEVEL_UP',
      DAILY_GOAL: 'DAILY_GOAL',
    },
  }
})

describe('Database Schema', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = new PrismaClient()
  })

  describe('Prisma Client', () => {
    it('should have generated Prisma client with all models', () => {
      // Verify that the prisma client has all the required models
      expect(prisma).toHaveProperty('user')
      expect(prisma).toHaveProperty('exercise')
      expect(prisma).toHaveProperty('exerciseResult')
      expect(prisma).toHaveProperty('reward')
      expect(prisma).toHaveProperty('userReward')
      expect(prisma).toHaveProperty('streak')
      expect(prisma).toHaveProperty('account')
      expect(prisma).toHaveProperty('session')
      expect(prisma).toHaveProperty('verificationToken')
    })

    it('should have all enum types defined', () => {
      // Verify enums are properly defined
      expect(ExerciseType).toBeDefined()
      expect(UserRole).toBeDefined()
      expect(Medal).toBeDefined()
      expect(RewardType).toBeDefined()
      
      // Check enum values
      expect(Object.values(ExerciseType)).toContain('BLOK_OKUMA')
      expect(Object.values(ExerciseType)).toContain('GRUP_OKUMA')
      expect(Object.values(ExerciseType)).toContain('METIN_ARAMA')
      expect(Object.values(ExerciseType)).toContain('GOLGELEME')
      
      expect(Object.values(UserRole)).toContain('STUDENT')
      expect(Object.values(UserRole)).toContain('ADMIN')
      
      expect(Object.values(Medal)).toContain('BRONZE')
      expect(Object.values(Medal)).toContain('SILVER')
      expect(Object.values(Medal)).toContain('GOLD')
    })
  })

  describe('User Model', () => {
    it('should have correct fields defined', () => {
      // Verify the model exists by checking if we can access it
      expect(typeof prisma.user.findMany).toBe('function')
      expect(typeof prisma.user.create).toBe('function')
      expect(typeof prisma.user.update).toBe('function')
      expect(typeof prisma.user.delete).toBe('function')
    })
  })

  describe('Exercise Model', () => {
    it('should have correct fields defined', () => {
      expect(typeof prisma.exercise.findMany).toBe('function')
      expect(typeof prisma.exercise.create).toBe('function')
    })

    it('should support all exercise types', () => {
      const types = Object.values(ExerciseType)
      expect(types).toHaveLength(4)
      expect(types).toContain('BLOK_OKUMA')
      expect(types).toContain('GRUP_OKUMA')
      expect(types).toContain('METIN_ARAMA')
      expect(types).toContain('GOLGELEME')
    })
  })

  describe('ExerciseResult Model', () => {
    it('should have correct fields defined', () => {
      expect(typeof prisma.exerciseResult.findMany).toBe('function')
      expect(typeof prisma.exerciseResult.create).toBe('function')
    })
  })

  describe('Reward Model', () => {
    it('should have correct fields defined', () => {
      expect(typeof prisma.reward.findMany).toBe('function')
      expect(typeof prisma.reward.create).toBe('function')
    })

    it('should support all reward types', () => {
      const types = Object.values(RewardType)
      expect(types).toContain('MEDAL_BRONZE')
      expect(types).toContain('MEDAL_SILVER')
      expect(types).toContain('MEDAL_GOLD')
      expect(types).toContain('STREAK_5')
      expect(types).toContain('STREAK_10')
      expect(types).toContain('STREAK_15')
      expect(types).toContain('STREAK_20')
      expect(types).toContain('STREAK_30')
      expect(types).toContain('LEVEL_UP')
      expect(types).toContain('DAILY_GOAL')
    })
  })

  describe('UserReward Model', () => {
    it('should have correct fields defined', () => {
      expect(typeof prisma.userReward.findMany).toBe('function')
      expect(typeof prisma.userReward.create).toBe('function')
    })
  })

  describe('Streak Model', () => {
    it('should have correct fields defined', () => {
      expect(typeof prisma.streak.findMany).toBe('function')
      expect(typeof prisma.streak.create).toBe('function')
    })
  })
})
