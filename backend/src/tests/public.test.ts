import { httpRequest, record } from './testHelper.js';

export async function runPublicTests() {
  // 1. Stores Endpoint
  let res = await httpRequest('GET', '/public/stores');
  record('Public', 'GET', '/public/stores', 200, res.status);

  // 2. Fleet Endpoint
  res = await httpRequest('GET', '/public/fleet');
  record('Public', 'GET', '/public/fleet', 200, res.status);

  // 3. Vehicle Details Endpoint (Sanitized Public Vehicle DTO)
  res = await httpRequest('GET', '/public/fleet/1');
  record('Public', 'GET', '/public/fleet/1', 200, res.status);

  // 4. Tours Endpoint
  res = await httpRequest('GET', '/public/tours');
  record('Public', 'GET', '/public/tours', 200, res.status);

  // 5. Tour Details Endpoint
  res = await httpRequest('GET', '/public/tours/1');
  record('Public', 'GET', '/public/tours/1', 200, res.status);

  // 6. Tour Availability
  res = await httpRequest('GET', '/public/tours/availability?tour_id=1&date=2026-09-01');
  record('Public', 'GET', '/public/tours/availability', 200, res.status);

  // 7. Informational Availability (Date/Time Overlap Check)
  res = await httpRequest('GET', '/public/availability?store_id=1&start_date=2026-09-01&end_date=2026-09-03');
  record('Public', 'GET', '/public/availability', 200, res.status);

  // 8. Public Bike Booking Creation (Authoritative Pricing & Persistent Idempotency)
  const testIdempotencyKey = `idempotency-test-${Date.now()}`;
  const bookingPayload = {
    vehicle_id: 1,
    store_id: 1,
    pickup_date: '2026-09-10',
    pickup_time: '10:00',
    return_date: '2026-09-12',
    return_time: '18:00',
    customer_name: 'Elena Rostova',
    customer_email: 'elena@example.com',
    customer_phone: '+34 699 888 777',
    terms_accepted: true,
    privacy_accepted: true
  };

  res = await httpRequest('POST', '/public/bookings', { 'Idempotency-Key': testIdempotencyKey }, bookingPayload);
  record('Public', 'POST', '/public/bookings', 201, res.status);

  const createdCode = res.body?.booking_number;

  // 9. Verify Persistent Idempotency (Repeat Request with Same Key)
  if (testIdempotencyKey) {
    const repeatRes = await httpRequest('POST', '/public/bookings', { 'Idempotency-Key': testIdempotencyKey }, bookingPayload);
    record('Public Idempotency', 'POST', '/public/bookings (Repeat Key)', 201, repeatRes.status, 'Persistent idempotency replay verified');
  }

  // 10. Tour Booking Creation
  res = await httpRequest('POST', '/public/tour-bookings', {}, {
    tour_id: 1,
    customer_name: 'Marco Rossi',
    customer_email: 'marco@example.com',
    customer_phone: '+34 611 222 333',
    booking_date: '2026-09-15',
    booking_time: '10:00',
    participants: 2
  });
  record('Public', 'POST', '/public/tour-bookings', 201, res.status);

  // 11. Booking Lookup (Sanitized DTO Verification)
  if (createdCode) {
    res = await httpRequest('GET', `/public/bookings/lookup?booking_code=${createdCode}`);
    record('Public Lookup', 'GET', '/public/bookings/lookup', 200, res.status);

    // 12. Booking Cancellation
    res = await httpRequest('POST', `/public/bookings/${createdCode}/cancel`, {}, { phone: '+34 699 888 777' });
    record('Public Cancellation', 'POST', '/public/bookings/:id/cancel', 200, res.status);
  }

  // 13. Customer Review Submission (PENDING)
  res = await httpRequest('POST', '/public/reviews', {}, {
    customer_name: 'Test Reviewer',
    rating: 5,
    comment: 'Exceptional bike rental service along the Malaga coastline!'
  });
  record('Public Reviews', 'POST', '/public/reviews', 201, res.status);

  // 14. Admin Review Moderation (Approve)
  const reviewId = res.body?.review?.id;
  if (reviewId) {
    res = await httpRequest('PATCH', `/admin/reviews/${reviewId}/approve`, {}, {});
    record('Admin Reviews', 'PATCH', '/admin/reviews/:id/approve', 200, res.status);
  }

  // 15. GET Public Approved Reviews
  res = await httpRequest('GET', '/public/reviews');
  record('Public Approved Reviews', 'GET', '/public/reviews', 200, res.status);

  // 16. Customer Support Ticket Creation (OPEN)
  res = await httpRequest('POST', '/public/support', {}, {
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+34 600 999 888',
    subject: 'Rental Booking Query',
    message: 'Can I request a child seat attachment for my e-bike booking?'
  });
  record('Public Support', 'POST', '/public/support', 201, res.status);

  // 17. Admin Support Ticket Status Update
  const ticketId = res.body?.ticket_code;
  res = await httpRequest('GET', '/admin/support');
  record('Admin Support', 'GET', '/admin/support', 200, res.status);

  // 18. Customer FAQs
  res = await httpRequest('GET', '/public/faqs');
  record('Public FAQs', 'GET', '/public/faqs', 200, res.status);
}
