import { httpRequest, record } from './testHelper.js';

export async function runSettingsTests() {
  let res = await httpRequest('GET', '/settings');
  record('Settings', 'GET', '/settings', 200, res.status);

  res = await httpRequest('PUT', '/settings/store_name', {}, { value: 'Málaga Beach Campsite Store' });
  record('Settings', 'PUT', '/settings/store_name', 200, res.status);
}
