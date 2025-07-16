import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { v4 as uuidv4 } from "uuid";
import { COOKIE_MAX_AGE } from "../consts"
import userValidation from "@repo/zod/userValidation";
import bcrypt from 'bcryptjs';
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const resend = new Resend(process.env.RESEND_API_KEY || 'your_resend_api_key');


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
    const {data, error} = await resend.emails.send({
      from: "YourApp <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email",
      html: `<p>Click the link to verify your email:</p>
            <a href="http://localhost:3000/api/auth/verify-email/${verificationToken}">Verify Email</a>`,
    });
    if (error) {
      console.error("Email error:", error);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    req.session.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "READER",
    };
    const accessToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });

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
  const { success } = userValidation.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return res.status(400).json({ error: "User already exists" });
    }
    if (!user.password) {
      return res.status(400).json({ error: "User has not set a password" });
    }
    const parasedValidation = await bcrypt.compare(password, user.password)
    if (!parasedValidation) {
      return res.status(400).json({ error: "Invalid password" });
    }
    req.session.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'READER'
    };

    const accessToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });
    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .header('Authorization', accessToken)
      .json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
    });
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


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

    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset",
      html: `<p>You requested a password reset. Click below to reset it:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 15 minutes.</p>`,
    })
    if (error) {
      console.error("Email error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const resetPassword = async (req: Request, res: Response) : Promise<any> => {
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


export const verifyEmail = async (req: Request, res: Response) : Promise<any> => {
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


export const resendVerification = async (req: Request, res: Response) : Promise<any> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

  const { error } = await resend.emails.send({
    from: "YourApp <onboarding@resend.dev>",
    to: [email],
    subject: "Verify your email",
    html: `<p>Click to verify your email:</p>
           <a href="http://localhost:3000/api/auth/verify-email/${token}">Verify Email</a>`,
  });

  if (error) {
    return res.status(500).json({ error: "Failed to send verification email" });
  }

  res.json({ message: "Verification email sent" });
};
