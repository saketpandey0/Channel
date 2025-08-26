"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const userValidation = zod_1.z.object({
    email: zod_1.z.string().email().regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, "Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
});
exports.default = userValidation;
