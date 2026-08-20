import { Response } from 'express';
import { memoryData } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getOvertimeRecords = (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;
  const status = req.query.status as string;

  let list = memoryData.overtime_records;
  if (employeeId) {
    list = list.filter(o => o.employee_id === employeeId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }

  return res.json(list);
};

export const reviewOvertime = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status, approved_hours, notes } = req.body;

  const ot = memoryData.overtime_records.find(o => o.id === id);
  if (!ot) return res.status(404).json({ error: 'Overtime record not found' });

  ot.status = status || 'APPROVED';
  ot.approved_by = req.user?.id || 1;
  ot.approved_at = new Date().toISOString();

  if (approved_hours !== undefined) {
    ot.overtime_hours = Number(approved_hours);
  }
  if (notes) ot.notes = notes;

  // Update corresponding attendance record overtime hours
  const att = memoryData.attendance_records.find(a => a.id === ot.attendance_id);
  if (att) {
    if (ot.status === 'REJECTED') {
      att.overtime_hours = 0;
    } else {
      att.overtime_hours = ot.overtime_hours;
    }
  }

  // Audit log entry
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: req.user?.store_id || 1,
    user_id: req.user?.id || 1,
    action: `OVERTIME_${ot.status}`,
    entity_type: 'OvertimeRecord',
    entity_id: ot.id,
    new_values: JSON.stringify({ status: ot.status, approved_hours: ot.overtime_hours, notes: ot.notes }),
    request_id: `req-${Date.now()}`,
    created_at: new Date().toISOString()
  });

  return res.json({ message: `Overtime record ${ot.status.toLowerCase()} successfully`, overtime: ot });
};
