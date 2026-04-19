import mongoose from "mongoose";
import request from "supertest";
import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestApp } from "../helpers/mongoTestApp";

describe("integration: /api/auth", () => {
  let app: Express;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    mongoServer = ctx.mongoServer;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map((col) => col.deleteMany({}))
    );
  });

  it("POST /signup creates a user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "t1",
        email: "t1@example.com",
        password: "Password1!",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("t1@example.com");
  });

  it("POST /signup returns 400 when email already exists", async () => {
    await request(app).post("/api/auth/signup").send({
      username: "a",
      email: "dup@example.com",
      password: "Password1!",
    });

    const res = await request(app).post("/api/auth/signup").send({
      username: "b",
      email: "dup@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("POST /signin returns tokens for valid credentials", async () => {
    await request(app).post("/api/auth/signup").send({
      username: "login",
      email: "login@example.com",
      password: "Secret123!",
    });

    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: "login@example.com", password: "Secret123!" })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
    expect(res.body.data.user.email).toBe("login@example.com");
  });

  it("POST /signin returns 401 for wrong password", async () => {
    await request(app).post("/api/auth/signup").send({
      username: "x",
      email: "x@example.com",
      password: "Right1!",
    });

    const res = await request(app).post("/api/auth/signin").send({
      email: "x@example.com",
      password: "Wrong1!",
    });

    expect(res.status).toBe(401);
  });

  it("POST /verifyAccount indicates available email", async () => {
    const res = await request(app)
      .post("/api/auth/verifyAccount")
      .send({ email: "new@example.com" });

    expect(res.body.success).toBe(true);
  });

  it("POST /refresh returns new tokens when refresh token is valid", async () => {
    await request(app).post("/api/auth/signup").send({
      username: "r",
      email: "r@example.com",
      password: "Pass123!",
    });

    const signin = await request(app).post("/api/auth/signin").send({
      email: "r@example.com",
      password: "Pass123!",
    });

    const refreshToken = signin.body.data.refreshToken as string;

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });
});
