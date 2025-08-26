"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const publicationValidation = zod_1.z.object({
    name: zod_1.z.string().min(4, "Publication name is required"),
    description: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
    coverImage: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    twitter: zod_1.z.string().optional(),
    facebook: zod_1.z.string().optional(),
    linkedin: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    hasNewsletter: zod_1.z.boolean().optional(),
    allowSubmissions: zod_1.z.boolean().optional(),
    requireApproval: zod_1.z.boolean().optional(),
});
exports.default = publicationValidation;
