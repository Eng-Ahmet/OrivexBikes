import { httpRequest, record } from './testHelper.js';

export async function runShiftDefinitionsTests() {
  let res = await httpRequest('GET', '/shift-definitions');
  record('Shift Definitions', 'GET', '/shift-definitions', 200, res.status);

  res = await httpRequest('POST', '/shift-definitions', {}, { name: 'Morning Shift', start_time: '09:00', end_time: '17:00' });
  record('Shift Definitions', 'POST', '/shift-definitions', 201, res.status);
}
