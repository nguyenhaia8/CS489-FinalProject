import dotenv from "dotenv";

dotenv.config();

/** Reads `process.env` when accessed so tests can set vars before each suite. */
export const ENV = {
  get PORT(): string {
    return process.env.PORT || "4000";
  },
  get MONGO_URI(): string {
    return process.env.MONGO_URI || "";
  },
  get JWT_SECRET(): string {
    return (process.env.JWT_SECRET || "secret") as string;
  },
  get JWT_REFRESH_SECRET(): string {
    return (process.env.JWT_REFRESH_SECRET || "refresh_secret") as string;
  },
  get OPENAI_API_KEY(): string | undefined {
    return process.env.OPENAI_API_KEY;
  },
};
