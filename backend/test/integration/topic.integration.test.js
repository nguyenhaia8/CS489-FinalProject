"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../../src/models/userModel");
const constant_1 = require("../../src/config/constant");
const mongoTestApp_1 = require("../helpers/mongoTestApp");
describe("integration: /api/topic", () => {
    let app;
    let mongoServer;
    let adminToken;
    let userToken;
    beforeAll(async () => {
        const ctx = await (0, mongoTestApp_1.createTestApp)();
        app = ctx.app;
        mongoServer = ctx.mongoServer;
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
    });
    afterEach(async () => {
        const { collections } = mongoose_1.default.connection;
        await Promise.all(Object.values(collections).map((col) => col.deleteMany({})));
    });
    beforeEach(async () => {
        const hash = await bcrypt_1.default.hash("Pass123!", 10);
        await userModel_1.UserModel.create({
            username: "adm",
            email: "adm@example.com",
            password: hash,
            role: constant_1.ROLE.ADMIN,
        });
        await userModel_1.UserModel.create({
            username: "usr",
            email: "usr@example.com",
            password: hash,
            role: constant_1.ROLE.USER,
        });
        const a = await (0, supertest_1.default)(app).post("/api/auth/signin").send({
            email: "adm@example.com",
            password: "Pass123!",
        });
        const u = await (0, supertest_1.default)(app).post("/api/auth/signin").send({
            email: "usr@example.com",
            password: "Pass123!",
        });
        adminToken = a.body.data.accessToken;
        userToken = u.body.data.accessToken;
    });
    it("GET /api/topic requires auth", async () => {
        await (0, supertest_1.default)(app).get("/api/topic").expect(401);
    });
    it("GET /api/topic returns list for authenticated user", async () => {
        const res = await (0, supertest_1.default)(app)
            .get("/api/topic")
            .set("Authorization", `Bearer ${userToken}`)
            .expect(200);
        expect(res.body.success).toBe(false);
        expect(res.body.data).toEqual([]);
    });
    it("POST /api/topic creates topic as Admin", async () => {
        const res = await (0, supertest_1.default)(app)
            .post("/api/topic")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ title: "Topic A", description: "Desc" })
            .expect(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe("Topic A");
    });
    it("POST /api/topic returns 403 for non-admin", async () => {
        const res = await (0, supertest_1.default)(app)
            .post("/api/topic")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ title: "X", description: "Y" });
        expect(res.status).toBe(403);
    });
});
