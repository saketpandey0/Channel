import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";


interface ICache {
    set(type: string, args: string[], value: any, expirySeconds?: number): Promise<void>;
    get(type: string, args: string[]): Promise<any>;
    evict(type: string, args: string[]): Promise<null>;
}


export class RedisCache implements ICache {
    private client: Redis;
    private static instance: RedisCache;

    constructor() {
        this.client = new Redis(redisUrl);
    }

    static getInstance(): RedisCache {
        if (!this.instance) {
            this.instance = new RedisCache();
        }
        return this.instance;
    }


    async set(type: string, args: string[], value: any, expirySeconds?: number): Promise<void> {
        const key = this.generateKey(type, args);
        if (expirySeconds) {
            await this.client.set(key, JSON.stringify(value), 'EX', expirySeconds);
        } else {
            await this.client.set(key, JSON.stringify(value));
        }
    }

    async get(type: string, args: string[]): Promise<any> {
        const key = this.generateKey(type, args);
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async evict(type: string, args: string[]): Promise<null> {
        const key = this.generateKey(type, args);
        await this.client.del(key);
        return null;
    }

    private generateKey(type: string, args: string[]): string {
        return `${type}:${args.join(':')}`;
    }


    //bulk methods
    async mget(type: string, argsList: string[][]): Promise<any[]> {
        const keys = argsList.map(args => this.generateKey(type, args));
        const values = await this.client.mget(...keys);
        return values.map(value => value ? JSON.parse(value) : null);
    }

    async evictPattern(pattern: string): Promise<number> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            return await this.client.del(...keys);
        }
        return 0;
    }

    async increament(type: string, args: string[], amount: number = 1): Promise<number> {
        const key = this.generateKey(type, args);
        return await this.client.incrby(key, amount);
    }

    async decrement(type: string, args: string[], amount: number = 1): Promise<number> {
        const key = this.generateKey(type, args);
        return await this.client.decrby(key, amount);
    }

    async exists(type: string, args: string[]): Promise<boolean> {
        const key = this.generateKey(type, args);
        return (await this.client.exists(key)) === 1;
    }

    async ttl(type: string, args: string[]): Promise<number> {
        const key = this.generateKey(type, args);
        return await this.client.ttl(key);
    }

    async keys(pattern: string): Promise<string[]> {
        return await this.client.keys(pattern);
    }

    async flushall(): Promise<void> {
        await this.client.flushall();
    }

    public getClient(): Redis {
        return this.client;
    }
}

export const cache = RedisCache.getInstance();
export const redis = cache.getClient();

