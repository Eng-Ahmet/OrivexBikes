import { httpRequest, record } from './testHelper.js';

export async function runPublicTests() {
  let res = await httpRequest('GET', '/public/tours');
  record('Public', 'GET', '/public/tours', 200, res.status);

  res = await httpRequest('POST', '/public/booking', {}, { customer_name: 'Online Guest', email: 'guest@email.com', tour_type: 'CITY_HIGHLIGHTS', booking_date: '2026-08-25', guests: 2 });
  record('Public', 'POST', '/public/booking', 201, res.status);
}
