"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("../../src/config/constant");
describe("constant", () => {
    it("exports expected roles", () => {
        expect(constant_1.ROLE.ADMIN).toBe("Admin");
        expect(constant_1.ROLE.USER).toBe("User");
    });
    it("token TTLs are positive numbers", () => {
        expect(constant_1.TIME_EXPRIRE_ACCESS_TOKEN).toBeGreaterThan(0);
        expect(constant_1.TIME_EXPRIRE_REFRESH_TOKEN).toBeGreaterThan(constant_1.TIME_EXPRIRE_ACCESS_TOKEN);
    });
});
