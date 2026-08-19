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

export const listUsers = (req: AuthRequest, res: Response) => {
  return res.json(memoryData.users);
};
