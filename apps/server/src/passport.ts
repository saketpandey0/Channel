import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import { prisma } from '@repo/db';

interface GithubEmailRes {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'private' | 'public';
}

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export function initPassport() {
  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GITHUB_CLIENT_ID ||
    !GITHUB_CLIENT_SECRET
  ) {
    throw new Error(
      'Missing environment variables for authentication providers',
    );
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) {
        try {
          const user = await prisma.user.upsert({
            create: {
              email: profile.emails[0].value,
              name: profile.displayName,
              username: profile.emails[0].value.split('@')[0],
              password: '',
              provider: 'GOOGLE',
              bio: profile._json?.bio || '',
              avatar: profile.photos?.[0]?.value || profile._json?.picture || '',
            },
            update: {
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value || profile._json?.picture || '',
            },
            where: {
              email: profile.emails[0].value,
            },
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );

  passport.use(
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) {
        try {
          const res = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `token ${accessToken}`,
              'User-Agent': 'your-app-name',
            },
          });
          
          if (!res.ok) {
            throw new Error('Failed to fetch GitHub emails');
          }

          const data: GithubEmailRes[] = await res.json();
          const primaryEmail = data.find((item) => item.primary === true);

          if (!primaryEmail) {
            throw new Error('No primary email found');
          }

          const user = await prisma.user.upsert({
            create: {
              email: primaryEmail.email,
              name: profile.displayName || profile.username,
              username: primaryEmail.email.split('@')[0],
              password: '',
              provider: 'GITHUB',
              bio: profile._json?.bio || '',
              avatar: profile.photos?.[0]?.value || profile._json?.avatar_url || '',
            },
            update: {
              name: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value || profile._json?.avatar_url || '',
            },
            where: {
              email: primaryEmail.email,
            },
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );

  passport.serializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.avatar || user.picture,
      });
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
}