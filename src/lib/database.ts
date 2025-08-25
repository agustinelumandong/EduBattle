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

  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "fallback-secret-key-for-demo"
  ) {
    console.warn(
      "⚠️ JWT_SECRET not set or using fallback. Please set a secure JWT_SECRET in production."
    );
  }
}

// Validate environment on import
validateEnvironment();

// Singleton pattern for Prisma Client to prevent connection issues in Vercel
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with better error handling
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
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
    try {
      console.log("💾 Database: Creating user with data:", {
        username: data.username,
        authMethod: data.authMethod,
        walletAddress: data.walletAddress
          ? data.walletAddress.slice(0, 10) + "..."
          : "none",
        hasEmail: !!data.email,
        hasPasswordHash: !!data.passwordHash,
      });

      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          authMethod: data.authMethod,
          walletAddress: data.walletAddress,
          passwordHash: data.passwordHash,
        },
      });

      console.log("✅ Database: User created successfully:", {
        id: user.id,
        username: user.username,
        authMethod: user.authMethod,
      });

      return user;
    } catch (error: any) {
      console.error("❌ Database: Failed to create user:", {
        error: error.message,
        code: error.code,
        meta: error.meta,
        data: {
          username: data.username,
          authMethod: data.authMethod,
          walletAddress: data.walletAddress
            ? data.walletAddress.slice(0, 10) + "..."
            : "none",
        },
      });
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string) {
    try {
      console.log("🔍 Database: Searching for user by username:", username);

      const user = await prisma.user.findFirst({
        where: { username },
      });

      if (user) {
        console.log("✅ Database: Found user by username:", {
          id: user.id,
          username: user.username,
          authMethod: user.authMethod,
        });
      } else {
        console.log("ℹ️ Database: No user found with username:", username);
      }

      return user;
    } catch (error: any) {
      console.error("❌ Database: Failed to find user by username:", {
        error: error.message,
        code: error.code,
        username: username,
      });
      throw error;
    }
  }

  // 🆕 Check if username is available for registration
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const existingUser = await this.findUserByUsername(username);
      return !existingUser; // Username is available if no user found
    } catch (error) {
      console.error(
        "❌ Database: Failed to check username availability:",
        error
      );
      return false; // Assume unavailable on error for safety
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
          authMethod: user.authMethod,
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

  // 🆕 Add method to update user information
  async updateUser(id: string, data: Partial<CreateUserData>) {
    try {
      console.log("🔄 Database: Updating user:", { id, updateData: data });

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(data.username && { username: data.username }),
          ...(data.email && { email: data.email }),
          ...(data.authMethod && { authMethod: data.authMethod }),
          ...(data.walletAddress && { walletAddress: data.walletAddress }),
          ...(data.passwordHash && { passwordHash: data.passwordHash }),
        },
      });

      console.log("✅ Database: User updated successfully:", {
        id: updatedUser.id,
        username: updatedUser.username,
        authMethod: updatedUser.authMethod,
      });

      return updatedUser;
    } catch (error: any) {
      console.error("❌ Database: Failed to update user:", {
        error: error.message,
        code: error.code,
        userId: id,
        updateData: data,
      });
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
