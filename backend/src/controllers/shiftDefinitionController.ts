import { Response } from 'express';
import { memoryData, ShiftDefinition, EmployeeShiftAssignment } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getShiftDefinitions = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const defs = memoryData.shift_definitions.filter(s => s.store_id === storeId || !storeId);
  return res.json(defs);
};

export const createShiftDefinition = (req: AuthRequest, res: Response) => {
  const { name, start_time, end_time, break_duration_minutes, working_days, location, required_headcount, color_code, notes } = req.body;
  const storeId = req.body.store_id ? Number(req.body.store_id) : (req.user?.store_id || 1);

  const newDef: ShiftDefinition = {
    id: Date.now(),
    store_id: storeId,
    name: name || 'Custom Shift',
    start_time: start_time || '09:00',
    end_time: end_time || '17:00',
    break_duration_minutes: Number(break_duration_minutes || 60),
    working_days: working_days || ['L', 'M', 'X', 'J', 'V'],
    location: location || 'Store Center',
    required_headcount: Number(required_headcount || 2),
    color_code: color_code || '#38bdf8',
    notes: notes || ''
  };

  memoryData.shift_definitions.push(newDef);
  return res.status(201).json(newDef);
};

export const getShiftAssignments = (req: AuthRequest, res: Response) => {
  const date = req.query.date as string;
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;

  let list = memoryData.employee_shift_assignments;
  if (date) {
    list = list.filter(a => a.date === date);
  }
  if (employeeId) {
    list = list.filter(a => a.employee_id === employeeId);
  }

  return res.json(list);
};

export const assignShiftToEmployee = (req: AuthRequest, res: Response) => {
  const { shift_id, employee_id, date } = req.body;

  const def = memoryData.shift_definitions.find(s => s.id === Number(shift_id));
  if (!def) return res.status(404).json({ error: 'Shift definition template not found' });

  const emp = memoryData.employees.find(e => e.id === Number(employee_id));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const assignment: EmployeeShiftAssignment = {
    id: Date.now(),
    shift_id: def.id,
    employee_id: emp.id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    date: date || new Date().toISOString().split('T')[0],
    start_time: def.start_time,
    end_time: def.end_time,
    break_duration_minutes: def.break_duration_minutes,
    status: 'ASSIGNED'
  };

  memoryData.employee_shift_assignments.unshift(assignment);
  return res.status(201).json(assignment);
};
