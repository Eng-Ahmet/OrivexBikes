import { Response } from 'express';
import { memoryData, LeaveRequest, AttendanceRecord } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getLeaveRequests = (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;
  const status = req.query.status as string;

  let list = memoryData.leave_requests;
  if (employeeId) {
    list = list.filter(l => l.employee_id === employeeId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(l => l.status === status);
  }

  return res.json(list);
};

export const createLeaveRequest = (req: AuthRequest, res: Response) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  const empId = employee_id ? Number(employee_id) : (req.user?.id || 1);
  const emp = memoryData.employees.find(e => e.id === empId || e.user_id === empId);

  const start = new Date(start_date || new Date().toISOString().split('T')[0]);
  const end = new Date(end_date || start_date);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const daysCount = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const stdDaily = emp ? emp.standard_daily_hours : 8;

  const isPaid = leave_type === 'ANNUAL' || leave_type === 'SICK';

  const newRequest: LeaveRequest = {
    id: Date.now(),
    employee_id: emp ? emp.id : empId,
    employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Staff',
    leave_type: leave_type || 'ANNUAL',
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
    days_count: daysCount,
    hours_count: daysCount * stdDaily,
    is_paid: isPaid,
    reason: reason || 'Vacation leave request',
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  memoryData.leave_requests.unshift(newRequest);
  return res.status(201).json(newRequest);
};

export const reviewLeaveRequest = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const request = memoryData.leave_requests.find(l => l.id === id);
  if (!request) return res.status(404).json({ error: 'Leave request not found' });

  request.status = status || 'APPROVED';
  request.reviewed_by = req.user?.id || 1;
  request.reviewed_at = new Date().toISOString();

  // SSOT DIRECT LINKAGE: When APPROVED, auto-create AttendanceRecords for leave dates!
  if (request.status === 'APPROVED') {
    const curr = new Date(request.start_date);
    const end = new Date(request.end_date);

    const emp = memoryData.employees.find(e => e.id === request.employee_id);
    const stdDaily = emp ? emp.standard_daily_hours : 8;

    let attStatus: AttendanceRecord['status'] = 'VACATION';
    if (request.leave_type === 'SICK') attStatus = 'SICK_LEAVE';
    if (request.leave_type === 'UNPAID') attStatus = 'UNPAID_LEAVE';

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      const existingAtt = memoryData.attendance_records.find(a => a.employee_id === request.employee_id && a.date === dateStr);

      if (existingAtt) {
        existingAtt.status = attStatus;
        existingAtt.notes = `Approved ${request.leave_type} Leave (#${request.id})`;
        if (request.is_paid) {
          existingAtt.regular_hours = stdDaily;
        } else {
          existingAtt.regular_hours = 0;
        }
      } else {
        const att: AttendanceRecord = {
          id: Date.now() + Math.random(),
          employee_id: request.employee_id,
          employee_name: request.employee_name,
          date: dateStr,
          scheduled_start: '09:00',
          scheduled_end: '17:00',
          break_minutes: 60,
          total_worked_hours: request.is_paid ? stdDaily : 0,
          regular_hours: request.is_paid ? stdDaily : 0,
          overtime_hours: 0,
          late_minutes: 0,
          early_departure_minutes: 0,
          status: attStatus,
          admin_adjusted: true,
          notes: `Approved ${request.leave_type} Leave (#${request.id})`
        };
        memoryData.attendance_records.push(att);
      }

      curr.setDate(curr.getDate() + 1);
    }
  }

  return res.json({ message: `Leave request ${request.status.toLowerCase()}`, request });
};
