import { Response } from 'express';
import { memoryData, Shift, CashMovement } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

export const getCurrentShift = (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const store = memoryData.stores.find(s => s.id === storeId);
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  
  if (currentShift) {
    const storeContracts = memoryData.contracts.filter(c => c.store_id === storeId);
    const storeRepairs = (memoryData.repair_work_orders || []).filter((w: any) => w.store_id === storeId && w.status === 'DELIVERED_PAID');

    const rentalInflow = storeContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);
    const repairInflow = storeRepairs.reduce((sum: number, w: any) => sum + (w.total_cost || w.total_price || 0), 0);

    const shiftMovements: CashMovement[] = memoryData.cash_movements.filter((m: CashMovement) => m.shift_id === currentShift.id);
    const withdrawals = shiftMovements
      .filter((m: CashMovement) => m.type === 'WITHDRAWAL')
      .reduce((sum: number, m: CashMovement) => sum + Math.abs(m.amount), 0);

    const baseFloat = currentShift.opening_cash || store?.initial_cash_float || 150;
    const totalInflow = rentalInflow + repairInflow;

    currentShift.total_cash_rentals = rentalInflow;
    currentShift.total_workshop_income = repairInflow;
    currentShift.total_withdrawals = withdrawals;
    currentShift.expected_cash = baseFloat + totalInflow - withdrawals;
    (currentShift as any).net_cash = currentShift.expected_cash;
  }

  return res.json(currentShift || null);
};

export const getEmployeeStats = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);

  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  const todayStr = new Date().toISOString().split('T')[0];

  const storeContracts = memoryData.contracts.filter(c => c.store_id === storeId);
  const shiftContracts = storeContracts;
  const todayContracts = storeContracts.filter(c => c.created_at.startsWith(todayStr));

  const shiftRentalInflow = shiftContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);
  const todayRentalInflow = todayContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);

  // Paid Repair work orders calculation
  const storeRepairs = (memoryData.repair_work_orders || []).filter((w: any) => w.store_id === storeId && w.status === 'DELIVERED_PAID');

  const shiftRepairInflow = storeRepairs.reduce((sum: number, w: any) => sum + (w.total_cost || w.total_price || 0), 0);
  const todayRepairInflow = storeRepairs.filter((w: any) => (w.paid_at || w.created_at || '').startsWith(todayStr)).reduce((sum: number, w: any) => sum + (w.total_cost || w.total_price || 0), 0);

  const shiftInflow = shiftRentalInflow + shiftRepairInflow;
  const todayInflow = todayRentalInflow + todayRepairInflow;

  const shiftOutflow = currentShift ? ((currentShift as any).withdrawals || []).reduce((sum: number, w: any) => sum + w.amount, 0) : 0;
  const todayOutflow = shiftOutflow;

  const openingFloat = currentShift ? currentShift.opening_cash : 150;
  const netShiftBalance = openingFloat + shiftInflow - shiftOutflow;

  return res.json({
    active_shift_open: !!currentShift,
    shift_opening_float: openingFloat,
    shift_contracts_count: shiftContracts.length,
    today_contracts_count: todayContracts.length,
    shift_inflow: shiftInflow,
    today_inflow: todayInflow,
    shift_outflow: shiftOutflow,
    today_outflow: todayOutflow,
    net_shift_balance: netShiftBalance
  });
};

export const getPaidTransactions = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);

  const contracts = memoryData.contracts.filter(c => c.store_id === storeId).map(c => ({
    id: c.id,
    type: 'RENTAL_CONTRACT',
    code: c.contract_number,
    customer_name: c.customer_name,
    vehicle_name: c.vehicle_name,
    processed_by: (c as any).employee_name || 'Gustavo',
    amount: c.rental_fee,
    payment_method: c.payment_method || 'CARD',
    paid_at: c.created_at,
    status: 'ACTIVE'
  }));

  const activeWorkOrders = memoryData.repair_work_orders || [];
  const repairs = activeWorkOrders.filter((w: any) => w.store_id === storeId && w.status === 'DELIVERED_PAID').map((w: any) => ({
    id: w.id,
    type: 'REPAIR_WORK_ORDER',
    code: `REP-#${w.id}`,
    customer_name: w.customer_name,
    vehicle_name: w.vehicle_description || w.device_model,
    processed_by: w.technician_name || w.delivered_by || 'Ahmet',
    amount: w.total_cost || w.total_price || 35,
    payment_method: 'CASH/CARD',
    paid_at: w.paid_at || w.created_at || new Date().toISOString(),
    status: 'Paid & Delivered (Locked)'
  }));

  const allTransactions = [...contracts, ...repairs].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
  return res.json(allTransactions);
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

    const shiftRepairs = (memoryData.repair_work_orders || []).filter((r: any) => {
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

export const createScheduleSlot = (req: AuthRequest, res: Response) => {
  const { day_code, employee_name, role, type, title, start_time, end_time } = req.body;
  const store_id = req.body.store_id ? Number(req.body.store_id) : (req.user?.store_id || 1);

  const newSlot = {
    id: Date.now(),
    store_id,
    day_code: day_code || 'L',
    employee_name: employee_name || 'Staff',
    role: role || 'EMPLOYEE',
    type: type || 'STORE_COUNTER',
    title: title || 'Turno Trabajo',
    start_time: start_time || '10:00',
    end_time: end_time || '17:30',
    status: 'CONFIRMED' as const
  };

  memoryData.schedules.push(newSlot);
  return res.status(201).json(newSlot);
};

export const updateScheduleSlot = (req: AuthRequest, res: Response) => {
  const slotId = Number(req.params.id);
  const slot = memoryData.schedules.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ error: 'Schedule slot not found' });

  if (req.body.employee_name) slot.employee_name = req.body.employee_name;
  if (req.body.day_code) slot.day_code = req.body.day_code;
  if (req.body.start_time) slot.start_time = req.body.start_time;
  if (req.body.end_time) slot.end_time = req.body.end_time;
  if (req.body.title) slot.title = req.body.title;
  if (req.body.type) slot.type = req.body.type;
  if (req.body.role) slot.role = req.body.role;
  if (req.body.status) slot.status = req.body.status;

  return res.json({ message: 'Schedule slot updated successfully', slot });
};

export const deleteScheduleSlot = (req: AuthRequest, res: Response) => {
  const slotId = Number(req.params.id);
  const idx = memoryData.schedules.findIndex(s => s.id === slotId);
  if (idx === -1) return res.status(404).json({ error: 'Schedule slot not found' });

  memoryData.schedules.splice(idx, 1);
  return res.json({ message: 'Schedule slot deleted successfully' });
};


export const openShift = (req: AuthRequest, res: Response) => {
  const { opening_cash, pin_code } = req.body;
  const storeId = req.user?.store_id || 1;
  const store = memoryData.stores.find(s => s.id === storeId);
  const requestId = (req as any).requestId || `req-${Date.now()}`;

  let employeeName = req.user?.username || 'Gustavo';
  let employeeId = req.user?.id || 1;

  if (pin_code) {
    const matchedUser = memoryData.users.find(u => u.pin_hash === String(pin_code) && u.is_active);
    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid PIN code. Cannot open shift.' });
    }
    employeeName = `${matchedUser.first_name} ${matchedUser.last_name}`;
    employeeId = matchedUser.id;
  }

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
    employee_id: employeeId,
    employee_name: employeeName,
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
    amount: -Math.abs(Number(amount)),
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
  
  shift.status = Math.abs(discrepancy) > 0.01 ? 'REVIEW_REQUIRED' : 'CLOSED';
  shift.notes = notes || (discrepancy !== 0 ? `Shift closed with discrepancy: €${discrepancy.toFixed(2)}` : 'Shift closed normally');

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
