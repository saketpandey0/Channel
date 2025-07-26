import { PrismaClient } from '../generated/prisma'; // adjust if path differs
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const passwordHash = await bcrypt.hash('testpassword123', 10);
  const user = await prisma.user.create({
    data: {
      username: 'saketpandey',
      email: 'saket@example.com',
      name: 'Saket Pandey',
      password: passwordHash,
      bio: 'Just a developer exploring Prisma.',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
      isEmailVerified: true,
      location: 'India',
      website: 'https://saketsite.dev',
      twitter: 'saket_tweets',
      github: 'saketgithub',
    },
  });

  // Create a refresh token for the user
  await prisma.refreshToken.create({
    data: {
      token: 'some-refresh-token-123',
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  });

  // Create a story for the user
  await prisma.story.create({
    data: {
      slug: 'intro-to-prisma',
      title: 'Intro to Prisma ORM',
      content: 'This is a story about using Prisma in modern apps...',
      plainTextContent: 'This is a story about using Prisma...',
      excerpt: 'Learn about Prisma ORM from scratch.',
      coverImage: 'https://picsum.photos/seed/prisma/800/600',
      status: 'PUBLISHED',
      authorId: user.id,
      readTime: 5,
      wordCount: 800,
      viewCount: 100,
      clapCount: 25,
      commentCount: 3,
    },
  });
}

main()
  .then(() => {
    console.log('✅ Seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('❌ Seed error:', e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
