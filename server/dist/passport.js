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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPassport = initPassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
function initPassport() {
    if (!GOOGLE_CLIENT_ID ||
        !GOOGLE_CLIENT_SECRET ||
        !GITHUB_CLIENT_ID ||
        !GITHUB_CLIENT_SECRET) {
        throw new Error('Missing environment variables for authentication providers');
    }
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
    }, function (accessToken, refreshToken, profile, done) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const rawName = profile.displayName || ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || profile.emails[0].value.split('@')[0];
                const username = yield generateUniqueUsername(rawName);
                const user = yield db_1.default.user.upsert({
                    create: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        username: username,
                        password: '',
                        provider: 'GOOGLE',
                        bio: ((_b = profile._json) === null || _b === void 0 ? void 0 : _b.bio) || '',
                        avatar: ((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || ((_e = profile._json) === null || _e === void 0 ? void 0 : _e.picture) || '',
                    },
                    update: {
                        name: profile.displayName,
                        avatar: ((_g = (_f = profile.photos) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.value) || ((_h = profile._json) === null || _h === void 0 ? void 0 : _h.picture) || '',
                    },
                    where: {
                        email: profile.emails[0].value,
                    },
                });
                done(null, user);
            }
            catch (error) {
                done(error, null);
            }
        });
    }));
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
    }, function (accessToken, refreshToken, profile, done) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const res = yield fetch('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `token ${accessToken}`,
                        'User-Agent': 'your-app-name',
                    },
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch GitHub emails');
                }
                const data = yield res.json();
                const primaryEmail = data.find((item) => item.primary === true);
                if (!primaryEmail) {
                    throw new Error('No primary email found');
                }
                const rawName = profile.username || profile.displayName || primaryEmail.email.split('@')[0];
                const username = yield generateUniqueUsername(rawName);
                const user = yield db_1.default.user.upsert({
                    create: {
                        email: primaryEmail.email,
                        name: profile.displayName || profile.username,
                        username,
                        password: '',
                        provider: 'GITHUB',
                        bio: ((_a = profile._json) === null || _a === void 0 ? void 0 : _a.bio) || '',
                        avatar: ((_c = (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) || ((_d = profile._json) === null || _d === void 0 ? void 0 : _d.avatar_url) || '',
                    },
                    update: {
                        name: profile.displayName || profile.username,
                        avatar: ((_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || ((_g = profile._json) === null || _g === void 0 ? void 0 : _g.avatar_url) || '',
                    },
                    where: {
                        email: primaryEmail.email,
                    },
                });
                done(null, user);
            }
            catch (error) {
                done(error, null);
            }
        });
    }));
    passport_1.default.serializeUser((user, cb) => {
        var _a;
        cb(null, (_a = user.userId) !== null && _a !== void 0 ? _a : user.id);
    });
    passport_1.default.deserializeUser((id, cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield db_1.default.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    avatar: true,
                    role: true,
                },
            });
            if (!user)
                return cb(null, null);
            const expressUser = {
                userId: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
            };
            cb(null, expressUser);
        }
        catch (err) {
            cb(err);
        }
    }));
}
function generateUniqueUsername(baseName) {
    return __awaiter(this, void 0, void 0, function* () {
        let safeName = (typeof baseName === 'string' ? baseName : 'user');
        const baseUsername = safeName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15) || 'user';
        let username = baseUsername;
        let counter = 1;
        while (yield db_1.default.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        return username;
    });
}
