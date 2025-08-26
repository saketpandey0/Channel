import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import prisma from "./db"

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
          const rawName = profile.displayName || profile.name?.givenName || profile.emails[0].value.split('@')[0];
          const username = await generateUniqueUsername(rawName);
          const user = await prisma.user.upsert({
            create: {
              email: profile.emails[0].value,
              name: profile.displayName,
              username: username,
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
          const rawName = profile.username || profile.displayName || primaryEmail.email.split('@')[0];
          const username = await generateUniqueUsername(rawName);
          const user = await prisma.user.upsert({
            create: {
              email: primaryEmail.email,
              name: profile.displayName || profile.username,
              username,
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

  passport.serializeUser((user: any, cb) => {
    cb(null, user.userId ?? user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          avatar: true,
          role: true,
        },
      });

      if (!user) return cb(null, null);

      const expressUser: Express.User = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      cb(null, expressUser);
    } catch (err) {
      cb(err);
    }
  });
}



async function generateUniqueUsername(baseName: string): Promise<string> {
  let safeName = (typeof baseName === 'string' ? baseName : 'user');

  const baseUsername = safeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15) || 'user';

  let username = baseUsername;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}
