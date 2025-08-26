import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initPassport } from './passport';
import passport from 'passport';
import routes from './routes';


dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Authorization'],
}));

app.use(cookieParser());             
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.COOKIE_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
            maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        }
    })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', routes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});