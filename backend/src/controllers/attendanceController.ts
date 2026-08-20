import { Response } from 'express';
import { memoryData, AttendanceRecord, OvertimeRecord } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAttendanceRecords = (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;
  const startDate = req.query.start_date as string;
  const endDate = req.query.end_date as string;
  const status = req.query.status as string;

  let list = memoryData.attendance_records;
  if (employeeId) {
    list = list.filter(a => a.employee_id === employeeId);
  }
  if (startDate && endDate) {
    list = list.filter(a => a.date >= startDate && a.date <= endDate);
  }
  if (status && status !== 'ALL') {
    list = list.filter(a => a.status === status);
  }

  return res.json(list);
};

export const clockIn = (req: AuthRequest, res: Response) => {
  const { employee_id, notes } = req.body;
  const empId = employee_id ? Number(employee_id) : (req.user?.id || 1);

  const emp = memoryData.employees.find(e => e.id === empId || e.user_id === empId);
  if (!emp) return res.status(404).json({ error: 'Employee profile not found' });

  const todayStr = new Date().toISOString().split('T')[0];
  const existing = memoryData.attendance_records.find(a => a.employee_id === emp.id && a.date === todayStr && !a.actual_clock_out);
  if (existing) {
    return res.status(400).json({ error: 'Employee is already clocked in today', record: existing });
  }

  const assignedShift = memoryData.employee_shift_assignments.find(a => a.employee_id === emp.id && a.date === todayStr);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const record: AttendanceRecord = {
    id: Date.now(),
    employee_id: emp.id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    shift_assignment_id: assignedShift?.id,
    date: todayStr,
    scheduled_start: assignedShift?.start_time || '09:00',
    scheduled_end: assignedShift?.end_time || '17:00',
    actual_clock_in: now.toISOString(),
    break_minutes: assignedShift?.break_duration_minutes || 60,
    total_worked_hours: 0,
    regular_hours: 0,
    overtime_hours: 0,
    late_minutes: 0,
    early_departure_minutes: 0,
    status: 'PRESENT',
    admin_adjusted: false,
    notes: notes || 'Clocked in via system'
  };

  // Calculate late minutes if assigned shift exists
  if (assignedShift) {
    const [sH, sM] = assignedShift.start_time.split(':').map(Number);
    const scheduledMin = sH * 60 + sM;
    const actualMin = now.getHours() * 60 + now.getMinutes();
    if (actualMin > scheduledMin + 5) {
      record.late_minutes = actualMin - scheduledMin;
      record.status = 'LATE';
    }
  }

  memoryData.attendance_records.unshift(record);
  return res.status(201).json(record);
};

export const clockOut = (req: AuthRequest, res: Response) => {
  const { employee_id, notes } = req.body;
  const empId = employee_id ? Number(employee_id) : (req.user?.id || 1);

  const emp = memoryData.employees.find(e => e.id === empId || e.user_id === empId);
  const targetEmpId = emp ? emp.id : empId;

  const todayStr = new Date().toISOString().split('T')[0];
  const record = memoryData.attendance_records.find(a => a.employee_id === targetEmpId && !a.actual_clock_out);
  if (!record) {
    return res.status(404).json({ error: 'No active open clock-in session found for today' });
  }

  const now = new Date();
  record.actual_clock_out = now.toISOString();
  if (notes) record.notes = `${record.notes || ''} | ${notes}`;

  const clockInTime = new Date(record.actual_clock_in!).getTime();
  const clockOutTime = now.getTime();
  const diffMs = clockOutTime - clockInTime;
  const rawHours = Math.max(0, diffMs / 3600000);
  const breakHours = (record.break_minutes || 60) / 60;
  const workedHours = Math.max(0, rawHours - breakHours);

  const stdHours = emp ? emp.standard_daily_hours : 8;
  const regHours = Math.min(stdHours, workedHours);
  const otHours = Math.max(0, workedHours - stdHours);

  record.total_worked_hours = Number(workedHours.toFixed(2));
  record.regular_hours = Number(regHours.toFixed(2));
  record.overtime_hours = Number(otHours.toFixed(2));

  // If overtime worked, queue an OvertimeRecord for manager approval
  if (otHours > 0.25) {
    const otRecord: OvertimeRecord = {
      id: Date.now(),
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      attendance_id: record.id,
      date: record.date,
      regular_hours: record.regular_hours,
      overtime_hours: record.overtime_hours,
      status: 'PENDING',
      reason: `Worked ${otHours.toFixed(2)}h beyond standard daily ${stdHours}h schedule`,
      notes: 'Pending manager approval'
    };
    memoryData.overtime_records.unshift(otRecord);
  }

  return res.json({ message: 'Clocked out successfully', record });
};

export const adjustAttendance = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const record = memoryData.attendance_records.find(a => a.id === id);
  if (!record) return res.status(404).json({ error: 'Attendance record not found' });

  const { regular_hours, overtime_hours, break_minutes, status, notes } = req.body;

  if (regular_hours !== undefined) record.regular_hours = Number(regular_hours);
  if (overtime_hours !== undefined) record.overtime_hours = Number(overtime_hours);
  if (break_minutes !== undefined) record.break_minutes = Number(break_minutes);
  if (status) record.status = status;
  if (notes) record.notes = notes;

  record.total_worked_hours = Number((record.regular_hours + record.overtime_hours).toFixed(2));
  record.admin_adjusted = true;

  return res.json({ message: 'Attendance record manually adjusted', record });
};
