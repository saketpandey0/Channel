"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const commentValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, "Comment content is required"),
    parentId: zod_1.z.string().optional(),
});
exports.default = commentValidation;
