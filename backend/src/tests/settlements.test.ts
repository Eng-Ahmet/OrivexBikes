import { httpRequest, record } from './testHelper.js';

export async function runSettlementsTests() {
  let res = await httpRequest('GET', '/settlements');
  record('Settlements', 'GET', '/settlements', 200, res.status);
}
