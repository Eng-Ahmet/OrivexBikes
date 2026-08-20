import { Response } from 'express';
import { memoryData, ShiftSwapRequest } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getShiftSwapRequests = (req: AuthRequest, res: Response) => {
  const employeeId = req.query.employee_id ? Number(req.query.employee_id) : undefined;
  const status = req.query.status as string;

  let list = memoryData.shift_swap_requests;
  if (employeeId) {
    list = list.filter(s => s.requester_employee_id === employeeId || s.target_employee_id === employeeId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(s => s.status === status);
  }

  return res.json(list);
};

export const createShiftSwapRequest = (req: AuthRequest, res: Response) => {
  const { requester_employee_id, target_employee_id, original_shift_id, target_shift_id, shift_date, reason } = req.body;

  const reqEmpId = requester_employee_id ? Number(requester_employee_id) : (req.user?.id || 1);
  const reqEmp = memoryData.employees.find(e => e.id === reqEmpId || e.user_id === reqEmpId);
  const targetEmp = memoryData.employees.find(e => e.id === Number(target_employee_id));

  if (!targetEmp) return res.status(404).json({ error: 'Target swap employee not found' });

  const swapReq: ShiftSwapRequest = {
    id: Date.now(),
    requester_employee_id: reqEmp ? reqEmp.id : reqEmpId,
    requester_name: reqEmp ? `${reqEmp.first_name} ${reqEmp.last_name}` : 'Staff',
    target_employee_id: targetEmp.id,
    target_name: `${targetEmp.first_name} ${targetEmp.last_name}`,
    original_shift_id: Number(original_shift_id || 1),
    target_shift_id: Number(target_shift_id || 2),
    shift_date: shift_date || new Date().toISOString().split('T')[0],
    reason: reason || 'Shift exchange request',
    status: 'PENDING_EMPLOYEE',
    created_at: new Date().toISOString()
  };

  memoryData.shift_swap_requests.unshift(swapReq);
  return res.status(201).json(swapReq);
};

export const respondShiftSwapRequest = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { action } = req.body; // 'ACCEPT' | 'REJECT'

  const swapReq = memoryData.shift_swap_requests.find(s => s.id === id);
  if (!swapReq) return res.status(404).json({ error: 'Shift swap request not found' });

  if (action === 'ACCEPT') {
    swapReq.status = 'PENDING_MANAGER';
    swapReq.accepted_by_employee_at = new Date().toISOString();
  } else {
    swapReq.status = 'REJECTED_EMPLOYEE';
  }

  return res.json({ message: `Shift swap request ${action.toLowerCase()}ed by peer employee`, request: swapReq });
};

export const managerReviewShiftSwapRequest = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body; // 'APPROVED' | 'REJECTED'

  const swapReq = memoryData.shift_swap_requests.find(s => s.id === id);
  if (!swapReq) return res.status(404).json({ error: 'Shift swap request not found' });

  swapReq.status = status || 'APPROVED';
  swapReq.approved_by_manager_id = req.user?.id || 1;
  swapReq.approved_by_manager_at = new Date().toISOString();

  // If approved, update shift assignments for the date
  if (swapReq.status === 'APPROVED') {
    const origAssignment = memoryData.employee_shift_assignments.find(a => a.employee_id === swapReq.requester_employee_id && a.date === swapReq.shift_date);
    if (origAssignment) {
      origAssignment.employee_id = swapReq.target_employee_id;
      origAssignment.employee_name = swapReq.target_name;
      origAssignment.status = 'SWAPPED';
    }
  }

  return res.json({ message: `Shift swap request ${swapReq.status.toLowerCase()} by manager`, request: swapReq });
};
