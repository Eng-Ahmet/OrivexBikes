import { httpRequest, record } from './testHelper.js';

export async function runStoresTests() {
  let res = await httpRequest('GET', '/stores');
  record('Stores', 'GET', '/stores', 200, res.status);

  res = await httpRequest('GET', '/stores/pnl');
  record('Stores', 'GET', '/stores/pnl', 200, res.status);

  res = await httpRequest('GET', '/stores/1');
  record('Stores', 'GET', '/stores/1', 200, res.status);

  res = await httpRequest('GET', '/stores/1/pnl');
  record('Stores', 'GET', '/stores/1/pnl', 200, res.status);

  res = await httpRequest('POST', '/stores', {}, { name: 'Test Branch', code: `TEST-${Date.now()}`, city: 'Málaga' });
  record('Stores', 'POST', '/stores', 201, res.status);

  res = await httpRequest('PUT', '/stores/1', {}, { phone: '+34 952 999 888' });
  record('Stores', 'PUT', '/stores/1', 200, res.status);

  res = await httpRequest('PATCH', '/stores/1/status', {}, { is_active: true });
  record('Stores', 'PATCH', '/stores/1/status', 200, res.status);

  res = await httpRequest('DELETE', '/stores/1');
  record('Stores', 'DELETE', '/stores/1', 200, res.status);
}
