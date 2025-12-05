import { getUserByToken } from "@/services/user";
import { AuthenticatedRequest } from "@/types/express";
import { NextFunction, Response } from "express";

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied' });
    }

    const token = authHeader.substring(7);
    const userId = await getUserByToken(token);
    if (!userId) return res.status(401).json({ error: 'Access denied' });

    req.userId = userId;
    next();
}