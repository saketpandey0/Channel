"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const storyValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    subtitle: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1, "Content is required"),
    excerpt: zod_1.z.string().optional(),
    coverImage: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    publicationId: zod_1.z.string().optional(),
    isPremium: zod_1.z.boolean().optional(),
    allowComments: zod_1.z.boolean().optional(),
    allowClaps: zod_1.z.boolean().optional(),
    mediaIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.default = storyValidation;
