"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const passport_1 = __importDefault(require("passport"));
const userController_2 = require("../controller/userController");
const router = (0, express_1.Router)();
router.post('/signup', userController_1.registerUser);
router.post('/signin', userController_1.loginUser);
router.post('/logout', userController_1.logoutUser);
router.get('/profile/:username', userController_1.getUserProfile);
router.post('/update-profile', userController_1.updateUserProfile);
router.get('/session', userController_2.getCurrentUser);
router.get('/refresh', userController_1.refreshToken);
router.post('/forgot-password', userController_1.forgetPassword);
router.post('reset-password', userController_1.resetPassword);
router.get('/verify-email/:token', userController_1.verifyEmail);
router.post('resend-verification', userController_1.resendVerification);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true,
}), (req, res) => {
    if (req.user) {
        req.session.user = {
            userId: req.user.userId,
            username: req.user.username,
            name: req.user.name || "Unknown",
            email: req.user.email,
            role: req.user.role || "READER",
        };
    }
    res.redirect('http://localhost:5173/stories');
});
router.get('/github', passport_1.default.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport_1.default.authenticate('github', {
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true,
}), (req, res) => {
    if (req.user) {
        req.session.user = {
            userId: req.user.userId,
            username: req.user.username,
            name: req.user.name || "Unknown",
            email: req.user.email,
            role: req.user.role || "READER",
        };
    }
    res.redirect('http://localhost:5173/stories');
});
exports.default = router;
