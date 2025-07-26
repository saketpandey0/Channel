"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma"); // adjust if path differs
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a test user
        const passwordHash = yield bcryptjs_1.default.hash('testpassword123', 10);
        const user = yield prisma.user.create({
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
        yield prisma.refreshToken.create({
            data: {
                token: 'some-refresh-token-123',
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            },
        });
        // Create a story for the user
        yield prisma.story.create({
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
