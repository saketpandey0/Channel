import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session?.user?.userId) {
    req.user = req.session.user.userId;
    return next();
  }

  const authHeader = req.headers['authorization'];
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { user: string };
      req.user = decoded.user;
      return next();
    } catch (err) {
        return res.status(403).send('Invalid or expired access token.');
    }
  }

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { user: string };
      const newAccessToken = jwt.sign({ user: decoded.user }, JWT_SECRET, { expiresIn: '1h' });

      res.header('Authorization', `Bearer ${newAccessToken}`);
      req.user = decoded.user;
      return next();
    } catch (err) {
      return res.status(403).send('Invalid or expired refresh token.');
    }
  }

  return res.status(401).send('Unauthorized.');
};
