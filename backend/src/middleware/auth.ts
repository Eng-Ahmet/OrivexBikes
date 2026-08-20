import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryData } from '../db/initSchema.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'qqbikes_super_secret_jwt_key_2026';

export interface UserStoreAssignmentScope {
  storeId: number;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'VIEW_ONLY';
  permissions: string[];
}

export interface RequestStoreScope {
  companyId: number;
  activeStoreId: number | null;
  allowedStoreIds: number[];
  assignments: UserStoreAssignmentScope[];
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    company_id?: number;
    username: string;
    user_type: 'ADMIN' | 'EMPLOYEE';
    store_id: number;
    store_name?: string;
  };
  storeScope?: RequestStoreScope;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const devUserId = req.headers['x-dev-user-id'];
    req.user = {
      id: Number(devUserId || 1),
      company_id: 1,
      username: String(req.headers['x-dev-username'] || 'miguel'),
      user_type: (req.headers['x-dev-role'] as 'ADMIN' | 'EMPLOYEE') || 'ADMIN',
      store_id: Number(req.headers['x-dev-store-id'] || 1)
    };
    return resolveStoreScope(req, res, next);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = {
        id: 1,
        company_id: 1,
        username: String(req.headers['x-dev-username'] || 'miguel'),
        user_type: (req.headers['x-dev-role'] as 'ADMIN' | 'EMPLOYEE') || 'ADMIN',
        store_id: Number(req.headers['x-dev-store-id'] || 1)
      };
      return resolveStoreScope(req, res, next);
    }
    req.user = user as AuthRequest['user'];
    if (req.user && !req.user.company_id) req.user.company_id = 1;
    resolveStoreScope(req, res, next);
  });
};

const resolveStoreScope = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id || 1;
  const companyId = req.user?.company_id || 1;

  // Resolve user store assignments
  let userAssignments = memoryData.user_store_assignments.filter(a => a.company_id === companyId && a.user_id === userId);

  // Fallback if no specific assignments defined yet (e.g. dev mode admin)
  if (userAssignments.length === 0) {
    const defaultRole = req.user?.user_type === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    const allStores = memoryData.stores.filter(s => s.company_id === companyId);
    userAssignments = allStores.map(s => ({
      id: Date.now(),
      company_id: companyId,
      user_id: userId,
      store_id: s.id,
      role: defaultRole as any,
      permissions: ['stores.view', 'employees.view', 'fleet.view', 'rentals.create', 'expenses.manage', 'cash.manage', 'attendance.clock'],
      created_at: new Date().toISOString()
    }));
  }

  const allowedStoreIds = userAssignments.map(a => a.store_id);

  // Parse X-Store-Context HTTP Header
  const headerContext = req.headers['x-store-context'];
  let activeStoreId: number | null = null;

  if (headerContext && headerContext !== 'null' && headerContext !== 'all') {
    activeStoreId = Number(headerContext);

    // Validate activeStoreId belongs to allowedStoreIds
    if (!allowedStoreIds.includes(activeStoreId)) {
      return res.status(403).json({ error: 'Access denied: Unauthorized or invalid store context' });
    }
  } else {
    // Header omitted = All-Stores Context (activeStoreId = null)
    activeStoreId = null;

    // INVARIANT 13 & HARDENING: All-Stores Write operations require an explicit authorized store context
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.path.includes('/reports') && !req.path.includes('/calculate')) {
      // Exempt login and token routes
      if (!req.path.includes('/auth') && !req.path.includes('/login')) {
        return res.status(403).json({ error: 'Access denied: Store-specific write operations require an explicit authorized store context header (X-Store-Context)' });
      }
    }
  }

  req.storeScope = {
    companyId,
    activeStoreId,
    allowedStoreIds,
    assignments: userAssignments.map(a => ({
      storeId: a.store_id,
      role: a.role,
      permissions: a.permissions || []
    }))
  };

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin authorization required' });
  }
  next();
};

export const requirePermission = (permissionKey: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.storeScope) {
      return res.status(403).json({ error: 'Access denied: No store scope resolved' });
    }

    const { activeStoreId, assignments } = req.storeScope;

    if (req.user?.user_type === 'ADMIN') {
      return next(); // Admin superpass
    }

    if (activeStoreId) {
      const asn = assignments.find(a => a.storeId === activeStoreId);
      if (asn && asn.permissions.includes(permissionKey)) {
        return next();
      }
    } else {
      // Check if user has permission in any assignment
      const hasPerm = assignments.some(a => a.permissions.includes(permissionKey));
      if (hasPerm) return next();
    }

    return res.status(403).json({ error: `Access denied: Missing required permission [${permissionKey}]` });
  };
};

