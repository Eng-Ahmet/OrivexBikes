import { Response } from 'express';
import { memoryData, Employee, EmployeeRateHistory, EmployeeStoreHistory } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getEmployees = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const status = req.query.status as string;

  let list = memoryData.employees.filter(e => e.store_id === storeId || !storeId);
  if (status && status !== 'ALL') {
    list = list.filter(e => e.employment_status === status);
  }

  return res.json(list);
};

export const getEmployeeById = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const emp = memoryData.employees.find(e => e.id === id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const rateHistory = memoryData.employee_rate_history.filter(r => r.employee_id === id);
  const attendance = memoryData.attendance_records.filter(a => a.employee_id === id);
  const leaveRequests = memoryData.leave_requests.filter(l => l.employee_id === id);
  const payrolls = memoryData.payroll_records.filter(p => p.employee_id === id);

  return res.json({
    employee: emp,
    rate_history: rateHistory,
    attendance_summary: {
      total_records: attendance.length,
      recent: attendance.slice(0, 5)
    },
    leave_requests: leaveRequests,
    payrolls: payrolls
  });
};

export const createEmployee = (req: AuthRequest, res: Response) => {
  const {
    user_id,
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department,
    contract_type,
    start_date,
    hourly_rate,
    overtime_rate,
    weekend_rate,
    holiday_rate,
    standard_weekly_hours,
    standard_daily_hours,
    payment_method,
    notes
  } = req.body;

  const storeId = req.body.store_id ? Number(req.body.store_id) : (req.user?.store_id || 1);

  const baseRate = Number(hourly_rate || 12.00);

  const newEmp: Employee = {
    id: Date.now(),
    user_id: user_id ? Number(user_id) : undefined,
    company_id: 1,
    store_id: storeId,
    employee_code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    first_name: first_name || 'New',
    last_name: last_name || 'Employee',
    email: email || `emp-${Date.now()}@qqbikes.com`,
    phone: phone || '+34 600 000 000',
    job_title: job_title || 'Rental Operator',
    department: department || 'Store Operations',
    employment_status: 'ACTIVE',
    contract_type: contract_type || 'FULL_TIME',
    start_date: start_date || new Date().toISOString().split('T')[0],
    hourly_rate: baseRate,
    overtime_rate: Number(overtime_rate || baseRate * 1.5),
    weekend_rate: Number(weekend_rate || baseRate * 1.25),
    holiday_rate: Number(holiday_rate || baseRate * 2.0),
    standard_weekly_hours: Number(standard_weekly_hours || 40),
    standard_daily_hours: Number(standard_daily_hours || 8),
    payment_method: payment_method || 'BANK_TRANSFER',
    notes: notes || ''
  };

  memoryData.employees.unshift(newEmp);

  // Record initial rate history
  const rateRecord: EmployeeRateHistory = {
    id: Date.now() + 1,
    employee_id: newEmp.id,
    hourly_rate: newEmp.hourly_rate,
    overtime_rate: newEmp.overtime_rate,
    weekend_rate: newEmp.weekend_rate,
    holiday_rate: newEmp.holiday_rate,
    effective_start: newEmp.start_date,
    created_by: req.user?.id || 1,
    created_at: new Date().toISOString()
  };
  memoryData.employee_rate_history.push(rateRecord);

  return res.status(201).json(newEmp);
};

export const updateEmployee = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const emp = memoryData.employees.find(e => e.id === id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const oldHourly = emp.hourly_rate;

  if (req.body.first_name) emp.first_name = req.body.first_name;
  if (req.body.last_name) emp.last_name = req.body.last_name;
  if (req.body.email) emp.email = req.body.email;
  if (req.body.phone) emp.phone = req.body.phone;
  if (req.body.job_title) emp.job_title = req.body.job_title;
  if (req.body.department) emp.department = req.body.department;
  if (req.body.contract_type) emp.contract_type = req.body.contract_type;
  if (req.body.payment_method) emp.payment_method = req.body.payment_method;
  if (req.body.notes !== undefined) emp.notes = req.body.notes;
  if (req.body.user_id !== undefined) emp.user_id = req.body.user_id ? Number(req.body.user_id) : undefined;

  // Rate change check
  const newHourly = req.body.hourly_rate !== undefined ? Number(req.body.hourly_rate) : emp.hourly_rate;
  if (newHourly !== oldHourly || req.body.overtime_rate !== undefined) {
    emp.hourly_rate = newHourly;
    emp.overtime_rate = req.body.overtime_rate !== undefined ? Number(req.body.overtime_rate) : newHourly * 1.5;
    emp.weekend_rate = req.body.weekend_rate !== undefined ? Number(req.body.weekend_rate) : newHourly * 1.25;
    emp.holiday_rate = req.body.holiday_rate !== undefined ? Number(req.body.holiday_rate) : newHourly * 2.0;

    // Close active rate history
    const activeRate = memoryData.employee_rate_history.find(r => r.employee_id === emp.id && !r.effective_end);
    const todayStr = new Date().toISOString().split('T')[0];
    if (activeRate) {
      activeRate.effective_end = todayStr;
    }

    // Insert new rate history record
    const newRateRecord: EmployeeRateHistory = {
      id: Date.now(),
      employee_id: emp.id,
      hourly_rate: emp.hourly_rate,
      overtime_rate: emp.overtime_rate,
      weekend_rate: emp.weekend_rate,
      holiday_rate: emp.holiday_rate,
      effective_start: todayStr,
      created_by: req.user?.id || 1,
      created_at: new Date().toISOString()
    };
    memoryData.employee_rate_history.push(newRateRecord);
  }

  return res.json({ message: 'Employee updated successfully', employee: emp });
};

export const setEmployeeStatus = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const emp = memoryData.employees.find(e => e.id === id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  emp.employment_status = status || 'INACTIVE';
  return res.json({ message: `Employee status updated to ${emp.employment_status}`, employee: emp });
};

export const transferEmployee = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { target_store_id, reason } = req.body;
  const scope = req.storeScope!;

  if (!target_store_id) {
    return res.status(400).json({ error: 'Target store ID is required for employee transfer' });
  }

  const targetStoreId = Number(target_store_id);
  if (!scope.allowedStoreIds.includes(targetStoreId)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized target store context' });
  }

  const emp = memoryData.employees.find(e => e.id === id && e.company_id === scope.companyId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const nowIso = new Date().toISOString();

  // 1. Close active EmployeeStoreHistory
  const activeHist = memoryData.employee_store_history.find(h => h.employee_id === emp.id && h.effective_end === null);
  if (activeHist) {
    activeHist.effective_end = nowIso;
  }

  // 2. Create new EmployeeStoreHistory
  const newHist: EmployeeStoreHistory = {
    id: Date.now(),
    company_id: scope.companyId,
    employee_id: emp.id,
    store_id: targetStoreId,
    effective_start: nowIso,
    effective_end: null,
    reason: reason || `Transferred from store #${emp.store_id} to #${targetStoreId}`,
    transferred_by: req.user?.id || 1,
    created_at: nowIso
  };
  memoryData.employee_store_history.push(newHist);

  // 3. Update active employee store pointer
  const oldStoreId = emp.store_id;
  emp.store_id = targetStoreId;

  // 4. Audit Log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: scope.companyId,
    store_id: targetStoreId,
    user_id: req.user?.id || 1,
    action: 'EMPLOYEE_TRANSFER',
    entity_type: 'Employee',
    entity_id: emp.id,
    new_values: JSON.stringify({ from_store: oldStoreId, to_store: targetStoreId, reason, timestamp: nowIso }),
    request_id: `req-${Date.now()}`,
    created_at: nowIso
  });

  return res.json({ message: `Employee transferred to store #${targetStoreId} successfully`, employee: emp, history: newHist });
};

