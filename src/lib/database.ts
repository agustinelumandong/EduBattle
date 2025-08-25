import { PrismaClient } from "@prisma/client";

// Validate environment variables
function validateEnvironment() {
  const requiredEnvVars = ["DATABASE_URL"];
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars);
    console.error(
      "📝 Please check ENVIRONMENT_SETUP.md for setup instructions"
    );
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }

  // Log database URL for debugging (masked for security)
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/(:\/\/)([^:]+):([^@]+)@/, "$1***:***@");
    console.log("🔗 Database URL configured:", maskedUrl);
  }
}

// Validate environment on import
validateEnvironment();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with better error handling
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface CreateUserData {
  username: string;
  walletAddress?: string;
  isGuest?: boolean;
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
    try {
      console.log("💾 Database: Creating user with data:", {
        username: data.username,
        walletAddress: data.walletAddress
          ? data.walletAddress.slice(0, 10) + "..."
          : "none",
        isGuest: data.isGuest || false,
      });

      const user = await prisma.user.create({
        data: {
          username: data.username,
          walletAddress: data.walletAddress,
          isGuest: data.isGuest || false,
        },
      });

      console.log("✅ Database: User created successfully:", {
        id: user.id,
        username: user.username,
        isGuest: user.isGuest,
      });

      return user;
    } catch (error: any) {
      console.error("❌ Database: Failed to create user:", {
        error: error.message,
        code: error.code,
        meta: error.meta,
        data: {
          username: data.username,
          walletAddress: data.walletAddress
            ? data.walletAddress.slice(0, 10) + "..."
            : "none",
        },
      });
      throw error;
    }
  }

  async findUserByWallet(walletAddress: string) {
    try {
      console.log(
        "🔍 Database: Searching for user by wallet:",
        walletAddress.slice(0, 10) + "..."
      );

      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (user) {
        console.log("✅ Database: Found existing user:", {
          id: user.id,
          username: user.username,
          isGuest: user.isGuest,
        });
      } else {
        console.log("ℹ️ Database: No existing user found for wallet address");
      }

      return user;
    } catch (error: any) {
      console.error("❌ Database: Failed to find user by wallet:", {
        error: error.message,
        code: error.code,
        walletAddress: walletAddress.slice(0, 10) + "...",
      });
      throw error;
    }
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async createGuestUser(username: string) {
    try {
      console.log("👻 Database: Creating guest user:", username);

      const user = await prisma.user.create({
        data: {
          username,
          isGuest: true,
        },
      });

      console.log("✅ Database: Guest user created:", {
        id: user.id,
        username: user.username,
        isGuest: user.isGuest,
      });

      return user;
    } catch (error: any) {
      console.error("❌ Database: Failed to create guest user:", error);
      throw error;
    }
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
        updatedAt: new Date(),
      },
      create: {
        userId,
        totalWins,
        totalGames,
        updatedAt: new Date(),
      },
    });
  }

  async getLeaderboard() {
    const entries = await prisma.leaderboardEntry.findMany({
      include: {
        user: {
          select: {
            username: true,
            isGuest: true,
            walletAddress: true,
          },
        },
      },
      orderBy: [{ totalWins: "desc" }, { updatedAt: "asc" }],
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
            isGuest: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!entry) return null;

    const leaderboardEntries = await this.getLeaderboard();
    const rank =
      leaderboardEntries.findIndex((e: any) => e.userId === userId) + 1;

    return {
      ...entry,
      rank,
    };
  }
}

export const database = new DatabaseService();
