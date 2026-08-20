import { httpRequest, record } from './testHelper.js';

export async function runRentalsTests() {
  let res = await httpRequest('GET', '/rentals');
  record('Rentals', 'GET', '/rentals', 200, res.status);

  res = await httpRequest('POST', '/rentals', {}, {
    customer_name: 'Test Renter',
    customer_passport: 'P12345678',
    customer_phone: '+34 600 000 111',
    vehicle_id: 101,
    duration_type: 'HOURLY',
    duration_value: 2,
    payment_method: 'CASH'
  });
  record('Rentals', 'POST', '/rentals', 201, res.status);

  res = await httpRequest('POST', '/rentals/101/extend', {}, { additional_duration: '1 Hour', additional_fee: 5 });
  record('Rentals', 'POST', '/rentals/101/extend', [200, 404], res.status);

  res = await httpRequest('POST', '/rentals/101/return', {}, { deposit_action: 'FULL_REFUND', extra_charges: 0 });
  record('Rentals', 'POST', '/rentals/101/return', [200, 404], res.status);
}
