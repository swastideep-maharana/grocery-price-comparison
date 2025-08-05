import { MongoClient, Db } from "mongodb";
import { createClient, RedisClientType } from "redis";
import { SessionData } from "@/types";

class DatabaseManager {
  private mongoClient: MongoClient | null = null;
  private redisClient: RedisClientType | null = null;
  private db: Db | null = null;

  async connectMongoDB(): Promise<void> {
    try {
      const uri =
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/grocery-comparison";
      this.mongoClient = new MongoClient(uri);
      await this.mongoClient.connect();
      this.db = this.mongoClient.db();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async connectRedis(): Promise<void> {
    try {
      const url = process.env.REDIS_URL || "redis://localhost:6379";
      this.redisClient = createClient({ url });
      await this.redisClient.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Redis connection error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
    if (this.redisClient) {
      await this.redisClient.disconnect();
    }
  }

  // MongoDB Operations
  async saveSession(session: SessionData): Promise<void> {
    if (!this.db) throw new Error("MongoDB not connected");

    const collection = this.db.collection("sessions");
    await collection.updateOne(
      { id: session.id },
      { $set: session },
      { upsert: true }
    );
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    if (!this.db) throw new Error("MongoDB not connected");

    const collection = this.db.collection("sessions");
    const session = await collection.findOne({ id: sessionId });
    return session as SessionData | null;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>
  ): Promise<void> {
    if (!this.db) throw new Error("MongoDB not connected");

    const collection = this.db.collection("sessions");
    await collection.updateOne(
      { id: sessionId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error("MongoDB not connected");

    const collection = this.db.collection("sessions");
    await collection.deleteOne({ id: sessionId });
  }

  // Redis Operations
  async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.redisClient) throw new Error("Redis not connected");

    await this.redisClient.setEx(key, ttl, JSON.stringify(value));
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.redisClient) throw new Error("Redis not connected");

    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.redisClient) throw new Error("Redis not connected");

    await this.redisClient.del(key);
  }

  async setSessionCache(
    sessionId: string,
    session: SessionData
  ): Promise<void> {
    await this.setCache(`session:${sessionId}`, session, 1800); // 30 minutes TTL
  }

  async getSessionCache(sessionId: string): Promise<SessionData | null> {
    return await this.getCache(`session:${sessionId}`);
  }

  async deleteSessionCache(sessionId: string): Promise<void> {
    await this.deleteCache(`session:${sessionId}`);
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;
