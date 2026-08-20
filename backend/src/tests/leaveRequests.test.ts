import { httpRequest, record } from './testHelper.js';

export async function runLeaveRequestsTests() {
  let res = await httpRequest('GET', '/leave-requests');
  record('Leave Requests', 'GET', '/leave-requests', 200, res.status);

  res = await httpRequest('POST', '/leave-requests', { 'X-Store-Context': '1' }, { employee_id: 1, leave_type: 'VACATION', start_date: '2026-09-01', end_date: '2026-09-05', reason: 'Annual holiday' });
  record('Leave Requests', 'POST', '/leave-requests', 201, res.status);

  res = await httpRequest('POST', '/leave-requests/101/approve');
  record('Leave Requests', 'POST', '/leave-requests/101/approve', [200, 404], res.status);
}
