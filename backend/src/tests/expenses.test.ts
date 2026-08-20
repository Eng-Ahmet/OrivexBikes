import { httpRequest, record } from './testHelper.js';

export async function runExpensesTests() {
  let res = await httpRequest('GET', '/expenses');
  record('Expenses', 'GET', '/expenses', 200, res.status);

  // Valid expense creation with X-Store-Context header
  res = await httpRequest('POST', '/expenses', { 'X-Store-Context': '1' }, { category: 'SUPPLIES', amount: 45.00, description: 'Cleaning wipes' });
  record('Expenses', 'POST', '/expenses (with Store Context)', 201, res.status);

  // Invariant 13: Write operation without Store Context header MUST return 403 Forbidden!
  res = await httpRequest('POST', '/expenses', { 'X-Store-Context': 'null' }, { category: 'SUPPLIES', amount: 45.00, description: 'Test' });
  record('Expenses Security', 'POST', '/expenses (without Store Context)', 403, res.status, 'Invariant 13: All-Stores Write Rejection');

  res = await httpRequest('POST', '/expenses/1/void', {}, { void_reason: 'Duplicate accounting entry' });
  record('Expenses', 'POST', '/expenses/1/void', 200, res.status);
}
