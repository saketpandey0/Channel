"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = require("./passport");
const passport_2 = __importDefault(require("passport"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Authorization'],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ limit: "5mb", extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.COOKIE_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
        maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    rolling: true,
}));
(0, passport_1.initPassport)();
app.use(passport_2.default.initialize());
app.use(passport_2.default.session());
app.use('/api', routes_1.default);
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
