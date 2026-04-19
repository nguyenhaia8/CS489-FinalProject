import mongoose from "mongoose";
import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function createTestApp(): Promise<{
  app: Express;
  mongoServer: MongoMemoryServer;
}> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  const { app } = await import("../../src/app");
  await mongoose.connect(process.env.MONGO_URI);

  return { app, mongoServer };
}
