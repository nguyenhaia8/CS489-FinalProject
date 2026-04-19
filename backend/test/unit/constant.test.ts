import {
  ROLE,
  TIME_EXPRIRE_ACCESS_TOKEN,
  TIME_EXPRIRE_REFRESH_TOKEN,
} from "../../src/config/constant";

describe("constant", () => {
  it("exports expected roles", () => {
    expect(ROLE.ADMIN).toBe("Admin");
    expect(ROLE.USER).toBe("User");
  });

  it("token TTLs are positive numbers", () => {
    expect(TIME_EXPRIRE_ACCESS_TOKEN).toBeGreaterThan(0);
    expect(TIME_EXPRIRE_REFRESH_TOKEN).toBeGreaterThan(
      TIME_EXPRIRE_ACCESS_TOKEN
    );
  });
});
