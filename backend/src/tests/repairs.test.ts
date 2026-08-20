import { httpRequest, record } from './testHelper.js';

export async function runRepairsTests() {
  let res = await httpRequest('GET', '/repairs');
  record('Repairs', 'GET', '/repairs', 200, res.status);

  res = await httpRequest('POST', '/repairs', {}, { customer_name: 'Pedro Client', device_model: 'Specialized Bike', issue_description: 'Brake pad replacement' });
  record('Repairs', 'POST', '/repairs', 201, res.status);
}
