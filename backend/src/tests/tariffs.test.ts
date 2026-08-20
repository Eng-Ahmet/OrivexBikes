import { httpRequest, record } from './testHelper.js';

export async function runTariffsTests() {
  let res = await httpRequest('GET', '/tariffs');
  record('Tariffs', 'GET', '/tariffs', 200, res.status);
}
