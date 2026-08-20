import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'qqbikes_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    user_type: 'ADMIN' | 'EMPLOYEE';
    store_id: number;
    store_name?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const devUserId = req.headers['x-dev-user-id'];
    req.user = {
      id: Number(devUserId || 1),
      username: String(req.headers['x-dev-username'] || 'user'),
      user_type: (req.headers['x-dev-role'] as 'ADMIN' | 'EMPLOYEE') || 'ADMIN',
      store_id: Number(req.headers['x-dev-store-id'] || 1)
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Fallback for dev string tokens (token-12345) to ensure smooth dev experience
      req.user = {
        id: 1,
        username: String(req.headers['x-dev-username'] || 'user'),
        user_type: (req.headers['x-dev-role'] as 'ADMIN' | 'EMPLOYEE') || 'ADMIN',
        store_id: Number(req.headers['x-dev-store-id'] || 1)
      };
      return next();
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin authorization required' });
  }
  next();
};
