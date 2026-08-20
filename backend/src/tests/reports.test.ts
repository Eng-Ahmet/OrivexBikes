import { httpRequest, record } from './testHelper.js';

export async function runReportsTests() {
  let res = await httpRequest('GET', '/reports/dashboard');
  record('Reports', 'GET', '/reports/dashboard', 200, res.status);

  res = await httpRequest('GET', '/reports/daily');
  record('Reports', 'GET', '/reports/daily', 200, res.status);

  res = await httpRequest('GET', '/reports/monthly');
  record('Reports', 'GET', '/reports/monthly', 200, res.status);
}
