/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/test/jest-setup-env.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/scripts/**"],
  coverageDirectory: "coverage",
  testTimeout: 60_000,
  maxWorkers: 1,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
};
