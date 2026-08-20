import { Response } from 'express';
import { memoryData, Store } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';
import { PnlService } from '../services/pnlService.js';

export const getStores = (req: AuthRequest, res: Response) => {
  const scope = req.storeScope!;
  const stores = memoryData.stores.filter(s => s.company_id === scope.companyId && scope.allowedStoreIds.includes(s.id));
  return res.json(stores);
};

export const getStoreById = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const scope = req.storeScope!;

  if (!scope.allowedStoreIds.includes(id)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized store context' });
  }

  const store = memoryData.stores.find(s => s.id === id && s.company_id === scope.companyId);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  const assignedEmployees = memoryData.employees.filter(e => e.store_id === store.id);
  const assignedFleet = memoryData.vehicles.filter(v => v.current_store_id === store.id || v.store_id === store.id);
  const pnl = PnlService.getStorePnl(scope.companyId, store.id, scope.allowedStoreIds);

  return res.json({
    store,
    assigned_employees_count: assignedEmployees.length,
    assigned_fleet_count: assignedFleet.length,
    pnl
  });
};

export const createStore = (req: AuthRequest, res: Response) => {
  const { name, code, city, address, phone, email, operating_hours, currency, initial_cash_float, manager_user_id } = req.body;
  const companyId = req.storeScope!.companyId;

  const newStore: Store = {
    id: Date.now(),
    company_id: companyId,
    name: name || 'New Branch Store',
    code: code || `STR-${Math.floor(100 + Math.random() * 900)}`,
    city: city || 'Málaga',
    address: address || 'Main Commercial St',
    phone: phone || '+34 952 000 111',
    email: email || 'store@qqbikes.com',
    operating_hours: operating_hours || '09:00 - 21:00',
    currency: currency || 'EUR',
    manager_user_id: manager_user_id ? Number(manager_user_id) : null,
    manager_employee_id: null,
    is_active: true,
    initial_cash_float: Number(initial_cash_float || 150),
    created_at: new Date().toISOString(),
    updated_at: null
  };

  memoryData.stores.push(newStore);

  // Automatically assign creating admin to the new store
  memoryData.user_store_assignments.push({
    id: Date.now() + 1,
    company_id: companyId,
    user_id: req.user?.id || 1,
    store_id: newStore.id,
    role: 'ADMIN',
    permissions: ['stores.view', 'stores.update', 'employees.view', 'fleet.view', 'rentals.create', 'expenses.manage', 'cash.manage'],
    created_at: new Date().toISOString()
  });

  return res.status(201).json(newStore);
};

export const updateStore = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const scope = req.storeScope!;

  if (!scope.allowedStoreIds.includes(id)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized store context' });
  }

  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  if (req.body.name) store.name = req.body.name;
  if (req.body.code) store.code = req.body.code;
  if (req.body.city) store.city = req.body.city;
  if (req.body.address) store.address = req.body.address;
  if (req.body.phone) store.phone = req.body.phone;
  if (req.body.email) store.email = req.body.email;
  if (req.body.operating_hours) store.operating_hours = req.body.operating_hours;
  if (req.body.currency) store.currency = req.body.currency;
  if (req.body.manager_user_id !== undefined) store.manager_user_id = req.body.manager_user_id ? Number(req.body.manager_user_id) : null;
  if (req.body.initial_cash_float !== undefined) store.initial_cash_float = Number(req.body.initial_cash_float);
  store.updated_at = new Date().toISOString();

  return res.json({ message: 'Store profile updated successfully', store });
};

export const setStoreStatus = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  store.is_active = Boolean(is_active);
  store.updated_at = new Date().toISOString();

  return res.json({ message: `Store status set to ${store.is_active ? 'ACTIVE' : 'INACTIVE'}`, store });
};

export const deleteStore = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  store.is_active = false;
  store.updated_at = new Date().toISOString();
  return res.json({ message: 'Store deactivated successfully', store });
};

export const getStorePnl = (req: AuthRequest, res: Response) => {
  const idParam = req.params.id;
  const scope = req.storeScope!;
  const storeId = idParam === 'all' || !idParam ? scope.activeStoreId : Number(idParam);

  if (storeId !== null && !scope.allowedStoreIds.includes(storeId)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized store context' });
  }

  const from = req.query.from as string;
  const to = req.query.to as string;

  const pnl = PnlService.getStorePnl(scope.companyId, storeId, scope.allowedStoreIds, from, to);
  return res.json(pnl);
};
