import "express";

declare global {
  namespace Express {
    interface User {
      userId: string;
      name?: string;
      email: string;
      role?: "READER" | "WRITER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN";
    }
  }
}
