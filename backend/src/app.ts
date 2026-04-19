import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ENV } from "./config/env";

import authRoute from "./routes/authRoute";
import topicRoute from "./routes/topicRoute";
import questionRoute from "./routes/questionRoute";
import answerRoute from "./routes/answerRoute";

import mongoose from "mongoose";

const app = express();

app.use(cors());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/topic", topicRoute);
app.use("/api/question", questionRoute);
app.use("/api/answer", answerRoute);

export { app };

if (require.main === module) {
  mongoose
    .connect(ENV.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected", mongoose.connection.db?.databaseName);
      app.listen(ENV.PORT, () =>
        console.log(`Server is running on port ${ENV.PORT}`)
      );
    })
    .catch((err) => console.log("DB connection err", err));
}
