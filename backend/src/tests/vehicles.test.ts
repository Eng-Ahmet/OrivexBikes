import { httpRequest, record } from './testHelper.js';

export async function runVehiclesTests() {
  let res = await httpRequest('GET', '/vehicles');
  record('Vehicles', 'GET', '/vehicles', 200, res.status);

  res = await httpRequest('POST', '/vehicles', {}, { name: 'Test Electric Scooter', category: 'Scooters', hourly_rate: 10, daily_rate: 30 });
  record('Vehicles', 'POST', '/vehicles', 201, res.status);

  res = await httpRequest('PATCH', '/vehicles/101/status', {}, { status: 'AVAILABLE' });
  record('Vehicles', 'PATCH', '/vehicles/101/status', 200, res.status);

  res = await httpRequest('POST', '/vehicles/101/transfer', {}, { target_store_id: 2, reason: 'Fleet rebalancing' });
  record('Vehicles', 'POST', '/vehicles/101/transfer', 200, res.status);
}
