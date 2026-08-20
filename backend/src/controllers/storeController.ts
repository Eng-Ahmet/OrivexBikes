import { Request, Response } from 'express';
import { memoryData, HistoricalCashLog } from '../db/initSchema.js';

export const getStores = (req: Request, res: Response) => {
  return res.json(memoryData.stores.filter(s => s.is_active));
};

export const createStore = (req: Request, res: Response) => {
  const { name, code, city, address, phone, initial_cash_float } = req.body;

  const newStore = {
    id: Date.now(),
    company_id: 1,
    name: name || 'New QQ Store Center',
    code: code || `STR-${Math.floor(100 + Math.random() * 900)}`,
    city: city || 'Málaga',
    address: address || 'Main Center Street',
    phone: phone || '+34 900 000 000',
    is_active: true,
    initial_cash_float: Number(initial_cash_float || 150)
  };

  memoryData.stores.push(newStore);
  return res.status(201).json(newStore);
};

export const updateStore = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store location not found' });

  if (req.body.name) store.name = req.body.name;
  if (req.body.city) store.city = req.body.city;
  if (req.body.address) store.address = req.body.address;
  if (req.body.phone) store.phone = req.body.phone;
  if (req.body.initial_cash_float !== undefined) store.initial_cash_float = Number(req.body.initial_cash_float);

  return res.json({ message: 'Store updated successfully', store });
};

export const deleteStore = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store location not found' });

  store.is_active = false;
  return res.json({ message: 'Store deactivated successfully' });
};

export const updateStoreConfig = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { initial_cash_float } = req.body;

  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store location not found' });

  if (initial_cash_float !== undefined) {
    store.initial_cash_float = Number(initial_cash_float);
  }

  return res.json({ message: 'Store cash float configuration updated successfully', store });
};

export const recordHistoricalCash = (req: Request, res: Response) => {
  const storeId = Number(req.params.id);
  const { amount, date, category, description } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid cash amount is required' });
  }

  const logEntry: HistoricalCashLog = {
    id: Date.now(),
    store_id: storeId,
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    category: category || 'Historical Revenue',
    description: description || 'Prior cash transaction entry',
    recorded_by: (req as any).user?.username || 'Admin',
    created_at: new Date().toISOString()
  };

  memoryData.historical_cash_logs.unshift(logEntry);
  return res.status(201).json({ message: 'Historical cash log recorded successfully', logEntry });
};

export const getHistoricalCashLogs = (req: Request, res: Response) => {
  const storeId = Number(req.params.id);
  const logs = memoryData.historical_cash_logs.filter(l => l.store_id === storeId);
  return res.json(logs);
};
