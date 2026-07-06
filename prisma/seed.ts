import { PrismaClient } from "@prisma/client";
import { seedTopics } from "../data/seed-data";

const prisma = new PrismaClient();

async function main() {
  for (const topic of seedTopics) {
    const { questions, ...topicData } = topic;
    const dbTopic = await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: topicData,
      update: topicData,
    });
    for (const question of questions) {
      const { slug, ...questionData } = question;
      await prisma.question.upsert({
        where: { slug },
        create: {
          slug,
          ...questionData,
          sourceUrl: question.sourceUrl ?? null,
          order: questions.indexOf(question),
          topicId: dbTopic.id,
        },
        update: {
          ...questionData,
          sourceUrl: question.sourceUrl ?? null,
          order: questions.indexOf(question),
          topicId: dbTopic.id,
        },
      });
    }
  }
  const topicCount = await prisma.topic.count();
  const questionCount = await prisma.question.count();
  console.log(`Seeded ${topicCount} topics and ${questionCount} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
