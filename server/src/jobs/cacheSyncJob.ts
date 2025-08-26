import cron from "node-cron";
import prisma from "../db";
import { cache, redis } from "../cache/redisCache";


//min, hr, day, month, year
cron.schedule("", async ()=>{
    console.log(" flushing cache -> db ");

    const key = await redis.keys("blog:analytics:*");
})