import { Response } from 'express';
import { memoryData, Shift, CashMovement } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCurrentShift = (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  
  if (currentShift) {
    const cashRentals = memoryData.contracts
      .filter(c => c.store_id === storeId && c.payment_method === 'CASH' && new Date(c.created_at) >= new Date(currentShift.start_time))
      .reduce((sum, c) => sum + c.rental_fee + c.extra_charges, 0);

    const withdrawals = (currentShift.cash_movements || [])
      .filter(m => m.type === 'WITHDRAWAL')
      .reduce((sum, m) => sum + m.amount, 0);

    currentShift.total_cash_rentals = cashRentals;
    currentShift.total_withdrawals = withdrawals;
    currentShift.expected_cash = currentShift.opening_cash + cashRentals - withdrawals;
  }

  return res.json(currentShift || null);
};

export const getShiftHistory = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const shifts = memoryData.shifts.filter(s => s.store_id === storeId);
  return res.json(shifts);
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
    total_cash_rentals: 0,
    total_withdrawals: 0,
    expected_cash: Number(opening_cash || 150),
    status: 'OPEN',
    cash_movements: []
  };

  memoryData.shifts.unshift(newShift);
  return res.status(201).json(newShift);
};

export const recordCashWithdrawal = (req: AuthRequest, res: Response) => {
  const { amount, reason } = req.body;
  const storeId = req.user?.store_id || 1;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) return res.status(404).json({ error: 'No active open shift found to record cash withdrawal' });

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid cash amount is required' });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Reason for cash withdrawal/expense is mandatory' });
  }

  const movement: CashMovement = {
    id: Date.now(),
    shift_id: shift.id,
    type: 'WITHDRAWAL',
    amount: Number(amount),
    reason: reason.trim(),
    performed_by: req.user?.username || 'Staff',
    created_at: new Date().toISOString()
  };

  if (!shift.cash_movements) shift.cash_movements = [];
  shift.cash_movements.push(movement);

  const withdrawals = shift.cash_movements
    .filter(m => m.type === 'WITHDRAWAL')
    .reduce((sum, m) => sum + m.amount, 0);

  shift.total_withdrawals = withdrawals;
  shift.expected_cash = shift.opening_cash + (shift.total_cash_rentals || 0) - withdrawals;

  return res.status(201).json({ message: 'Cash withdrawal recorded successfully', movement, shift });
};

export const closeShift = (req: AuthRequest, res: Response) => {
  const { closing_cash, notes } = req.body;
  const storeId = req.user?.store_id || 1;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) return res.status(404).json({ error: 'No active open shift found to close' });

  const cashRentals = memoryData.contracts
    .filter(c => c.store_id === storeId && c.payment_method === 'CASH' && new Date(c.created_at) >= new Date(shift.start_time))
    .reduce((sum, c) => sum + c.rental_fee + c.extra_charges, 0);

  const withdrawals = (shift.cash_movements || [])
    .filter(m => m.type === 'WITHDRAWAL')
    .reduce((sum, m) => sum + m.amount, 0);

  const expected = shift.opening_cash + cashRentals - withdrawals;
  const enteredClosing = Number(closing_cash !== undefined ? closing_cash : expected);

  shift.end_time = new Date().toISOString();
  shift.total_cash_rentals = cashRentals;
  shift.total_withdrawals = withdrawals;
  shift.closing_cash = enteredClosing;
  shift.expected_cash = expected;
  shift.discrepancy = enteredClosing - expected;
  shift.status = 'CLOSED';
  shift.notes = notes || 'Shift closed normally';

  return res.json({ message: 'Shift closed successfully', shift });
};
