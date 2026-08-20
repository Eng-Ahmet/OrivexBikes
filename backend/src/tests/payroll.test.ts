import { httpRequest, record } from './testHelper.js';

export async function runPayrollTests() {
  let res = await httpRequest('GET', '/payroll/periods');
  record('Payroll', 'GET', '/payroll/periods', 200, res.status);

  res = await httpRequest('POST', '/payroll/calculate', {}, { period_id: 101 });
  record('Payroll', 'POST', '/payroll/calculate', [200, 400], res.status, 'Calculates or enforces Locked Period Invariant');

  res = await httpRequest('GET', '/payroll/records');
  record('Payroll', 'GET', '/payroll/records', 200, res.status);
}
