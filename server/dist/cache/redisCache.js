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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.cache = exports.RedisCache = void 0;
const ioredis_1 = require("ioredis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
class RedisCache {
    constructor() {
        this.client = new ioredis_1.Redis(redisUrl);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisCache();
        }
        return this.instance;
    }
    set(type, args, value, expirySeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(type, args);
            if (expirySeconds) {
                yield this.client.set(key, JSON.stringify(value), 'EX', expirySeconds);
            }
            else {
                yield this.client.set(key, JSON.stringify(value));
            }
        });
    }
    get(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(type, args);
            const value = yield this.client.get(key);
            return value ? JSON.parse(value) : null;
        });
    }
    evict(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(type, args);
            yield this.client.del(key);
            return null;
        });
    }
    generateKey(type, args) {
        return `${type}:${args.join(':')}`;
    }
    //bulk methods
    mget(type, argsList) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = argsList.map(args => this.generateKey(type, args));
            const values = yield this.client.mget(...keys);
            return values.map(value => value ? JSON.parse(value) : null);
        });
    }
    evictPattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this.client.keys(pattern);
            if (keys.length > 0) {
                return yield this.client.del(...keys);
            }
            return 0;
        });
    }
    increament(type_1, args_1) {
        return __awaiter(this, arguments, void 0, function* (type, args, amount = 1) {
            const key = this.generateKey(type, args);
            return yield this.client.incrby(key, amount);
        });
    }
    decrement(type_1, args_1) {
        return __awaiter(this, arguments, void 0, function* (type, args, amount = 1) {
            const key = this.generateKey(type, args);
            return yield this.client.decrby(key, amount);
        });
    }
    exists(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(type, args);
            return (yield this.client.exists(key)) === 1;
        });
    }
    ttl(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.generateKey(type, args);
            return yield this.client.ttl(key);
        });
    }
    keys(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.keys(pattern);
        });
    }
    flushall() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.flushall();
        });
    }
    getClient() {
        return this.client;
    }
}
exports.RedisCache = RedisCache;
exports.cache = RedisCache.getInstance();
exports.redis = exports.cache.getClient();
