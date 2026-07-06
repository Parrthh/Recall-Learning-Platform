import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Replace the session module so API routes see a controllable user id and we
// avoid loading the full next-auth stack in the test runner.
const mockUserId = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("@/lib/session", () => ({
  getUserId: async () => mockUserId.value,
  requireUserId: async () => {
    if (!mockUserId.value) throw new Error("redirect");
    return mockUserId.value;
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as signup } from "@/app/api/signup/route";
import { POST as setQuestionStatus } from "@/app/api/questions/[id]/status/route";
import { POST as setTopicProgress } from "@/app/api/topics/[slug]/progress/route";

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = <T extends object>(value: T) => ({ params: Promise.resolve(value) });

let topicId: string;
let questionIds: string[];
let userId: string;

beforeAll(async () => {
  // Start from a clean test database (cascades cover progress/status rows).
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();

  const topic = await prisma.topic.create({
    data: {
      category: "DSA",
      section: "Patterns",
      title: "Test Topic",
      slug: "test-topic",
      order: 1,
      summary: "test",
      contentPath: "dsa/two-pointers.md",
      questions: {
        create: [
          {
            slug: "test-q1",
            title: "Q1",
            prompt: "p1",
            difficulty: "EASY",
            hints: ["h1"],
            solutionMd: "s1",
            order: 0,
          },
          {
            slug: "test-q2",
            title: "Q2",
            prompt: "p2",
            difficulty: "MEDIUM",
            hints: [],
            solutionMd: "s2",
            order: 1,
          },
        ],
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  topicId = topic.id;
  questionIds = topic.questions.map((q) => q.id);

  const user = await prisma.user.create({
    data: { email: "tester@example.com", passwordHash: "irrelevant" },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  mockUserId.value = userId;
  await prisma.userQuestionStatus.deleteMany();
  await prisma.userProgress.deleteMany();
});

describe("POST /api/signup", () => {
  it("creates a user and lowercases the email", async () => {
    const res = await signup(
      jsonRequest("http://test/api/signup", {
        email: "New.User@Example.com",
        password: "supersecret",
        name: "New User",
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe("new.user@example.com");
    const dbUser = await prisma.user.findUnique({ where: { email: "new.user@example.com" } });
    expect(dbUser?.passwordHash).toBeTruthy();
    expect(dbUser?.passwordHash).not.toBe("supersecret"); // stored hashed, never plaintext
  });

  it("rejects duplicate emails with 409", async () => {
    const res = await signup(
      jsonRequest("http://test/api/signup", { email: "tester@example.com", password: "supersecret" })
    );
    expect(res.status).toBe(409);
  });

  it("rejects short passwords with 400", async () => {
    const res = await signup(
      jsonRequest("http://test/api/signup", { email: "x@example.com", password: "short" })
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/questions/[id]/status", () => {
  it("requires auth", async () => {
    mockUserId.value = null;
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[0] })
    );
    expect(res.status).toBe(401);
  });

  it("404s on unknown question", async () => {
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: "does-not-exist" })
    );
    expect(res.status).toBe(404);
  });

  it("rejects invalid statuses", async () => {
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "BANANA" }),
      params({ id: questionIds[0] })
    );
    expect(res.status).toBe(400);
  });

  it("marking a question solved updates topic progress", async () => {
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[0] })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("SOLVED");
    expect(data.topic.solvedQuestions).toBe(1);
    expect(data.topic.totalQuestions).toBe(2);
    expect(data.topic.status).toBe("IN_PROGRESS");

    const progress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
    expect(progress?.status).toBe("IN_PROGRESS");
  });

  it("solving everything + theory read completes the topic", async () => {
    await setTopicProgress(
      jsonRequest("http://test", { theoryRead: true }),
      params({ slug: "test-topic" })
    );
    await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[0] })
    );
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[1] })
    );
    const data = await res.json();
    expect(data.topic.status).toBe("DONE");
  });

  it("re-marking a solved question as needs-review downgrades progress", async () => {
    await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[0] })
    );
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "NEEDS_REVIEW" }),
      params({ id: questionIds[0] })
    );
    const data = await res.json();
    expect(data.topic.solvedQuestions).toBe(0);
  });

  it("schedules a review date with reviewDays", async () => {
    const before = Date.now();
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "NEEDS_REVIEW", reviewDays: 3 }),
      params({ id: questionIds[0] })
    );
    const data = await res.json();
    const reviewAt = new Date(data.nextReviewAt).getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    expect(reviewAt).toBeGreaterThanOrEqual(before + threeDays - 5000);
    expect(reviewAt).toBeLessThanOrEqual(Date.now() + threeDays + 5000);
  });

  it("clears the review date when reviewDays is omitted", async () => {
    await setQuestionStatus(
      jsonRequest("http://test", { status: "NEEDS_REVIEW", reviewDays: 3 }),
      params({ id: questionIds[0] })
    );
    const res = await setQuestionStatus(
      jsonRequest("http://test", { status: "SOLVED" }),
      params({ id: questionIds[0] })
    );
    const data = await res.json();
    expect(data.nextReviewAt).toBeNull();
  });
});

describe("POST /api/topics/[slug]/progress", () => {
  it("requires auth", async () => {
    mockUserId.value = null;
    const res = await setTopicProgress(
      jsonRequest("http://test", { theoryRead: true }),
      params({ slug: "test-topic" })
    );
    expect(res.status).toBe(401);
  });

  it("404s on unknown topic", async () => {
    const res = await setTopicProgress(
      jsonRequest("http://test", { theoryRead: true }),
      params({ slug: "nope" })
    );
    expect(res.status).toBe(404);
  });

  it("rejects a non-boolean payload", async () => {
    const res = await setTopicProgress(
      jsonRequest("http://test", { theoryRead: "yes" }),
      params({ slug: "test-topic" })
    );
    expect(res.status).toBe(400);
  });

  it("marking theory read sets IN_PROGRESS and 50%", async () => {
    const res = await setTopicProgress(
      jsonRequest("http://test", { theoryRead: true }),
      params({ slug: "test-topic" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("IN_PROGRESS");
    expect(data.completionPercent).toBe(50);
  });

  it("unmarking theory reverts progress", async () => {
    await setTopicProgress(
      jsonRequest("http://test", { theoryRead: true }),
      params({ slug: "test-topic" })
    );
    const res = await setTopicProgress(
      jsonRequest("http://test", { theoryRead: false }),
      params({ slug: "test-topic" })
    );
    const data = await res.json();
    expect(data.status).toBe("NOT_STARTED");
    expect(data.completionPercent).toBe(0);
  });
});
