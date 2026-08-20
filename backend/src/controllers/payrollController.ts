import { Response } from 'express';
import {
  memoryData,
  PayrollPeriod,
  PayrollRecord,
  PayrollItem,
  PayrollAdjustment
} from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getPayrollPeriods = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const periods = memoryData.payroll_periods.filter(p => p.store_id === storeId || !storeId);
  return res.json(periods);
};

export const createPayrollPeriod = (req: AuthRequest, res: Response) => {
  const { period_name, start_date, end_date } = req.body;
  const storeId = req.body.store_id ? Number(req.body.store_id) : (req.user?.store_id || 1);

  const newPeriod: PayrollPeriod = {
    id: Date.now(),
    store_id: storeId,
    period_name: period_name || 'Monthly Payroll',
    start_date: start_date || '2026-08-01',
    end_date: end_date || '2026-08-31',
    status: 'DRAFT',
    created_at: new Date().toISOString()
  };

  memoryData.payroll_periods.unshift(newPeriod);
  return res.status(201).json(newPeriod);
};

export const getPayrollRecords = (req: AuthRequest, res: Response) => {
  const periodId = req.query.payroll_period_id ? Number(req.query.payroll_period_id) : undefined;
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;

  let list = memoryData.payroll_records;
  if (periodId) {
    list = list.filter(p => p.payroll_period_id === periodId);
  }
  if (employeeId) {
    list = list.filter(p => p.employee_id === employeeId);
  }

  // Populate items & adjustments for each record
  const enriched = list.map(rec => {
    const items = memoryData.payroll_items.filter(i => i.payroll_record_id === rec.id);
    const adjustments = memoryData.payroll_adjustments.filter(a => a.payroll_record_id === rec.id);
    return {
      ...rec,
      items,
      adjustments
    };
  });

  return res.json(enriched);
};

export const calculatePayrollForPeriod = (req: AuthRequest, res: Response) => {
  const periodId = Number(req.params.id || req.body.period_id || 101);
  const period = memoryData.payroll_periods.find(p => p.id === periodId) || memoryData.payroll_periods[0];
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  // STRICT INVARIANT ENFORCEMENT: Locked payroll is immutable!
  if (period.status === 'LOCKED' || period.status === 'PAID') {
    return res.status(400).json({ error: 'Payroll period is locked and immutable. Historical attendance cannot overwrite locked payroll.' });
  }

  period.status = 'CALCULATING';

  const employees = memoryData.employees.filter(e => e.store_id === period.store_id && e.employment_status === 'ACTIVE');

  employees.forEach(emp => {
    let rec = memoryData.payroll_records.find(r => r.payroll_period_id === period.id && r.employee_id === emp.id);

    // Fetch approved attendance records in range
    const attendance = memoryData.attendance_records.filter(a =>
      a.employee_id === emp.id &&
      a.date >= period.start_date &&
      a.date <= period.end_date
    );

    const regHours = attendance.reduce((sum, a) => sum + (a.regular_hours || 0), 0);
    const otHours = attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
    const paidLeaveAtt = attendance.filter(a => a.status === 'VACATION' || a.status === 'SICK_LEAVE');
    const paidLeaveHours = paidLeaveAtt.reduce((sum, a) => sum + (a.regular_hours || 0), 0);

    // SNAPSHOT RATES
    const snapshotHourly = emp.hourly_rate;
    const snapshotOvertime = emp.overtime_rate;

    const grossReg = regHours * snapshotHourly;
    const grossOt = otHours * snapshotOvertime;

    if (!rec) {
      rec = {
        id: Date.now() + emp.id,
        payroll_period_id: period.id,
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        snapshot_hourly_rate: snapshotHourly,
        snapshot_overtime_rate: snapshotOvertime,
        total_regular_hours: regHours,
        total_overtime_hours: otHours,
        total_weekend_hours: 0,
        total_paid_leave_hours: paidLeaveHours,
        gross_regular_pay: Number(grossReg.toFixed(2)),
        gross_overtime_pay: Number(grossOt.toFixed(2)),
        total_adjustments_bonuses: 0,
        total_adjustments_deductions: 0,
        gross_pay: Number((grossReg + grossOt).toFixed(2)),
        net_pay: Number((grossReg + grossOt).toFixed(2)),
        status: 'PENDING',
        payment_method: emp.payment_method || 'BANK_TRANSFER'
      };
      memoryData.payroll_records.push(rec);
    } else {
      rec.snapshot_hourly_rate = snapshotHourly;
      rec.snapshot_overtime_rate = snapshotOvertime;
      rec.total_regular_hours = regHours;
      rec.total_overtime_hours = otHours;
      rec.total_paid_leave_hours = paidLeaveHours;
      rec.gross_regular_pay = Number(grossReg.toFixed(2));
      rec.gross_overtime_pay = Number(grossOt.toFixed(2));
      rec.gross_pay = Number((grossReg + grossOt + rec.total_adjustments_bonuses).toFixed(2));
      rec.net_pay = Number((rec.gross_pay - rec.total_adjustments_deductions).toFixed(2));
    }

    // Re-generate PayrollItems
    memoryData.payroll_items = memoryData.payroll_items.filter(i => i.payroll_record_id !== rec!.id);

    memoryData.payroll_items.push({
      id: Date.now() + Math.random(),
      payroll_record_id: rec.id,
      item_type: 'REGULAR_HOURS',
      hours_or_qty: regHours,
      unit_rate: snapshotHourly,
      total_amount: Number(grossReg.toFixed(2)),
      description: `${regHours} Approved Regular Working Hours @ €${snapshotHourly}/h`
    });

    if (otHours > 0) {
      memoryData.payroll_items.push({
        id: Date.now() + Math.random(),
        payroll_record_id: rec.id,
        item_type: 'OVERTIME_HOURS',
        hours_or_qty: otHours,
        unit_rate: snapshotOvertime,
        total_amount: Number(grossOt.toFixed(2)),
        description: `${otHours} Approved Overtime Hours @ €${snapshotOvertime}/h`
      });
    }
  });

  period.status = 'PENDING_REVIEW';
  return res.json({ message: 'Payroll calculated successfully', period });
};

export const addPayrollAdjustment = (req: AuthRequest, res: Response) => {
  const recordId = Number(req.params.id);
  const { type, amount, reason } = req.body;

  const record = memoryData.payroll_records.find(r => r.id === recordId);
  if (!record) return res.status(404).json({ error: 'Payroll record not found' });

  // STRICT INVARIANT CHECK
  if (record.status === 'LOCKED' || record.status === 'PAID') {
    return res.status(400).json({ error: 'Cannot add adjustments to locked or paid payroll record.' });
  }

  const adjAmount = Math.abs(Number(amount || 0));

  const adj: PayrollAdjustment = {
    id: Date.now(),
    payroll_record_id: record.id,
    type: type || 'BONUS',
    amount: adjAmount,
    reason: reason || 'Manual payroll adjustment',
    created_by: req.user?.id || 1,
    created_at: new Date().toISOString()
  };

  memoryData.payroll_adjustments.push(adj);

  // Recalculate totals
  const allAdjustments = memoryData.payroll_adjustments.filter(a => a.payroll_record_id === record.id);
  const bonuses = allAdjustments.filter(a => a.type === 'BONUS').reduce((sum, a) => sum + a.amount, 0);
  const deductions = allAdjustments.filter(a => a.type === 'DEDUCTION' || a.type === 'ADVANCE').reduce((sum, a) => sum + a.amount, 0);

  record.total_adjustments_bonuses = bonuses;
  record.total_adjustments_deductions = deductions;
  record.gross_pay = Number((record.gross_regular_pay + record.gross_overtime_pay + bonuses).toFixed(2));
  record.net_pay = Number((record.gross_pay - deductions).toFixed(2));

  return res.status(201).json({ message: 'Payroll adjustment added successfully', adjustment: adj, record });
};

export const updatePayrollRecordStatus = (req: AuthRequest, res: Response) => {
  const recordId = Number(req.params.id);
  const { status, payment_method, transaction_ref } = req.body;

  const record = memoryData.payroll_records.find(r => r.id === recordId);
  if (!record) return res.status(404).json({ error: 'Payroll record not found' });

  record.status = status || 'APPROVED';
  if (payment_method) record.payment_method = payment_method;
  if (transaction_ref) record.transaction_ref = transaction_ref;
  if (record.status === 'PAID' || record.status === 'LOCKED') {
    record.paid_at = new Date().toISOString();
  }

  return res.json({ message: `Payroll record status set to ${record.status}`, record });
};

export const lockPayrollPeriod = (req: AuthRequest, res: Response) => {
  const periodId = Number(req.params.id);
  const { status } = req.body;

  const period = memoryData.payroll_periods.find(p => p.id === periodId);
  if (!period) return res.status(404).json({ error: 'Payroll period not found' });

  period.status = status || 'LOCKED';

  // Mark all records in period as LOCKED
  const records = memoryData.payroll_records.filter(r => r.payroll_period_id === period.id);
  records.forEach(r => {
    r.status = 'LOCKED';
    if (!r.paid_at) r.paid_at = new Date().toISOString();
  });

  return res.json({ message: `Payroll period ${period.period_name} locked successfully`, period });
};
