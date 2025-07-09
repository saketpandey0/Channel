import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { v4 as uuidv4} from "uuid";
import { COOKIE_MAX_AGE } from "../consts"
import userValidation from "@repo/zod/userValidation";
import bcrypt from 'bcryptjs';
import { captureRejectionSymbol } from "events";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';



export const registerUser = async (req: Request, res: Response): Promise<any> =>  {
    const {success} = userValidation.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const {email, password} = req.body;
    console.log(req.body);

    try {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      })
      if(existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = await prisma.user.create({
          data: {
              id: uuidv4(),
              email,
              password: hashedPassword,
              name: email.split('@')[0], 
              bio: req.body.bio || '',
              image: req.body.image || '',
              provider: req.body.provider ||'local',
          },
      });
      req.session.id = user.id;
      const accessToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ user: user.id }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });
      res
        .status(201)
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: COOKIE_MAX_AGE })
        .header('Authorization', accessToken)
        .json({ user });
    }catch(err){
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
}



export const loginUser = async (req: Request, res: Response): Promise<any> =>  {
    const {success} = userValidation.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const {email, password} = req.body;
    console.log(req.body);

    try {
      const user = await prisma.user.findFirst({
        where: { email },
      })
      if(!user) {
        return res.status(400).json({ error: "User already exists" });
      }
      const parasedValidation = await bcrypt.compare(password, user.password)
      if(!parasedValidation) {
        return res.status(400).json({ error: "Invalid password" });
      }      
      req.session.id = user.id;
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
    }catch(err){
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  try{
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { user: string };

    const newAccessToken = jwt.sign({ user: decoded.user }, JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', newAccessToken).json({ user: decoded.user });
  }catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
}