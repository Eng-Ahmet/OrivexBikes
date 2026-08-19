import { Response } from 'express';
import { memoryData, Shift, CashMovement, RepairWorkOrder, RentalContract } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCurrentShift = (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const store = memoryData.stores.find(s => s.id === storeId);
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  
  if (currentShift) {
    const shiftContracts = memoryData.contracts.filter(c => 
      c.store_id === storeId && new Date(c.created_at) >= new Date(currentShift.start_time)
    );

    const cashRentals = shiftContracts
      .filter(c => c.payment_method === 'CASH')
      .reduce((sum, c) => sum + c.rental_fee + c.extra_charges, 0);

    const depositsCollected = shiftContracts.reduce((sum, c) => sum + (c.deposit_collected || 0), 0);
    const depositsRefunded = shiftContracts
      .filter(c => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.deposit_refunded || 0), 0);

    const workshopIncome = (memoryData.repair_work_orders || [])
      .filter((r: RepairWorkOrder) => r.store_id === storeId && new Date(r.created_at) >= new Date(currentShift.start_time))
      .reduce((sum: number, r: RepairWorkOrder) => sum + (r.total_price || 0), 0);

    const withdrawals = (currentShift.cash_movements || [])
      .filter(m => m.type === 'WITHDRAWAL')
      .reduce((sum, m) => sum + m.amount, 0);

    // If store initial float was updated in settings, sync base float
    const baseFloat = currentShift.opening_cash || store?.initial_cash_float || 150;

    currentShift.total_cash_rentals = cashRentals;
    currentShift.total_workshop_income = workshopIncome;
    currentShift.total_withdrawals = withdrawals;
    currentShift.expected_cash = baseFloat + cashRentals + workshopIncome - withdrawals;
    (currentShift as any).deposits_collected = depositsCollected;
    (currentShift as any).deposits_refunded = depositsRefunded;
    (currentShift as any).contracts_count = shiftContracts.length;
  }

  return res.json(currentShift || null);
};

export const getShiftHistory = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const shifts = memoryData.shifts.filter(s => s.store_id === storeId);

  const enrichedShifts = shifts.map(shift => {
    const startTime = new Date(shift.start_time);
    const endTime = shift.end_time ? new Date(shift.end_time) : new Date();

    const shiftContracts = memoryData.contracts.filter(c => {
      const cTime = new Date(c.created_at);
      return c.store_id === storeId && cTime >= startTime && cTime <= endTime;
    });

    const shiftRepairs = (memoryData.repair_work_orders || []).filter(r => {
      const rTime = new Date(r.created_at);
      return r.store_id === storeId && rTime >= startTime && rTime <= endTime;
    });

    const depositsCollected = shiftContracts.reduce((sum, c) => sum + (c.deposit_collected || 0), 0);
    const depositsRefunded = shiftContracts
      .filter(c => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.deposit_refunded || 0), 0);

    return {
      ...shift,
      deposits_collected: depositsCollected,
      deposits_refunded: depositsRefunded,
      contracts_count: shiftContracts.length,
      repairs_count: shiftRepairs.length,
      contracts_details: shiftContracts,
      repairs_details: shiftRepairs
    };
  });

  return res.json(enrichedShifts);
};

export const getWeeklySchedules = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const schedules = memoryData.schedules.filter(s => s.store_id === storeId);
  return res.json(schedules);
};

export const openShift = (req: AuthRequest, res: Response) => {
  const { opening_cash } = req.body;
  const storeId = req.user?.store_id || 1;
  const store = memoryData.stores.find(s => s.id === storeId);

  const existing = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (existing) return res.status(400).json({ error: 'A shift is already open for this store', shift: existing });

  const initialFloat = Number(opening_cash !== undefined ? opening_cash : (store?.initial_cash_float || 150));

  const newShift: Shift = {
    id: Date.now(),
    store_id: storeId,
    employee_id: req.user?.id || 1,
    employee_name: req.user?.username || 'Gustavo',
    start_time: new Date().toISOString(),
    opening_cash: initialFloat,
    total_cash_rentals: 0,
    total_workshop_income: 0,
    total_withdrawals: 0,
    expected_cash: initialFloat,
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
  shift.expected_cash = shift.opening_cash + (shift.total_cash_rentals || 0) + (shift.total_workshop_income || 0) - withdrawals;

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

  const workshopIncome = (memoryData.repair_work_orders || [])
    .filter((r: RepairWorkOrder) => r.store_id === storeId && new Date(r.created_at) >= new Date(shift.start_time))
    .reduce((sum: number, r: RepairWorkOrder) => sum + (r.total_price || 0), 0);

  const withdrawals = (shift.cash_movements || [])
    .filter(m => m.type === 'WITHDRAWAL')
    .reduce((sum, m) => sum + m.amount, 0);

  const expected = shift.opening_cash + cashRentals + workshopIncome - withdrawals;
  const enteredClosing = Number(closing_cash !== undefined ? closing_cash : expected);

  shift.end_time = new Date().toISOString();
  shift.total_cash_rentals = cashRentals;
  shift.total_workshop_income = workshopIncome;
  shift.total_withdrawals = withdrawals;
  shift.closing_cash = enteredClosing;
  shift.expected_cash = expected;
  shift.discrepancy = enteredClosing - expected;
  shift.status = 'CLOSED';
  shift.notes = notes || 'Shift closed normally';

  return res.json({ message: 'Shift closed successfully', shift });
};
