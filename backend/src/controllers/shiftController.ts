import { Response } from 'express';
import { memoryData, Shift } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCurrentShift = (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  return res.json(currentShift || null);
};

export const getWeeklySchedules = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const schedules = memoryData.schedules.filter(s => s.store_id === storeId);
  return res.json(schedules);
};

export const openShift = (req: AuthRequest, res: Response) => {
  const { opening_cash } = req.body;
  const storeId = req.user?.store_id || 1;

  const existing = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (existing) return res.status(400).json({ error: 'A shift is already open for this store', shift: existing });

  const newShift: Shift = {
    id: Date.now(),
    store_id: storeId,
    employee_id: req.user?.id || 1,
    employee_name: req.user?.username || 'Gustavo',
    start_time: new Date().toISOString(),
    opening_cash: Number(opening_cash || 150),
    status: 'OPEN'
  };

  memoryData.shifts.unshift(newShift);
  return res.status(201).json(newShift);
};

export const closeShift = (req: AuthRequest, res: Response) => {
  const { closing_cash, notes } = req.body;
  const storeId = req.user?.store_id || 1;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) return res.status(404).json({ error: 'No active open shift found to close' });

  const cashPayments = memoryData.contracts
    .filter(c => c.store_id === storeId && c.payment_method === 'CASH')
    .reduce((sum, c) => sum + c.rental_fee + c.extra_charges, 0);

  const expected = shift.opening_cash + cashPayments;
  const enteredClosing = Number(closing_cash || expected);

  shift.end_time = new Date().toISOString();
  shift.closing_cash = enteredClosing;
  shift.expected_cash = expected;
  shift.discrepancy = enteredClosing - expected;
  shift.status = 'CLOSED';
  shift.notes = notes || 'Shift closed normally';

  return res.json({ message: 'Shift closed successfully', shift });
};
