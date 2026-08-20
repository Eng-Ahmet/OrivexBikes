import { httpRequest, record } from './testHelper.js';

export async function runShiftsTests() {
  let res = await httpRequest('GET', '/shifts/current');
  record('Shifts', 'GET', '/shifts/current', 200, res.status);

  res = await httpRequest('GET', '/shifts/employee-stats');
  record('Shifts', 'GET', '/shifts/employee-stats', 200, res.status);

  res = await httpRequest('GET', '/shifts/paid-transactions');
  record('Shifts', 'GET', '/shifts/paid-transactions', 200, res.status);

  res = await httpRequest('GET', '/shifts/history');
  record('Shifts', 'GET', '/shifts/history', 200, res.status);

  res = await httpRequest('GET', '/shifts/schedules');
  record('Shifts', 'GET', '/shifts/schedules', 200, res.status);

  res = await httpRequest('POST', '/shifts/schedules', {}, { day_code: 'L', employee_name: 'Ahmet', role: 'EMPLOYEE', start_time: '10:00', end_time: '18:00' });
  record('Shifts', 'POST', '/shifts/schedules', 201, res.status);

  res = await httpRequest('PUT', '/shifts/schedules/101', {}, { start_time: '09:00' });
  record('Shifts', 'PUT', '/shifts/schedules/101', 200, res.status);

  res = await httpRequest('DELETE', '/shifts/schedules/101');
  record('Shifts', 'DELETE', '/shifts/schedules/101', 200, res.status);

  res = await httpRequest('POST', '/shifts/open', {}, { opening_cash: 150 });
  record('Shifts', 'POST', '/shifts/open', [200, 409], res.status, 'Shift Open or Conflict if Active Shift Exists');

  res = await httpRequest('POST', '/shifts/close', {}, { actual_cash: 150, notes: 'End of shift' });
  record('Shifts', 'POST', '/shifts/close', 200, res.status);
}
