import { httpRequest, record } from './testHelper.js';

export async function runEmployeesTests() {
  let res = await httpRequest('GET', '/employees');
  record('Employees', 'GET', '/employees', 200, res.status);

  res = await httpRequest('GET', '/employees/1');
  record('Employees', 'GET', '/employees/1', 200, res.status);

  res = await httpRequest('POST', '/employees', {}, { first_name: 'Test', last_name: 'Worker', email: `worker${Date.now()}@qqbikes.com`, store_id: 1, base_hourly_rate: 14 });
  record('Employees', 'POST', '/employees', 201, res.status);

  res = await httpRequest('PUT', '/employees/1', {}, { first_name: 'Miguel Updated' });
  record('Employees', 'PUT', '/employees/1', 200, res.status);

  res = await httpRequest('PATCH', '/employees/1/status', {}, { status: 'ACTIVE' });
  record('Employees', 'PATCH', '/employees/1/status', 200, res.status);

  res = await httpRequest('POST', '/employees/1/transfer', {}, { target_store_id: 2, reason: 'Temporary manager coverage' });
  record('Employees', 'POST', '/employees/1/transfer', 200, res.status);
}
