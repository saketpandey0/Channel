import "express-session";

declare module "express-session"{
    interface SessionData {
        user?: {
            userId: string;
            name: string;
            email: string;
            role: "user" | "admin";
        };      
        views: number;
    }
}