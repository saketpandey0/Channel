"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateValidation = void 0;
const zod_1 = require("zod");
const userValidation = zod_1.z.object({
    email: zod_1.z.string().email().regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, "Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
});
exports.default = userValidation;
exports.profileUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
    bio: zod_1.z.string().max(150, "Bio must be less than 150 characters").optional(),
    location: zod_1.z.string().max(100, "Location must be less than 100 characters").optional(),
    website: zod_1.z.string().url("Please enter a valid URL").optional().or(zod_1.z.literal("")),
    avatar: zod_1.z.string().optional(),
});
