"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const authenticate = (req, res, next) => {
    var _a, _b, _c;
    if (req.session && ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId)) {
        req.user = req.session.user;
        return next();
    }
    const authHeader = req.headers['authorization'];
    const accessToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    const refreshToken = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken;
    if (!accessToken && !refreshToken) {
        return res.status(401).send('Access Denied. No token provided.');
    }
    if (accessToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET);
            req.user = decoded;
            return next();
        }
        catch (err) {
            return res.status(403).send('Invalid or expired access token.');
        }
    }
    if (refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
            const newAccessToken = jsonwebtoken_1.default.sign({ user: decoded }, JWT_SECRET, { expiresIn: '1h' });
            res.header('Authorization', `Bearer ${newAccessToken}`);
            req.user = decoded;
            return next();
        }
        catch (err) {
            return res.status(403).send('Invalid or expired refresh token.');
        }
    }
    return res.status(401).send('Unauthorized.');
};
exports.authenticate = authenticate;
