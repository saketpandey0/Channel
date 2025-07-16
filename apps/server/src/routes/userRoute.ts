import { Router } from 'express';
import {loginUser, registerUser, refreshToken, logoutUser, forgetPassword, resetPassword, verifyEmail, resendVerification } from '../controller/userController'
import passport from 'passport';
import { verify } from 'crypto';


const router = Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser)
router.get('/refresh', refreshToken);
router.post('/forgot-password', forgetPassword);
router.post('reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('resend-verification', resendVerification)

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true, 
  }),
  (req, res) => {
    res.redirect('/dashboard'); 
  }
);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);


export default router;