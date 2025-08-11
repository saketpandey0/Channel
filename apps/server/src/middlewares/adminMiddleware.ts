import { Request, Response } from "express";

export const requireAdmin = (req: Request, res: Response, next: any) => {
  const userRole = req.session.user?.role;
  if (!userRole || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};