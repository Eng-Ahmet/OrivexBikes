import { httpRequest, record } from './testHelper.js';

export async function runAttendanceTests() {
  let res = await httpRequest('GET', '/attendance');
  record('Attendance', 'GET', '/attendance', 200, res.status);

  res = await httpRequest('POST', '/attendance/clock-in', { 'X-Store-Context': '1' }, { employee_id: 1 });
  record('Attendance', 'POST', '/attendance/clock-in', 201, res.status);

  res = await httpRequest('POST', '/attendance/clock-out', { 'X-Store-Context': '1' }, { employee_id: 1 });
  record('Attendance', 'POST', '/attendance/clock-out', 200, res.status);
}
