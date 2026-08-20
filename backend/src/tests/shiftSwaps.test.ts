import { httpRequest, record } from './testHelper.js';

export async function runShiftSwapsTests() {
  let res = await httpRequest('GET', '/shift-swaps');
  record('Shift Swaps', 'GET', '/shift-swaps', 200, res.status);

  res = await httpRequest('POST', '/shift-swaps', { 'X-Store-Context': '1' }, { requester_employee_id: 1, target_employee_id: 2, original_shift_id: 101, target_shift_id: 102, shift_date: '2026-08-25', reason: 'Doctor appointment' });
  record('Shift Swaps', 'POST', '/shift-swaps', 201, res.status);
}
