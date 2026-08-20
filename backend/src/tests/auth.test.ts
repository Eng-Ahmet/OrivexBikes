import { httpRequest, record } from './testHelper.js';

export async function runAuthTests() {
  let res = await httpRequest('GET', '/auth/me');
  record('Auth', 'GET', '/auth/me', 200, res.status);

  res = await httpRequest('POST', '/auth/login', {}, { role: 'ADMIN', store_id: 1 });
  record('Auth', 'POST', '/auth/login', 200, res.status);

  res = await httpRequest('POST', '/auth/verify-pin', {}, { pin: '1111' });
  record('Auth', 'POST', '/auth/verify-pin', 200, res.status);

  res = await httpRequest('POST', '/auth/logout');
  record('Auth', 'POST', '/auth/logout', 200, res.status);
}
