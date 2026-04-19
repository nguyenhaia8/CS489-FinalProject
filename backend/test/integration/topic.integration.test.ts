import mongoose from "mongoose";
import request from "supertest";
import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import { UserModel } from "../../src/models/userModel";
import { ROLE } from "../../src/config/constant";
import { createTestApp } from "../helpers/mongoTestApp";

describe("integration: /api/topic", () => {
  let app: Express;
  let mongoServer: MongoMemoryServer | undefined;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    mongoServer = ctx.mongoServer;
  });

  afterAll(async () => {
    await mongoose.disconnect().catch(() => undefined);
    if (mongoServer) await mongoServer.stop();
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map((col) => col.deleteMany({}))
    );
  });

  beforeEach(async () => {
    const hash = await bcrypt.hash("Pass123!", 10);
    await UserModel.create({
      username: "adm",
      email: "adm@example.com",
      password: hash,
      role: ROLE.ADMIN,
    });
    await UserModel.create({
      username: "usr",
      email: "usr@example.com",
      password: hash,
      role: ROLE.USER,
    });

    const a = await request(app).post("/api/auth/signin").send({
      email: "adm@example.com",
      password: "Pass123!",
    });
    const u = await request(app).post("/api/auth/signin").send({
      email: "usr@example.com",
      password: "Pass123!",
    });
    adminToken = a.body.data.accessToken;
    userToken = u.body.data.accessToken;
  });

  it("GET /api/topic requires auth", async () => {
    await request(app).get("/api/topic").expect(401);
  });

  it("GET /api/topic returns list for authenticated user", async () => {
    const res = await request(app)
      .get("/api/topic")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toEqual([]);
  });

  it("POST /api/topic creates topic as Admin", async () => {
    const res = await request(app)
      .post("/api/topic")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Topic A", description: "Desc" })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Topic A");
  });

  it("POST /api/topic returns 403 for non-admin", async () => {
    const res = await request(app)
      .post("/api/topic")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "X", description: "Y" });

    expect(res.status).toBe(403);
  });
});
