process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "jest-jwt-secret";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "jest-refresh-secret";
process.env.OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || "sk-test-ci-placeholder-not-used";
