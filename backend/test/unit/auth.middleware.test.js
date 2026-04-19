"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../../src/middleware/auth");
const userModel_1 = require("../../src/models/userModel");
jest.mock("../../src/models/userModel", () => ({
    UserModel: {
        findById: jest.fn(),
    },
}));
describe("middleware/auth", () => {
    const findById = userModel_1.UserModel.findById;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("requireAuth", () => {
        it("returns 401 when Authorization header is missing", async () => {
            const req = { headers: {} };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            await (0, auth_1.requireAuth)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
        it("returns 401 when token is invalid", async () => {
            const req = {
                headers: { authorization: "Bearer badtoken" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            await (0, auth_1.requireAuth)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
        it("calls next when token is valid and user exists", async () => {
            const userId = "507f1f77bcf86cd799439011";
            const token = jsonwebtoken_1.default.sign({ id: userId, email: "u@test.local" }, process.env.JWT_SECRET);
            findById.mockResolvedValue({
                _id: userId,
                email: "u@test.local",
                role: "User",
            });
            const req = {
                headers: { authorization: `Bearer ${token}` },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            await (0, auth_1.requireAuth)(req, res, next);
            expect(findById).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(req.user).toMatchObject({ email: "u@test.local", role: "User" });
        });
    });
    describe("authorizeRole", () => {
        it("returns 403 when role does not match", () => {
            const middleware = (0, auth_1.authorizeRole)(["Admin"]);
            const req = {
                user: { role: "User" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
        it("calls next when role matches", () => {
            const middleware = (0, auth_1.authorizeRole)(["Admin", "User"]);
            const req = {
                user: { role: "User" },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
