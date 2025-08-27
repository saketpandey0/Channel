import { Router } from 'express';
import {loginUser, registerUser, refreshToken, logoutUser, forgetPassword, resetPassword, verifyEmail, resendVerification, updateUserProfile, getUserProfile } from '../controller/userController'
import passport from 'passport';
import { getCurrentUser } from '../controller/userController';

const router = Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/logout', logoutUser)
router.get('/profile/:username', getUserProfile); 
router.post('/update-profile', updateUserProfile);
router.get('/session', getCurrentUser);
router.get('/refresh', refreshToken);
router.post('/forgot-password', forgetPassword);
router.post('reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('resend-verification', resendVerification)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true, 
  }),
  (req, res) => {
    if(req.user){
      req.session.user = {
        userId: req.user.userId,
        username: req.user.username,
        name: req.user.name || "Unknown",
        email: req.user.email,
        role: req.user.role || "READER",
      };
    }
    res.redirect('http://localhost:5173/stories'); 
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true,
  }),
  (req, res) => {
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
  }
);

export default router;
