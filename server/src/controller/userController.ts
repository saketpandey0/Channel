import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { v4 as uuidv4 } from "uuid";
import { COOKIE_MAX_AGE } from "../consts"
import userValidation from "../validators/userValidation";
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'
import { email, includes } from "zod";
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';



const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.APP_PASSWORD,
  },
});


export const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { success } = userValidation.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email },
    })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        username: req.body.username || email.split('@')[0] + uuidv4().slice(0, 5),
        name: req.body.displayName || email.split('@')[0],
        bio: req.body.bio || '',
        provider: req.body.provider || 'EMAIL',
        avatar: req.body.avatar || '',
      },
    });

    const verificationToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Verify your email",
      text: `Your verification token is: ${verificationToken}`,
      html: `<p>Click the link to verify your email:</p>
            <a href="http://localhost:3000/api/auth/verify-email/${verificationToken}">Verify Email</a>`,
    };
    await transporter.sendMail(mailOptions);

    const payload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role || "READER",
    };

    req.session.user = payload;
    const accessToken = jwt.sign({ payload }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ payload }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });

    res
      .status(201)
      .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: COOKIE_MAX_AGE })
      .header('Authorization', accessToken)
      .json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const loginUser = async (req: Request, res: Response): Promise<any> => {
  console.log('Login request body:', req.body);
  const { success } = userValidation.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "User has not set a password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role || "READER",
    };

    req.session.user = payload;
    const accessToken = jwt.sign({ payload }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ payload }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getCurrentUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.session.user || req.user;
    console.log("Current user from session:", req.session.user);
    console.log("Current user from req.user:", req.user);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    console.log("username: ",user.username)
    return res.json({ user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  console.log("function called")
  const username = req.params;
  console.log("Fetching profile for username:", username);
  try {
    const user = await prisma.user.findUnique({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  const userId = req.session?.user?.userId || req.user?.userId ;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const {success, data} = req.body;
  if(!success){
    return res.status(400).json({error: "Invalid profile data"});
  }
  const {name, bio, avatar} = data;
  try {
    await prisma.user.update({
      where: {id: userId},
      data: {
        name,
        bio,
        avatar
      }
    });
    res.status(200).json({message: "Profile updated successfully"});
  } catch(err){
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
}


export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;

  try {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }

      req.session.destroy(async (err) => {
        if (err) {
          console.error("Failed to destroy session:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }

        try {
          if (refreshToken) {
            await prisma.refreshToken.deleteMany({
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
        } catch (dbErr) {
          console.error("Error clearing refresh token:", dbErr);
          return res.status(500).json({ error: "Failed to logout" });
        }
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { user: string };

    const newAccessToken = jwt.sign({ user: decoded.user }, JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', newAccessToken).json({ user: decoded.user });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
}


export const forgetPassword = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: [email],
      subject: "Password Reset",
      html: `<p>You requested a password reset. Click below to reset it:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};


export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    });

    res.send("Email verified successfully!");
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};


export const resendVerification = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: [email],
    subject: "Verify your email",
    html: `<p>Click to verify your email:</p>
           <a href="http://localhost:3000/api/auth/verify-email/${token}">Verify Email</a>`,
  };
  await transporter.sendMail(mailOptions);

  res.json({ message: "Verification email sent" });
};
