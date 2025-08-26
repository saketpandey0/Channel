import "express-session";

declare module "express-session"{
    interface SessionData {
        user?: {
            userId: string;
            name: string;
            email: string;
            role: "READER" | "EDITOR" | "ADMIN" | "WRITER" | "SUPER_ADMIN";
        };      
        views: number;
    }
}

