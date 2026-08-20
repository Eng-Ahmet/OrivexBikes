import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { memoryData } from '../db/initSchema.js';
import { JWT_SECRET, AuthRequest } from '../middleware/auth.js';

export const loginUser = (req: Request, res: Response) => {
  const { username, role, store_id } = req.body;

  let user = memoryData.users.find(u => u.username === username || u.user_type === role);

  if (!user) {
    user = {
      id: Date.now(),
      company_id: 1,
      store_id: store_id ? Number(store_id) : 1,
      user_type: role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
      username: username || (role === 'ADMIN' ? 'admin' : 'employee'),
      email: `${role || 'user'}@qqbikes.com`,
      first_name: role === 'ADMIN' ? 'Carlos' : 'Sofia',
      last_name: role === 'ADMIN' ? 'Admin' : 'Employee',
      phone: '+34 600 000 000',
      is_active: true
    };
  }

  if (store_id) {
    user.store_id = Number(store_id);
  }

  const store = memoryData.stores.find(s => s.id === user?.store_id);
  user.store_name = store?.name || 'Málaga Beach Campsite Store';

  const token = jwt.sign(
    { id: user.id, username: user.username, user_type: user.user_type, store_id: user.store_id, store_name: user.store_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name,
      store_id: user.store_id,
      store_name: user.store_name
    }
  });
};

export const verifyPin = (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN code is required' });

  const user = memoryData.users.find(u => u.pin_hash === String(pin) && u.is_active);
  if (!user) {
    return res.status(401).json({ error: 'Invalid PIN code. Access denied.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, user_type: user.user_type, store_id: user.store_id, store_name: user.store_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    valid: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      store_id: user.store_id
    }
  });
};

export const listUsers = (req: AuthRequest, res: Response) => {
  return res.json(memoryData.users);
};

export const getMe = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const user = memoryData.users.find(u => u.id === req.user?.id || u.username === req.user?.username);
  if (user) {
    return res.json({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      store_id: user.store_id
    });
  }
  return res.json(req.user);
};

