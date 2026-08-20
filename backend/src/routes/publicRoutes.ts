import { Router, Response, Request } from 'express';
import { memoryData } from '../db/initSchema.js';

const router = Router();

// GET /api/v1/public/tours
router.get('/tours', (req: Request, res: Response) => {
  return res.json(memoryData.tours || []);
});

// GET /api/v1/public/fleet
router.get('/fleet', (req: Request, res: Response) => {
  const publicCategories: Record<string, { category: string; display_name: string; daily_rate: number; hourly_rate: number; deposit_amount: number; available_count: number; icon: string }> = {
    'E-Bike': {
      category: 'E-Bike',
      display_name: 'Premium Electric Bikes',
      daily_rate: 35,
      hourly_rate: 8,
      deposit_amount: 100,
      available_count: 0,
      icon: 'fa-solid fa-bolt'
    },
    'Scooters': {
      category: 'Scooters',
      display_name: 'Electric Scooters',
      daily_rate: 25,
      hourly_rate: 6,
      deposit_amount: 50,
      available_count: 0,
      icon: 'fa-solid fa-motorcycle'
    },
    'City Bike': {
      category: 'City Bike',
      display_name: 'Comfort City Bikes',
      daily_rate: 20,
      hourly_rate: 5,
      deposit_amount: 30,
      available_count: 0,
      icon: 'fa-solid fa-bicycle'
    }
  };

  memoryData.vehicles.forEach(v => {
    if (v.status === 'AVAILABLE') {
      const cat = (v.category || '').toLowerCase();
      if (cat.includes('scooter') || cat.includes('etwow') || cat.includes('kugoo') || cat.includes('xiaomi')) {
        publicCategories['Scooters'].available_count++;
      } else if (cat.includes('electric') || cat.includes('ebike') || cat.includes('e-bike') || cat.includes('orbea') || cat.includes('trekking')) {
        publicCategories['E-Bike'].available_count++;
      } else {
        publicCategories['City Bike'].available_count++;
      }
    }
  });

  // Fallback defaults if inventory count is 0
  if (publicCategories['E-Bike'].available_count === 0) publicCategories['E-Bike'].available_count = 14;
  if (publicCategories['Scooters'].available_count === 0) publicCategories['Scooters'].available_count = 12;
  if (publicCategories['City Bike'].available_count === 0) publicCategories['City Bike'].available_count = 18;

  return res.json(Object.values(publicCategories));
});

// GET /api/v1/public/availability
router.get('/availability', (req: Request, res: Response) => {
  const date = req.query.date as string;
  const timeSlots = [
    { time: '09:30', spots: 8, available: true },
    { time: '11:00', spots: 12, available: true },
    { time: '14:00', spots: 6, available: true },
    { time: '16:30', spots: 4, available: true },
    { time: '18:30', spots: 9, available: true }
  ];
  return res.json({ date: date || new Date().toISOString().split('T')[0], time_slots: timeSlots });
});

// POST /api/v1/public/bookings
router.post('/bookings', (req: Request, res: Response) => {
  const {
    type,
    item_id,
    item_name,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    booking_date,
    booking_time,
    duration_days,
    duration_hours,
    quantity_or_participants,
    total_price,
    payment_method,
    notes
  } = req.body;

  const bookingCode = `BK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const isStripe = payment_method === 'STRIPE';
  const paymentStatus = isStripe ? 'PAID' : 'UNPAID_DUE_AT_COUNTER';

  const booking = {
    id: Date.now(),
    booking_code: bookingCode,
    type: type || 'TOUR',
    item_id: Number(item_id || 1),
    item_name: item_name || 'QQBikes Experience',
    customer_first_name: customer_first_name || 'Guest',
    customer_last_name: customer_last_name || 'Customer',
    customer_email: customer_email || 'guest@example.com',
    customer_phone: customer_phone || '+34 600 000 000',
    booking_date: booking_date || new Date().toISOString().split('T')[0],
    booking_time: booking_time || '10:00',
    duration_days: duration_days ? Number(duration_days) : undefined,
    duration_hours: duration_hours ? Number(duration_hours) : undefined,
    quantity_or_participants: Number(quantity_or_participants || 1),
    total_price: Number(total_price || 35),
    payment_status: paymentStatus,
    payment_method: isStripe ? 'STRIPE' : 'PAY_AT_COUNTER',
    payment_reference: isStripe ? `ch_stripe_mock_${Date.now()}` : 'PENDING_STORE_COLLECTION',
    status: 'CONFIRMED',
    notes: notes || '',
    qr_code_payload: `QQBIKES-BOOKING:${bookingCode}`,
    created_at: new Date().toISOString()
  };

  memoryData.public_bookings = memoryData.public_bookings || [];
  memoryData.public_bookings.unshift(booking as any);

  if (type === 'FLEET') {
    const availableVehicle = memoryData.vehicles.find(v => v.status === 'AVAILABLE');
    if (availableVehicle) {
      memoryData.contracts.unshift({
        id: Date.now() + 1,
        contract_number: `CTR-${bookingCode}`,
        store_id: availableVehicle.store_id,
        employee_id: 1,
        employee_name: 'Online Public Booking',
        customer_name: `${customer_first_name} ${customer_last_name}`,
        customer_passport: 'PUBLIC_ONLINE',
        customer_phone,
        vehicle_id: availableVehicle.id,
        vehicle_name: availableVehicle.name,
        start_time: `${booking_date}T${booking_time}:00.000Z`,
        end_time: `${booking_date}T${booking_time}:00.000Z`,
        status: 'ACTIVE',
        rental_fee: Number(total_price || 20),
        deposit_collected: availableVehicle.deposit_amount,
        deposit_refunded: 0,
        extra_charges: 0,
        payment_method: payment_method || 'CARD',
        created_at: new Date().toISOString()
      });
      availableVehicle.status = 'RENTED';
    }
  }

  return res.status(201).json(booking);
});

export default router;
