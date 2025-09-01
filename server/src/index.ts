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
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use(
    session({
        secret: process.env.COOKIE_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        name: 'connect.sid', 
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false, 
            maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
        rolling: true, 
    })
);


initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});