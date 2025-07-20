import { Router } from 'express';
import {loginUser, registerUser, refreshToken, logoutUser, forgetPassword, resetPassword, verifyEmail, resendVerification } from '../controller/userController'
import passport from 'passport';


const router = Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
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
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true, 
  }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard'); 
  }
);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: 'http://localhost:5173/auth/signin',
    session: true,
  }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);


export default router;