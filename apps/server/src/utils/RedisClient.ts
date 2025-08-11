import Redis from "ioredis";

let redisInstance: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (!redisInstance) {
        redisInstance = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

        redisInstance.on("connect", () => console.log("Connected to Redis"));
        redisInstance.on("error", (err) => console.error(" Redis Error", err));
    }
    return redisInstance;
};
