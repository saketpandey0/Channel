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
exports.resendVerification = exports.verifyEmail = exports.resetPassword = exports.forgetPassword = exports.refreshToken = exports.logoutUser = exports.updateUserProfile = exports.getUserProfile = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
const consts_1 = require("../consts");
const userValidation_1 = __importDefault(require("../validators/userValidation"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.APP_PASSWORD,
    },
});
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = userValidation_1.default.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const existingUser = yield db_1.default.user.findFirst({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const saltRounds = 10;
        const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
        const user = yield db_1.default.user.create({
            data: {
                id: (0, uuid_1.v4)(),
                email,
                password: hashedPassword,
                username: req.body.username || email.split('@')[0] + (0, uuid_1.v4)().slice(0, 5),
                name: req.body.displayName || email.split('@')[0],
                bio: req.body.bio || '',
                provider: req.body.provider || 'EMAIL',
                avatar: req.body.avatar || '',
            },
        });
        const verificationToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: "Verify your email",
            text: `Your verification token is: ${verificationToken}`,
            html: `<p>Click the link to verify your email:</p>
            <a href="http://localhost:3000/api/auth/verify-email/${verificationToken}">Verify Email</a>`,
        };
        yield transporter.sendMail(mailOptions);
        const payload = {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "READER",
        };
        req.session.user = payload;
        const accessToken = jsonwebtoken_1.default.sign({ payload }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ payload }, JWT_SECRET, { expiresIn: consts_1.COOKIE_MAX_AGE });
        res
            .status(201)
            .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: consts_1.COOKIE_MAX_AGE })
            .header('Authorization', accessToken)
            .json({ user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Login request body:', req.body);
    const { success } = userValidation_1.default.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const user = yield db_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (!user.password) {
            return res.status(400).json({ error: "User has not set a password" });
        }
        const passwordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const payload = {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "READER",
        };
        req.session.user = payload;
        const accessToken = jsonwebtoken_1.default.sign({ payload }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ payload }, JWT_SECRET, { expiresIn: consts_1.COOKIE_MAX_AGE });
        res
            .status(200)
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .header('Authorization', `Bearer ${accessToken}`)
            .json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'READER'
            },
            message: "Login successful"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginUser = loginUser;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.session.user || req.user;
        if (!user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        return res.json({ user: user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getCurrentUser = getCurrentUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("function called");
    const username = req.params;
    console.log("Fetching profile for username:", username);
    try {
        const user = yield db_1.default.user.findUnique({
            where: { username: username.username },
            select: {
                id: true,
                name: true,
                bio: true,
                avatar: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
    if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    const { success, data } = req.body;
    if (!success) {
        return res.status(400).json({ error: "Invalid profile data" });
    }
    const { name, bio, avatar } = data;
    try {
        yield db_1.default.user.update({
            where: { id: userId },
            data: {
                name,
                bio,
                avatar
            }
        });
        res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateUserProfile = updateUserProfile;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    try {
        req.logout((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ error: "Failed to logout" });
            }
            req.session.destroy((err) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.error("Failed to destroy session:", err);
                    return res.status(500).json({ error: "Failed to logout" });
                }
                try {
                    if (refreshToken) {
                        yield db_1.default.refreshToken.deleteMany({
                            where: { token: refreshToken },
                        });
                    }
                    res.clearCookie("connect.sid", {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                        path: "/",
                    });
                    res.clearCookie("refreshToken", {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                        path: "/",
                    });
                    return res.status(200).json({ message: "Logged out successfully" });
                }
                catch (dbErr) {
                    console.error("Error clearing refresh token:", dbErr);
                    return res.status(500).json({ error: "Failed to logout" });
                }
            }));
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.logoutUser = logoutUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ user: decoded.user }, JWT_SECRET, { expiresIn: '1h' });
        res.header('Authorization', newAccessToken).json({ user: decoded.user });
    }
    catch (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
});
exports.refreshToken = refreshToken;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        const user = yield db_1.default.user.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: [email],
            subject: "Password Reset",
            html: `<p>You requested a password reset. Click below to reset it:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>`,
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset link sent to your email" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.forgetPassword = forgetPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield db_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield db_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return res.json({ message: "Password reset successful" });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Invalid or expired token" });
    }
});
exports.resetPassword = resetPassword;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        yield db_1.default.user.update({
            where: { id: decoded.userId },
            data: { isVerified: true },
        });
        res.send("Email verified successfully!");
    }
    catch (err) {
        res.status(400).json({ error: "Invalid or expired token" });
    }
});
exports.verifyEmail = verifyEmail;
const resendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield db_1.default.user.findUnique({ where: { email } });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    if (user.isVerified)
        return res.status(400).json({ message: "Email already verified" });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: [email],
        subject: "Verify your email",
        html: `<p>Click to verify your email:</p>
           <a href="http://localhost:3000/api/auth/verify-email/${token}">Verify Email</a>`,
    };
    yield transporter.sendMail(mailOptions);
    res.json({ message: "Verification email sent" });
});
exports.resendVerification = resendVerification;
