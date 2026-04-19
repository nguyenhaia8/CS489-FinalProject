import { Response } from "express";
import jwt from "jsonwebtoken";
import { requireAuth, authorizeRole, AuthRequest } from "../../src/middleware/auth";
import { UserModel } from "../../src/models/userModel";

jest.mock("../../src/models/userModel", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

describe("middleware/auth", () => {
  const findById = UserModel.findById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const req = { headers: {} } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when token is invalid", async () => {
      const req = {
        headers: { authorization: "Bearer badtoken" },
      } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next when token is valid and user exists", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const token = jwt.sign(
        { id: userId, email: "u@test.local" },
        process.env.JWT_SECRET as string
      );

      findById.mockResolvedValue({
        _id: userId,
        email: "u@test.local",
        role: "User",
      });

      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(findById).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject({ email: "u@test.local", role: "User" });
    });
  });

  describe("authorizeRole", () => {
    it("returns 403 when role does not match", () => {
      const middleware = authorizeRole(["Admin"]);
      const req = {
        user: { role: "User" },
      } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next when role matches", () => {
      const middleware = authorizeRole(["Admin", "User"]);
      const req = {
        user: { role: "User" },
      } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
