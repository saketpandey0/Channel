"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const authenticate = (req, res, next) => {
    var _a, _b, _c, _d, _e;
    console.log('Auth middleware - Session user:', (_a = req.session) === null || _a === void 0 ? void 0 : _a.user);
    console.log('Auth middleware - Passport user:', req.user);
    console.log('Auth middleware - Session ID:', req.sessionID);
    // First check session data (most reliable for your app)
    if ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.userId) {
        console.log('Using session authentication for user:', req.session.user.userId);
        req.user = req.session.user;
        return next();
    }
    // Then check JWT tokens
    const authHeader = req.headers['authorization'];
    const accessToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    const refreshToken = (_d = req.cookies) === null || _d === void 0 ? void 0 : _d.refreshToken;
    console.log('Auth header:', authHeader);
    console.log('Access token present:', !!accessToken);
    console.log('Refresh token present:', !!refreshToken);
    if (!accessToken && !refreshToken) {
        console.log('No tokens provided');
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }
    // Try access token first
    if (accessToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET);
            console.log('Access token decoded:', decoded);
            // Handle both payload structures
            const user = decoded.payload || decoded.user || decoded;
            req.user = user;
            // Sync with session if not already set
            if (!((_e = req.session) === null || _e === void 0 ? void 0 : _e.user)) {
                req.session.user = user;
            }
            return next();
        }
        catch (err) {
            console.log('Access token invalid:', err);
            // Continue to try refresh token
        }
    }
    // Try refresh token
    if (refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
            console.log('Refresh token decoded:', decoded);
            // Handle both payload structures
            const user = decoded.payload || decoded.user || decoded;
            // Generate new access token
            const newAccessToken = jsonwebtoken_1.default.sign({ payload: user }, JWT_SECRET, { expiresIn: '1h' });
            res.header('Authorization', `Bearer ${newAccessToken}`);
            req.user = user;
            // Sync with session
            req.session.user = user;
            return next();
        }
        catch (err) {
            console.log('Refresh token invalid:', err);
            return res.status(403).json({ error: 'Invalid or expired refresh token.' });
        }
    }
    return res.status(401).json({ error: 'Unauthorized.' });
};
exports.authenticate = authenticate;
// Optional middleware for routes that don't require authentication
const optionalAuth = (req, res, next) => {
    var _a, _b, _c, _d;
    // Check session first
    if ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) {
        req.user = req.session.user;
        return next();
    }
    // Check JWT tokens without failing if not present
    const authHeader = req.headers['authorization'];
    const accessToken = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
    const refreshToken = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken;
    if (accessToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET);
            const user = decoded.payload || decoded.user || decoded;
            req.user = user;
            if (!((_d = req.session) === null || _d === void 0 ? void 0 : _d.user)) {
                req.session.user = user;
            }
        }
        catch (err) {
            // Ignore token errors for optional auth
        }
    }
    else if (refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
            const user = decoded.payload || decoded.user || decoded;
            const newAccessToken = jsonwebtoken_1.default.sign({ payload: user }, JWT_SECRET, { expiresIn: '1h' });
            res.header('Authorization', `Bearer ${newAccessToken}`);
            req.user = user;
            req.session.user = user;
        }
        catch (err) {
            // Ignore token errors for optional auth
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
