import { execSync } from "node:child_process";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://recall:recall@localhost:5432/recall_test";

/** Point the whole test run at the test database and apply migrations to it. */
export default function setup() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
