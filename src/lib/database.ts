import { PrismaClient } from "@prisma/client";

// Validate environment variables
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('📝 Please check ENVIRONMENT_SETUP.md for setup instructions');
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key-for-demo') {
    console.warn('⚠️ JWT_SECRET not set or using fallback. Please set a secure JWT_SECRET in production.');
  }
}

// Validate environment on import
validateEnvironment();

// Singleton pattern for Prisma Client to prevent connection issues in Vercel
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with better error handling
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export interface CreateUserData {
  email?: string;
  username: string;
  authMethod: "wallet" | "email";
  walletAddress?: string;
  passwordHash?: string;
}

export interface GameResult {
  userId: string;
  won: boolean;
  score?: number;
  gameData?: any;
}

export class DatabaseService {
  // User management
  async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        authMethod: data.authMethod,
        walletAddress: data.walletAddress,
        passwordHash: data.passwordHash,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByWallet(walletAddress: string) {
    return await prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // Game management
  async recordGame(data: GameResult) {
    const game = await prisma.game.create({
      data: {
        userId: data.userId,
        won: data.won,
        score: data.score,
        gameData: data.gameData ? JSON.stringify(data.gameData) : null,
      },
    });

    // Update leaderboard
    await this.updateLeaderboard(data.userId);

    return game;
  }

  async getUserGames(userId: string) {
    return await prisma.game.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
    });
  }

  // Leaderboard management
  async updateLeaderboard(userId: string) {
    const userGames = await prisma.game.findMany({
      where: { userId },
    });

    const totalWins = userGames.filter((g: any) => g.won).length;
    const totalGames = userGames.length;

    await prisma.leaderboardEntry.upsert({
      where: { userId },
      update: {
        totalWins,
        totalGames,
      },
      create: {
        userId,
        totalWins,
        totalGames,
      },
    });
  }

  async getLeaderboard() {
    const entries = await prisma.leaderboardEntry.findMany({
      include: {
        user: {
          select: {
            username: true,
            authMethod: true,
            walletAddress: true,
            email: true,
          },
        },
      },
      orderBy: { totalWins: "desc" },
    });

    // Add rank numbers
    return entries.map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getUserStats(userId: string) {
    const entry = await prisma.leaderboardEntry.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            authMethod: true,
            walletAddress: true,
            email: true,
          },
        },
      },
    });

    if (!entry) return null;

    const leaderboard = await this.getLeaderboard();
    const rank = leaderboard.findIndex((e: any) => e.userId === userId) + 1;

    return {
      ...entry,
      rank,
    };
  }
}

export const database = new DatabaseService();
