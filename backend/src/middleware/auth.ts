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
    // For demo simplicity, allow dev default user header if token is absent
    const devUserId = req.headers['x-dev-user-id'];
    if (devUserId) {
      req.user = {
        id: Number(devUserId),
        username: String(req.headers['x-dev-username'] || 'user'),
        user_type: (req.headers['x-dev-role'] as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE',
        store_id: Number(req.headers['x-dev-store-id'] || 1)
      };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
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
