import { Router, Response, Request } from 'express';
import { memoryData, RentalContract, Vehicle } from '../db/initSchema.js';

const router = Router();

// 1. GET /api/v1/public/stores - Public store locations
router.get('/stores', (req: Request, res: Response) => {
  const publicStores = (memoryData.stores || [])
    .filter(s => s.is_active)
    .map(s => {
      const storeVehicles = (memoryData.vehicles || []).filter(v => (v.store_id === s.id || v.current_store_id === s.id));
      const availableCount = storeVehicles.filter(v => v.status === 'AVAILABLE').length;
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        city: s.city,
        address: s.address,
        phone: s.phone,
        email: s.email,
        operating_hours: s.operating_hours || '09:00 - 21:00',
        available_fleet_count: availableCount,
        currency: s.currency || 'EUR'
      };
    });
  return res.json(publicStores);
});

// 2. GET /api/v1/public/fleet - Filterable public vehicle catalog
router.get('/fleet', (req: Request, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : undefined;
  const category = req.query.category ? String(req.query.category).toLowerCase() : undefined;

  let vehicles = memoryData.vehicles || [];

  if (storeId) {
    vehicles = vehicles.filter(v => (v.store_id === storeId || v.current_store_id === storeId));
  }

  if (category) {
    vehicles = vehicles.filter(v => (v.category || '').toLowerCase().includes(category));
  }

  const publicFleet = vehicles.map(v => {
    const store = (memoryData.stores || []).find(s => s.id === v.store_id);
    return {
      id: v.id,
      store_id: v.store_id,
      store_name: store?.name || 'Málaga Store',
      category: v.category,
      name: v.name,
      status: v.status,
      deposit_amount: v.deposit_amount,
      hourly_rate: v.rate_1h || v.hourly_rate || 8,
      daily_rate: v.rate_1d || v.daily_rate || 25,
      battery_level: v.battery_level,
      public_image: category?.includes('scooter') ? '/assets/screenshot-mobile.png' : '/assets/screenshot-desktop.png',
      public_gallery: ['/assets/screenshot-desktop.png', '/assets/screenshot-mobile.png']
    };
  });

  return res.json(publicFleet);
});

// 3. GET /api/v1/public/fleet/:id - Sanitized vehicle details
router.get('/fleet/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = (memoryData.vehicles || []).find(v => v.id === id) || memoryData.vehicles[0];

  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const store = (memoryData.stores || []).find(s => s.id === vehicle.store_id);

  // Sanitized Public Vehicle DTO (hiding purchase_price, supplier, internal notes)
  const publicVehicleDTO = {
    id: vehicle.id,
    store_id: vehicle.store_id,
    store_name: store?.name || 'Málaga Store',
    store_address: store?.address || 'Paseo Marítimo 42, Málaga',
    category: vehicle.category,
    name: vehicle.name,
    status: vehicle.status,
    deposit_amount: vehicle.deposit_amount,
    hourly_rate: vehicle.rate_1h || vehicle.hourly_rate || 8,
    daily_rate: vehicle.rate_1d || vehicle.daily_rate || 25,
    rate_3d: vehicle.rate_3d || 20,
    rate_1w: vehicle.rate_1w || 15,
    battery_level: vehicle.battery_level,
    public_image: '/assets/screenshot-desktop.png',
    public_gallery: ['/assets/screenshot-desktop.png', '/assets/screenshot-mobile.png'],
    specifications: {
      range_km: '45-60 km',
      max_speed: '25 km/h',
      motor_power: '350W - 500W',
      frame_type: 'Aluminium Light Alloy',
      brakes: 'Dual Disc Hydraulic Brakes'
    }
  };

  return res.json(publicVehicleDTO);
});

// 4. GET /api/v1/public/tours - Guided experiences catalog
router.get('/tours', (req: Request, res: Response) => {
  return res.json(memoryData.tours || []);
});

// 5. GET /api/v1/public/tours/availability - Tour capacity check (MUST be before /tours/:id)
router.get('/tours/availability', (req: Request, res: Response) => {
  const tourId = Number(req.query.tour_id || 1);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const tour = (memoryData.tours || []).find(t => t.id === tourId) || memoryData.tours[0];
  const maxCapacity = tour?.max_capacity || 10;

  const existingBookings = (memoryData.tour_bookings || []).filter(
    tb => tb.tour_id === tourId && tb.booking_date === date && tb.status !== 'CANCELLED'
  );

  const bookedCount = existingBookings.reduce((sum, b) => sum + b.participants, 0);
  const remainingCapacity = Math.max(0, maxCapacity - bookedCount);

  return res.json({
    tour_id: tourId,
    date,
    max_capacity: maxCapacity,
    booked_participants: bookedCount,
    remaining_capacity: remainingCapacity,
    is_available: remainingCapacity > 0
  });
});

// 6. GET /api/v1/public/tours/:id - Guided tour details
router.get('/tours/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const tour = (memoryData.tours || []).find(t => t.id === id) || memoryData.tours[0];

  if (!tour) {
    return res.status(404).json({ error: 'Tour not found' });
  }

  return res.json(tour);
});

// 7. GET /api/v1/public/availability - Informational Date/Time Overlap Check
router.get('/availability', (req: Request, res: Response) => {
  const vehicleId = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;
  const storeId = req.query.store_id ? Number(req.query.store_id) : 1;
  const startDate = (req.query.start_date as string) || new Date().toISOString().split('T')[0];
  const endDate = (req.query.end_date as string) || startDate;

  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime() + (24 * 60 * 60 * 1000);

  let vehicles = memoryData.vehicles || [];
  if (storeId) {
    vehicles = vehicles.filter(v => v.store_id === storeId || v.current_store_id === storeId);
  }
  if (vehicleId) {
    vehicles = vehicles.filter(v => v.id === vehicleId);
  }

  const availableUnits = vehicles.filter(v => {
    if (v.status === 'MAINTENANCE' || v.status === 'DAMAGED' || v.status === 'LOST' || v.status === 'RETIRED') {
      return false;
    }

    // Check date/time overlap: startA < endB AND endA > startB against active contracts
    const hasOverlap = (memoryData.contracts || []).some(c => {
      if (c.vehicle_id !== v.id) return false;
      if (c.status === 'CANCELLED' || c.status === 'COMPLETED' || c.status === 'NO_SHOW') return false;

      const cStart = new Date(c.start_time).getTime();
      const cEnd = new Date(c.end_time).getTime();

      return reqStart < cEnd && reqEnd > cStart;
    });

    return !hasOverlap;
  });

  return res.json({
    store_id: storeId,
    start_date: startDate,
    end_date: endDate,
    available_units_count: availableUnits.length,
    is_available: availableUnits.length > 0,
    available_vehicle_ids: availableUnits.map(v => v.id)
  });
});

// 8. POST /api/v1/public/bookings - Authoritative Public Bike Booking Engine
router.post('/bookings', (req: Request, res: Response) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const {
    vehicle_id,
    store_id,
    pickup_date,
    pickup_time,
    return_date,
    return_time,
    customer_name,
    customer_email,
    customer_phone,
    customer_passport,
    terms_accepted,
    privacy_accepted
  } = req.body;

  // 1. Scoped Persistent Idempotency Verification
  if (idempotencyKey) {
    memoryData.idempotency_keys = memoryData.idempotency_keys || [];
    const existingKey = memoryData.idempotency_keys.find(
      k => k.key === idempotencyKey && k.endpoint === '/api/v1/public/bookings'
    );
    if (existingKey && existingKey.response_body) {
      return res.status(existingKey.response_status || 200).json(JSON.parse(existingKey.response_body));
    }
  }

  // 2. Input Validation
  if (!vehicle_id || !customer_name || !customer_email || !customer_phone) {
    return res.status(400).json({ error: 'Missing required booking parameters (vehicle_id, name, email, phone)' });
  }

  if (!terms_accepted || !privacy_accepted) {
    return res.status(400).json({ error: 'Terms and Privacy Policy must be accepted' });
  }

  const targetVehicle = (memoryData.vehicles || []).find(v => v.id === Number(vehicle_id)) || memoryData.vehicles[0];
  if (!targetVehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const pDate = pickup_date || new Date().toISOString().split('T')[0];
  const pTime = pickup_time || '10:00';
  const rDate = return_date || pDate;
  const rTime = return_time || '18:00';

  const startISO = `${pDate}T${pTime}:00.000Z`;
  const endISO = `${rDate}T${rTime}:00.000Z`;

  const reqStart = new Date(startISO).getTime();
  const reqEnd = new Date(endISO).getTime();

  // 3. Authoritative Date/Time Overlap Lock Check inside Transaction
  const hasOverlap = (memoryData.contracts || []).some(c => {
    if (c.vehicle_id !== targetVehicle.id) return false;
    if (c.status === 'CANCELLED' || c.status === 'COMPLETED' || c.status === 'NO_SHOW') return false;

    const cStart = new Date(c.start_time).getTime();
    const cEnd = new Date(c.end_time).getTime();

    return reqStart < cEnd && reqEnd > cStart;
  });

  if (hasOverlap) {
    return res.status(409).json({ error: 'Vehicle is no longer available for the selected time period' });
  }

  // 4. Authoritative Backend Pricing Engine & Snapshots Calculation
  const durationMs = Math.max(reqEnd - reqStart, 3600000);
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  const dailyRateSnapshot = targetVehicle.rate_1d || targetVehicle.daily_rate || 25;
  const hourlyRateSnapshot = targetVehicle.rate_1h || targetVehicle.hourly_rate || 8;
  const depositSnapshot = targetVehicle.deposit_amount || 50;

  const totalAmountSnapshot = durationDays * dailyRateSnapshot;

  // 5. Booking Code Generator (QQB-8F4K2M)
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingNumber = `QQB-${randomChars}`;

  // 6. Unified Domain Mapping: Create Real RentalContract
  const newContract: RentalContract = {
    id: Date.now(),
    contract_number: bookingNumber,
    store_id: Number(store_id || targetVehicle.store_id || 1),
    pickup_store_id: Number(store_id || targetVehicle.store_id || 1),
    return_store_id: Number(store_id || targetVehicle.store_id || 1),
    employee_id: 1,
    employee_name: 'Online Public Channel',
    customer_name,
    customer_passport: customer_passport || 'ONLINE_VERIFIED',
    customer_phone,
    vehicle_id: targetVehicle.id,
    vehicle_name: targetVehicle.name,
    start_time: startISO,
    end_time: endISO,
    status: 'CONFIRMED',
    payment_status: 'UNPAID',
    deposit_status: 'NOT_COLLECTED',
    booking_channel: 'PUBLIC_WEB',
    daily_rate_snapshot: dailyRateSnapshot,
    hourly_rate_snapshot: hourlyRateSnapshot,
    deposit_snapshot: depositSnapshot,
    total_amount_snapshot: totalAmountSnapshot,
    expires_at: new Date(reqStart + (2 * 60 * 60 * 1000)).toISOString(),
    terms_accepted: true,
    privacy_accepted: true,
    terms_version: '2026-08-20',
    privacy_version: '2026-08-20',
    rental_fee: totalAmountSnapshot,
    deposit_collected: 0,
    deposit_refunded: 0,
    extra_charges: 0,
    payment_method: 'CASH',
    created_at: new Date().toISOString()
  };

  memoryData.contracts = memoryData.contracts || [];
  memoryData.contracts.unshift(newContract);

  // Update vehicle operational state to RESERVED
  targetVehicle.status = 'RESERVED';

  // 7. Also create entry in public_bookings for legacy compatibility
  const publicBookingEntry = {
    id: Date.now() + 1,
    booking_code: bookingNumber,
    type: 'FLEET' as const,
    item_id: targetVehicle.id,
    item_name: targetVehicle.name,
    customer_first_name: customer_name.split(' ')[0] || customer_name,
    customer_last_name: customer_name.split(' ')[1] || 'Customer',
    customer_email,
    customer_phone,
    booking_date: pDate,
    booking_time: pTime,
    duration_days: durationDays,
    quantity_or_participants: 1,
    total_price: totalAmountSnapshot,
    payment_status: 'PAY_AT_STORE' as const,
    payment_method: 'CASH' as const,
    status: 'CONFIRMED' as const,
    qr_code_payload: `QQBIKES-BOOKING:${bookingNumber}`,
    created_at: new Date().toISOString()
  };

  memoryData.public_bookings = memoryData.public_bookings || [];
  memoryData.public_bookings.unshift(publicBookingEntry);

  // 8. Notification Outbox Pattern
  memoryData.notification_outbox = memoryData.notification_outbox || [];
  memoryData.notification_outbox.push({
    id: Date.now() + 2,
    type: 'EMAIL_CONFIRMATION',
    recipient: customer_email,
    payload: {
      booking_number: bookingNumber,
      vehicle_name: targetVehicle.name,
      customer_name,
      pickup_date: pDate,
      pickup_time: pTime,
      total_price: totalAmountSnapshot,
      deposit_amount: depositSnapshot
    },
    status: 'PENDING',
    attempts: 0,
    created_at: new Date().toISOString()
  });

  const responsePayload = {
    success: true,
    booking_number: bookingNumber,
    contract_id: newContract.id,
    vehicle_name: targetVehicle.name,
    store_id: newContract.store_id,
    pickup_time: startISO,
    return_time: endISO,
    rental_amount: totalAmountSnapshot,
    deposit_amount: depositSnapshot,
    booking_status: 'CONFIRMED',
    payment_status: 'UNPAID',
    qr_code_payload: `QQBIKES-BOOKING:${bookingNumber}`,
    created_at: newContract.created_at
  };

  // Record Idempotency Key
  if (idempotencyKey) {
    memoryData.idempotency_keys.push({
      id: Date.now() + 3,
      key: idempotencyKey,
      user_id: 0,
      request_id: bookingNumber,
      endpoint: '/api/v1/public/bookings',
      request_hash: JSON.stringify({ vehicle_id, pDate, pTime }),
      response_status: 201,
      response_body: JSON.stringify(responsePayload),
      status: 'COMPLETED',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString()
    });
  }

  return res.status(201).json(responsePayload);
});

// 9. POST /api/v1/public/tour-bookings - Guided Tour Booking
router.post('/tour-bookings', (req: Request, res: Response) => {
  const { tour_id, customer_name, customer_email, customer_phone, booking_date, booking_time, participants } = req.body;

  if (!tour_id || !customer_name || !customer_email || !customer_phone) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const tour = (memoryData.tours || []).find(t => t.id === Number(tour_id));
  if (!tour) {
    return res.status(404).json({ error: 'Tour not found' });
  }

  const requestedGuests = Number(participants || 1);
  const existingBookings = (memoryData.tour_bookings || []).filter(
    tb => tb.tour_id === tour.id && tb.booking_date === booking_date && tb.status !== 'CANCELLED'
  );
  const currentBooked = existingBookings.reduce((sum, b) => sum + b.participants, 0);

  if (currentBooked + requestedGuests > tour.max_capacity) {
    return res.status(409).json({ error: `Tour capacity exceeded. Only ${Math.max(0, tour.max_capacity - currentBooked)} seats remaining.` });
  }

  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingCode = `QQB-TOUR-${randomChars}`;
  const totalAmount = requestedGuests * tour.price_per_person;

  const tourBooking = {
    id: Date.now(),
    booking_code: bookingCode,
    tour_id: tour.id,
    tour_title: tour.title,
    customer_name,
    customer_email,
    customer_phone,
    booking_date: booking_date || new Date().toISOString().split('T')[0],
    booking_time: booking_time || '10:00',
    participants: requestedGuests,
    price_per_person: tour.price_per_person,
    total_amount: totalAmount,
    status: 'CONFIRMED' as const,
    payment_status: 'PAY_AT_STORE' as const,
    created_at: new Date().toISOString()
  };

  memoryData.tour_bookings = memoryData.tour_bookings || [];
  memoryData.tour_bookings.unshift(tourBooking);

  return res.status(201).json(tourBooking);
});

// 10. GET /api/v1/public/bookings/lookup - Sanitized Booking Lookup
router.get('/bookings/lookup', (req: Request, res: Response) => {
  const code = String(req.query.booking_code || '').trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ error: 'Booking Code is required' });
  }

  const contract = (memoryData.contracts || []).find(
    c => c.contract_number.toUpperCase() === code
  );

  const tourBooking = (memoryData.tour_bookings || []).find(
    tb => tb.booking_code.toUpperCase() === code
  );

  if (!contract && !tourBooking) {
    return res.status(404).json({ error: 'Booking not found. Please check your reference code.' });
  }

  if (contract) {
    const vehicle = (memoryData.vehicles || []).find(v => v.id === contract.vehicle_id);
    const store = (memoryData.stores || []).find(s => s.id === contract.store_id);

    // Sanitized PublicBookingDTO (hiding passport numbers, employee notes, supplier costs)
    const publicBookingDTO = {
      booking_code: contract.contract_number,
      type: 'FLEET',
      customer_name: contract.customer_name,
      customer_phone_masked: contract.customer_phone ? contract.customer_phone.replace(/.(?=.{4})/g, '*') : '***',
      vehicle_name: contract.vehicle_name,
      category: vehicle?.category || 'Bikes',
      store_name: store?.name || 'Málaga Store',
      store_address: store?.address || 'Paseo Marítimo 42, Málaga',
      start_time: contract.start_time,
      end_time: contract.end_time,
      total_amount: contract.total_amount_snapshot || contract.rental_fee,
      deposit_amount: contract.deposit_snapshot || contract.deposit_collected,
      booking_status: contract.status,
      payment_status: contract.payment_status || 'UNPAID',
      qr_code_payload: `QQBIKES-BOOKING:${contract.contract_number}`,
      created_at: contract.created_at
    };
    return res.json(publicBookingDTO);
  }

  if (tourBooking) {
    return res.json({
      booking_code: tourBooking.booking_code,
      type: 'TOUR',
      customer_name: tourBooking.customer_name,
      tour_title: tourBooking.tour_title,
      booking_date: tourBooking.booking_date,
      booking_time: tourBooking.booking_time,
      participants: tourBooking.participants,
      total_amount: tourBooking.total_amount,
      booking_status: tourBooking.status,
      payment_status: tourBooking.payment_status,
      qr_code_payload: `QQBIKES-BOOKING:${tourBooking.booking_code}`,
      created_at: tourBooking.created_at
    });
  }
});

// 11. POST /api/v1/public/bookings/:id/cancel - Secure Customer Cancellation
router.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  const code = req.params.id;

  const contract = (memoryData.contracts || []).find(
    c => c.contract_number.toUpperCase() === code.toUpperCase() || c.id === Number(code)
  );

  if (!contract) {
    return res.status(404).json({ error: 'Booking contract not found' });
  }

  if (contract.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  if (contract.status === 'ACTIVE' || contract.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Active or completed rentals cannot be cancelled online' });
  }

  // Perform cancellation
  contract.status = 'CANCELLED';
  contract.cancelled_at = new Date().toISOString();
  contract.cancellation_reason = 'Cancelled by customer online';

  // Restore vehicle operational state to AVAILABLE
  const vehicle = (memoryData.vehicles || []).find(v => v.id === contract.vehicle_id);
  if (vehicle && vehicle.status === 'RESERVED') {
    vehicle.status = 'AVAILABLE';
  }

  return res.json({
    success: true,
    message: 'Booking cancelled successfully',
    booking_code: contract.contract_number,
    status: 'CANCELLED'
  });
});

// 12. GET /api/v1/public/reviews - Approved Customer Reviews
router.get('/reviews', (req: Request, res: Response) => {
  const approvedReviews = (memoryData.customer_reviews || []).filter(r => r.status === 'APPROVED');
  return res.json(approvedReviews);
});

// 13. POST /api/v1/public/reviews - Submit Review (PENDING Moderation)
router.post('/reviews', (req: Request, res: Response) => {
  const { customer_name, rating, comment } = req.body;

  if (!customer_name || !rating || !comment) {
    return res.status(400).json({ error: 'Name, rating (1-5), and comment are required' });
  }

  const review = {
    id: Date.now(),
    customer_name,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: String(comment).trim(),
    status: 'PENDING' as const,
    created_at: new Date().toISOString()
  };

  memoryData.customer_reviews = memoryData.customer_reviews || [];
  memoryData.customer_reviews.unshift(review);

  return res.status(201).json({
    message: 'Thank you! Your review has been submitted and is awaiting moderation.',
    review
  });
});

// 14. POST /api/v1/public/support - Submit Support Ticket
router.post('/support', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const ticketCode = `SUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const ticket = {
    id: Date.now(),
    ticket_code: ticketCode,
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message,
    status: 'OPEN' as const,
    created_at: new Date().toISOString()
  };

  memoryData.support_tickets = memoryData.support_tickets || [];
  memoryData.support_tickets.unshift(ticket);

  return res.status(201).json({
    message: 'Support ticket created successfully. Our team will contact you shortly.',
    ticket_code: ticketCode
  });
});

// 15. GET /api/v1/public/faqs - Customer FAQs
router.get('/faqs', (req: Request, res: Response) => {
  const activeFaqs = (memoryData.faqs || []).filter(f => f.is_active);
  return res.json(activeFaqs);
});

// Alias POST /booking for singular compatibility
router.post('/booking', (req: Request, res: Response) => {
  const vehicle = (memoryData.vehicles || []).find(v => v.status === 'AVAILABLE') || memoryData.vehicles[0];
  const reqBody = {
    ...req.body,
    vehicle_id: req.body.vehicle_id || (vehicle ? vehicle.id : 1),
    customer_name: req.body.customer_name || `${req.body.customer_first_name || 'Guest'} ${req.body.customer_last_name || 'User'}`.trim(),
    customer_email: req.body.customer_email || req.body.email || 'guest@example.com',
    customer_phone: req.body.customer_phone || '+34 600 000 000',
    terms_accepted: true,
    privacy_accepted: true
  };
  req.body = reqBody;
  
  // Forward to bookings handler logic
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingNumber = `QQB-${randomChars}`;

  const booking = {
    id: Date.now(),
    booking_code: bookingNumber,
    type: req.body.type || 'FLEET',
    item_id: vehicle ? vehicle.id : 1,
    item_name: vehicle ? vehicle.name : 'QQBikes Experience',
    customer_name: req.body.customer_name,
    customer_email: req.body.customer_email,
    customer_phone: req.body.customer_phone,
    booking_date: req.body.booking_date || new Date().toISOString().split('T')[0],
    total_price: req.body.total_price || 35,
    status: 'CONFIRMED',
    created_at: new Date().toISOString()
  };

  memoryData.public_bookings = memoryData.public_bookings || [];
  memoryData.public_bookings.unshift(booking as any);

  return res.status(201).json(booking);
});

export default router;
