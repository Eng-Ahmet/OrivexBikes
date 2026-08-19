import { Response } from 'express';
import { memoryData, Shift, CashMovement, RepairWorkOrder } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

export const getCurrentShift = (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const store = memoryData.stores.find(s => s.id === storeId);
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  
  if (currentShift) {
    const shiftMovements: CashMovement[] = memoryData.cash_movements.filter((m: CashMovement) => m.shift_id === currentShift.id);

    const cashRentals = shiftMovements
      .filter((m: CashMovement) => m.type === 'RENTAL_PAYMENT')
      .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

    const depositsCollected = shiftMovements
      .filter((m: CashMovement) => m.type === 'DEPOSIT_COLLECTED')
      .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

    const depositsRefunded = shiftMovements
      .filter((m: CashMovement) => m.type === 'DEPOSIT_REFUNDED')
      .reduce((sum: number, m: CashMovement) => sum + Math.abs(m.amount), 0);

    const workshopIncome = shiftMovements
      .filter((m: CashMovement) => m.type === 'ADDITION' && m.reason.includes('Workshop'))
      .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

    const withdrawals = shiftMovements
      .filter((m: CashMovement) => m.type === 'WITHDRAWAL')
      .reduce((sum: number, m: CashMovement) => sum + Math.abs(m.amount), 0);

    const netCashMovement = shiftMovements.reduce((sum: number, m: CashMovement) => sum + m.amount, 0);
    const baseFloat = currentShift.opening_cash || store?.initial_cash_float || 150;

    currentShift.total_cash_rentals = cashRentals;
    currentShift.total_workshop_income = workshopIncome;
    currentShift.total_withdrawals = withdrawals;
    currentShift.expected_cash = baseFloat + netCashMovement;
    (currentShift as any).deposits_collected = depositsCollected;
    (currentShift as any).deposits_refunded = depositsRefunded;
  }

  return res.json(currentShift || null);
};

export const getShiftHistory = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const shifts = memoryData.shifts.filter(s => s.store_id === storeId);

  const enrichedShifts = shifts.map(shift => {
    const shiftMovements: CashMovement[] = memoryData.cash_movements.filter((m: CashMovement) => m.shift_id === shift.id);
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

    return {
      ...shift,
      movements: shiftMovements,
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
  const requestId = (req as any).requestId || `req-${Date.now()}`;

  // MySQL Single Open Shift Generated Column Constraint Rule
  const existing = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (existing) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'SHIFT_ALREADY_OPEN',
        message: 'A register shift is already open for this store. Close current shift before opening a new one.',
        details: { existing_shift_id: existing.id }
      },
      request_id: requestId
    });
  }

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

export const recordCashWithdrawal = (req: IdempotentRequest, res: Response) => {
  const { amount, reason } = req.body;
  const storeId = (req as any).user?.store_id || 1;
  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'No active open shift found to record cash withdrawal.' },
      request_id: requestId
    });
  }

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Valid positive cash amount is required.' },
      request_id: requestId
    });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Reason for cash withdrawal/expense is mandatory.' },
      request_id: requestId
    });
  }

  const movement: CashMovement = {
    id: Date.now(),
    shift_id: shift.id,
    type: 'WITHDRAWAL',
    amount: -Math.abs(Number(amount)), // Withdrawals subtract from cash drawer
    reason: reason.trim(),
    performed_by: (req as any).user?.username || 'Staff',
    created_by: (req as any).user?.id || 1,
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: new Date().toISOString()
  };

  memoryData.cash_movements.push(movement);
  if (!shift.cash_movements) shift.cash_movements = [];
  shift.cash_movements.push(movement);

  const netCashMovement = memoryData.cash_movements
    .filter((m: CashMovement) => m.shift_id === shift.id)
    .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

  shift.expected_cash = shift.opening_cash + netCashMovement;

  return res.status(201).json({ message: 'Cash withdrawal recorded successfully', movement, shift });
};

export const closeShift = (req: IdempotentRequest, res: Response) => {
  const { closing_cash, notes } = req.body;
  const storeId = (req as any).user?.store_id || 1;
  const requestId = req.requestId || `req-${Date.now()}`;
  const userId = (req as any).user?.id || 1;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'No active open shift found to close.' },
      request_id: requestId
    });
  }

  const shiftMovements: CashMovement[] = memoryData.cash_movements.filter((m: CashMovement) => m.shift_id === shift.id);

  const cashRentals = shiftMovements
    .filter((m: CashMovement) => m.type === 'RENTAL_PAYMENT')
    .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

  const workshopIncome = shiftMovements
    .filter((m: CashMovement) => m.type === 'ADDITION' && m.reason.includes('Workshop'))
    .reduce((sum: number, m: CashMovement) => sum + m.amount, 0);

  const withdrawals = shiftMovements
    .filter((m: CashMovement) => m.type === 'WITHDRAWAL')
    .reduce((sum: number, m: CashMovement) => sum + Math.abs(m.amount), 0);

  const netCashMovement = shiftMovements.reduce((sum: number, m: CashMovement) => sum + m.amount, 0);
  const expected = shift.opening_cash + netCashMovement;
  const enteredClosing = Number(closing_cash !== undefined ? closing_cash : expected);
  const discrepancy = enteredClosing - expected;

  shift.end_time = new Date().toISOString();
  shift.total_cash_rentals = cashRentals;
  shift.total_workshop_income = workshopIncome;
  shift.total_withdrawals = withdrawals;
  shift.closing_cash = enteredClosing;
  shift.expected_cash = expected;
  shift.discrepancy = discrepancy;
  
  // Set status: if discrepancy exists, transition to REVIEW_REQUIRED
  shift.status = Math.abs(discrepancy) > 0.01 ? 'REVIEW_REQUIRED' : 'CLOSED';
  shift.notes = notes || (discrepancy !== 0 ? `Shift closed with discrepancy: €${discrepancy.toFixed(2)}` : 'Shift closed normally');

  // Audit log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: storeId,
    user_id: userId,
    action: 'CLOSE_SHIFT',
    entity_type: 'Shift',
    entity_id: shift.id,
    new_values: JSON.stringify({ expected, enteredClosing, discrepancy, status: shift.status }),
    request_id: requestId,
    created_at: new Date().toISOString()
  });

  return res.json({ message: 'Shift closed successfully', shift });
};
