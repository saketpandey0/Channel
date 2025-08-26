"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redisInstance = null;
const getRedisClient = () => {
    if (!redisInstance) {
        redisInstance = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379");
        redisInstance.on("connect", () => console.log("Connected to Redis"));
        redisInstance.on("error", (err) => console.error(" Redis Error", err));
    }
    return redisInstance;
};
exports.getRedisClient = getRedisClient;
