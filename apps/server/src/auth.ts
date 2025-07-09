import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { v4 as uuidv4} from "uuid";
import { COOKIE_MAX_AGE } from "./consts";


const router = Router();


interface UserPayload {
    email: string;
    id: string;
}

router.post('signup', registerUser);
