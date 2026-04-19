import path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import { ENV } from "../config/env";
import { ROLE } from "../config/constant";
import { UserModel } from "../models/userModel";
import { TopicModel } from "../models/topicModel";
import { QuestionModel } from "../models/questionModel";

const SEED_USERS = [
  {
    username: "admin",
    email: "admin@gmail.com",
    password: "123123",
    role: ROLE.ADMIN,
  },
  {
    username: "user",
    email: "user@local.test",
    password: "User123!",
    role: ROLE.USER,
  },
] as const;

const SEED_TOPICS = [
  {
    name: "JavaScript Basics",
    description: "Sample JavaScript questions for API testing.",
    questions: [
      "What is the difference between let and const?",
      "What is a closure in JavaScript?",
      "What is the event loop in JavaScript?",
      "What is the difference between == and ===?",
      "What does async/await do and how does it relate to Promises?",
    ],
  },
  {
    name: "Web APIs",
    description: "Sample HTTP/REST questions for API testing.",
    questions: [
      "What does HTTP status 401 mean?",
      "What is idempotency in REST?",
      "What is the difference between PUT and PATCH?",
      "What is CORS and why do browsers enforce it?",
      "What is the purpose of the Authorization header in HTTP?",
    ],
  },
  {
    name: "Network",
    description: "Networking fundamentals for API and web development.",
    questions: [
      "What is the difference between TCP and UDP?",
      "What does DNS do when you visit a website?",
      "What is the difference between IPv4 and IPv6?",
      "What is a subnet mask used for?",
      "What is NAT and why is it commonly used on home routers?",
    ],
  },
  {
    name: "React",
    description: "React concepts for UI development.",
    questions: [
      "What is the purpose of useState in React?",
      "What is the virtual DOM and why does React use it?",
      "What is the difference between controlled and uncontrolled components?",
      "When would you use useEffect and what are its dependency arrays for?",
      "What are React keys in lists and why should they be stable?",
    ],
  },
] as const;

const force = process.argv.includes("--force");

async function seedUsers() {
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    await UserModel.findOneAndUpdate(
      { email: u.email },
      {
        username: u.username,
        email: u.email,
        password: hash,
        role: u.role,
      },
      { upsert: true, new: true }
    );
  }
}

async function removeSeedTopicsAndQuestions() {
  const names = SEED_TOPICS.map((t) => t.name);
  const topics = await TopicModel.find({ name: { $in: names } });
  const ids = topics.map((t) => t._id);
  if (ids.length > 0) {
    await QuestionModel.deleteMany({ topicId: { $in: ids } });
    await TopicModel.deleteMany({ _id: { $in: ids } });
  }
}

async function seedTopicsAndQuestions() {
  for (const t of SEED_TOPICS) {
    const topic = await TopicModel.create({
      name: t.name,
      description: t.description,
    });
    for (const q of t.questions) {
      await QuestionModel.create({
        topicId: topic._id,
        question: q,
      });
    }
  }
}

async function main() {
  if (!ENV.MONGO_URI) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(ENV.MONGO_URI);
  console.log("Connected:", mongoose.connection.db?.databaseName);

  const marker = await UserModel.findOne({ email: SEED_USERS[0].email });
  if (marker && !force) {
    console.log(
      "Sample data already exists. Run with --force to delete seed topics/users and re-seed."
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  if (force) {
    await removeSeedTopicsAndQuestions();
    await UserModel.deleteMany({
      email: { $in: SEED_USERS.map((u) => u.email) },
    });
    console.log("Cleared previous seed data (--force).");
  }

  await seedUsers();
  await seedTopicsAndQuestions();

  console.log("\nDone. Test accounts:");
  for (const u of SEED_USERS) {
    console.log(`  ${u.role}: ${u.email} / ${u.password}`);
  }
  console.log(`\nTopics: ${SEED_TOPICS.map((t) => t.name).join(", ")}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
