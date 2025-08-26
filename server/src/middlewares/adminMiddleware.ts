import { Request, Response, NextFunction, RequestHandler } from 'express';

export const requireAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session.user?.role;

  if (!userRole || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
};
