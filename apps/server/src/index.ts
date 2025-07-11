import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { prisma } from '@repo/db';
import { initPassport } from './passport';
import passport from 'passport';
import userRoute from './routes/userRoute';

const allowedHosts = process.env.ALLOWED_HOSTS 
    ? process.env.ALLOWED_HOSTS.split(',')
    : []


dotenv.config();
const app = express();
app.use(cors({
    origin: allowedHosts,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}))
app.use(cookieParser());            //Todo: {limit: '16kb'} 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.COOKIE_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(process.env.COOKIE_MAX_AGE || '3600000'),
        }
    })
)

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));

app.use('/api/v1',userRoute);


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})