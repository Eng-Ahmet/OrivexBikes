import { httpRequest, record } from './testHelper.js';

export async function runOvertimeTests() {
  let res = await httpRequest('GET', '/overtime');
  record('Overtime', 'GET', '/overtime', 200, res.status);

  res = await httpRequest('POST', '/overtime/101/approve', {}, { approved_hours: 2, manager_notes: 'Approved peak weekend hours' });
  record('Overtime', 'POST', '/overtime/101/approve', [200, 404], res.status);
}
