import { getUserByToken } from "@/services/user";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied' });
    }

    const token = authHeader.substring(7);
    const userId = await getUserByToken(token);
    if (!userId) return res.status(401).json({ error: 'Access denied' });

    res.locals.userId = userId;
    next();
}