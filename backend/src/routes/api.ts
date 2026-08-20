import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { memoryData, RentalContract, Shift, Vehicle } from '../db/initSchema.js';
import { authenticateToken, requireAdmin, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// --- 1. AUTHENTICATION & USERS ---

router.post('/auth/login', (req, res) => {
  const { username, role, store_id } = req.body;
  
  // Find user or create temporary session for role testing
  let user = memoryData.users.find(u => u.username === username || u.user_type === role);
  
  if (!user) {
    user = {
      id: Date.now(),
      company_id: 1,
      store_id: store_id ? Number(store_id) : 1,
      user_type: role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
      username: username || (role === 'ADMIN' ? 'admin' : 'employee'),
      email: `${role || 'user'}@qqbikes.com`,
      first_name: role === 'ADMIN' ? 'Admin' : 'Counter',
      last_name: 'User',
      phone: '+34 600 000 000',
      is_active: true
    };
  }

  if (store_id) {
    user.store_id = Number(store_id);
  }

  const store = memoryData.stores.find(s => s.id === user?.store_id);
  user.store_name = store?.name || 'Málaga Beach Campsite Store';

  const token = jwt.sign(
    { id: user.id, username: user.username, user_type: user.user_type, store_id: user.store_id, store_name: user.store_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name,
      store_id: user.store_id,
      store_name: user.store_name
    }
  });
});

router.post('/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN code is required' });

  const user = memoryData.users.find(u => u.pin_hash === String(pin) && u.is_active);
  if (!user) {
    return res.status(401).json({ error: 'Invalid PIN code. Access denied.' });
  }

  return res.json({
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      store_id: user.store_id
    }
  });
});

router.get('/users', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.users);
});

router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const fullUser = memoryData.users.find(u => u.id === req.user?.id || u.username === req.user?.username);
  if (fullUser) {
    return res.json({
      id: fullUser.id,
      username: fullUser.username,
      first_name: fullUser.first_name,
      last_name: fullUser.last_name,
      user_type: fullUser.user_type,
      store_id: fullUser.store_id
    });
  }
  return res.json(req.user);
});


// --- 2. STORES / CAMPSITES & STORE MANAGEMENT ---

router.get('/stores', (req, res) => {
  return res.json(memoryData.stores.filter(s => s.is_active));
});

router.post('/stores', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, code, city, address, phone, initial_cash_float } = req.body;

  const newStore = {
    id: Date.now(),
    company_id: 1,
    name: name || 'New QQ Store Center',
    code: code || `STR-${Math.floor(100 + Math.random() * 900)}`,
    city: city || 'Málaga',
    address: address || 'Main Center Street',
    phone: phone || '+34 900 000 000',
    is_active: true,
    initial_cash_float: Number(initial_cash_float || 150)
  };

  memoryData.stores.push(newStore);
  return res.status(201).json(newStore);
});

router.put('/stores/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  if (req.body.name) store.name = req.body.name;
  if (req.body.city) store.city = req.body.city;
  if (req.body.address) store.address = req.body.address;
  if (req.body.phone) store.phone = req.body.phone;
  if (req.body.initial_cash_float !== undefined) store.initial_cash_float = Number(req.body.initial_cash_float);

  return res.json({ message: 'Store updated successfully', store });
});

router.delete('/stores/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const store = memoryData.stores.find(s => s.id === id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  store.is_active = false;
  return res.json({ message: 'Store deactivated/deleted successfully' });
});

// --- 3. VEHICLES & INVENTORY ---

router.get('/vehicles', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : req.user?.store_id;
  const category = req.query.category as string;
  const status = req.query.status as string;

  let result = memoryData.vehicles;
  if (storeId) {
    result = result.filter(v => v.store_id === storeId);
  }
  if (category && category !== 'ALL') {
    result = result.filter(v => v.category === category);
  }
  if (status && status !== 'ALL') {
    result = result.filter(v => v.status === status);
  }

  return res.json(result);
});

router.post('/vehicles', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, category, hourly_rate, daily_rate, deposit_amount, store_id, battery_level } = req.body;

  const newVehicle: Vehicle = {
    id: Date.now(),
    store_id: Number(store_id || req.user?.store_id || 1),
    category: category || 'City Bike',
    qr_code: `QQ-${category.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    frame_number: `FR-${Math.floor(10000 + Math.random() * 90000)}`,
    name: name || 'New QQ Vehicle',
    status: 'AVAILABLE',
    rate_1h: Number(hourly_rate || 5),
    rate_1d: Number(daily_rate || 20),
    hourly_rate: Number(hourly_rate || 5),
    daily_rate: Number(daily_rate || 20),
    deposit_amount: Number(deposit_amount || 30),
    battery_level: battery_level !== undefined ? Number(battery_level) : undefined
  };

  memoryData.vehicles.unshift(newVehicle);
  return res.status(201).json(newVehicle);
});

router.patch('/vehicles/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const vehicle = memoryData.vehicles.find(v => v.id === id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  vehicle.status = status;
  return res.json(vehicle);
});

// --- 4. RENTAL CONTRACTS ---

router.get('/rentals', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : req.user?.store_id;
  const status = req.query.status as string;

  let list = memoryData.contracts;
  if (storeId) {
    list = list.filter(c => c.store_id === storeId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }

  return res.json(list);
});

router.post('/rentals', authenticateToken, (req: AuthRequest, res: Response) => {
  const {
    customer_name,
    customer_passport,
    customer_phone,
    vehicle_id,
    duration_hours,
    rental_fee,
    deposit_collected,
    payment_method
  } = req.body;

  const vehicle = memoryData.vehicles.find(v => v.id === Number(vehicle_id));
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle is currently unavailable for rental' });

  const now = new Date();
  const endTime = new Date(now.getTime() + Number(duration_hours || 2) * 3600000);

  const contract: RentalContract = {
    id: Date.now(),
    contract_number: `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    store_id: req.user?.store_id || vehicle.store_id,
    employee_id: req.user?.id || 1,
    employee_name: `${req.user?.username || 'Employee'}`,
    customer_name,
    customer_passport,
    customer_phone,
    vehicle_id: vehicle.id,
    vehicle_name: vehicle.name,
    start_time: now.toISOString(),
    end_time: endTime.toISOString(),
    status: 'ACTIVE',
    rental_fee: Number(rental_fee || (vehicle.rate_1h || vehicle.hourly_rate || 5) * (duration_hours || 2)),
    deposit_collected: Number(deposit_collected || vehicle.deposit_amount),
    deposit_refunded: 0,
    extra_charges: 0,
    payment_method: payment_method || 'CARD',
    created_at: now.toISOString()
  };

  // Mark vehicle as rented
  vehicle.status = 'RENTED';
  memoryData.contracts.unshift(contract);

  return res.status(201).json(contract);
});

router.post('/rentals/:id/return', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { extra_charges, deposit_refunded, notes } = req.body;

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) return res.status(404).json({ error: 'Rental contract not found' });
  if (contract.status === 'COMPLETED') return res.status(400).json({ error: 'Contract is already completed' });

  contract.status = 'COMPLETED';
  contract.extra_charges = Number(extra_charges || 0);
  contract.deposit_refunded = Number(deposit_refunded !== undefined ? deposit_refunded : contract.deposit_collected);

  // Return vehicle to AVAILABLE status
  const vehicle = memoryData.vehicles.find(v => v.id === contract.vehicle_id);
  if (vehicle) {
    vehicle.status = 'AVAILABLE';
  }

  return res.json({ message: 'Vehicle returned successfully', contract });
});

// --- 5. SHIFTS & CASH RECONCILIATION ---

router.get('/shifts/current', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.user?.store_id || 1;
  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  return res.json(currentShift || null);
});

router.put('/repairs/work-orders/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const order = activeWorkOrders.find(w => w.id === id);
  if (!order) return res.status(404).json({ error: 'Work order not found' });

  if (order.status === 'DELIVERED_PAID') {
    return res.status(400).json({ error: 'Work order is already paid and locked. Status cannot be modified after payment confirmation.' });
  }

  order.status = status || 'DELIVERED_PAID';
  if (order.status === 'DELIVERED_PAID') {
    order.paid_at = new Date().toISOString();

    // Register payment directly into active open shift for the store
    const currentShift = memoryData.shifts.find(s => s.store_id === order.store_id && s.status === 'OPEN');
    if (currentShift) {
      (currentShift as any).payments = (currentShift as any).payments || [];
      (currentShift as any).payments.push({
        id: Date.now(),
        type: 'REPAIR',
        order_id: order.id,
        customer_name: order.customer_name,
        amount: order.total_cost || 35,
        paid_at: order.paid_at
      });
    }
  }

  return res.json({ message: 'Work order status updated', order });
});

router.get('/shifts/employee-stats', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);

  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  const todayStr = new Date().toISOString().split('T')[0];

  const storeContracts = memoryData.contracts.filter(c => c.store_id === storeId);
  const shiftContracts = currentShift ? storeContracts.filter(c => new Date(c.created_at) >= new Date(currentShift.start_time)) : [];
  const todayContracts = storeContracts.filter(c => c.created_at.startsWith(todayStr));

  const shiftRentalInflow = shiftContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);
  const todayRentalInflow = todayContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);

  // Calculate confirmed repair work order payments
  const storeRepairs = activeWorkOrders.filter(w => w.store_id === storeId && w.status === 'DELIVERED_PAID');
  const shiftRepairInflow = currentShift ? storeRepairs.filter(w => new Date(w.paid_at || w.created_at) >= new Date(currentShift.start_time)).reduce((sum, w) => sum + (w.total_cost || 0), 0) : 0;
  const todayRepairInflow = storeRepairs.filter(w => (w.paid_at || '').startsWith(todayStr)).reduce((sum, w) => sum + (w.total_cost || 0), 0);

  const shiftInflow = shiftRentalInflow + shiftRepairInflow;
  const todayInflow = todayRentalInflow + todayRepairInflow;

  const shiftOutflow = currentShift ? ((currentShift as any).withdrawals || []).reduce((sum: number, w: any) => sum + w.amount, 0) : 0;
  const todayOutflow = shiftOutflow;

  const openingFloat = currentShift ? currentShift.opening_cash : 150;
  const netShiftBalance = openingFloat + shiftInflow - shiftOutflow;

  return res.json({
    active_shift_open: !!currentShift,
    shift_opening_float: openingFloat,
    shift_contracts_count: shiftContracts.length,
    today_contracts_count: todayContracts.length,
    shift_inflow: shiftInflow,
    today_inflow: todayInflow,
    shift_outflow: shiftOutflow,
    today_outflow: todayOutflow,
    net_shift_balance: netShiftBalance
  });
});

router.get('/shifts/paid-transactions', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);

  const contracts = memoryData.contracts.filter(c => c.store_id === storeId).map(c => ({
    id: c.id,
    type: 'RENTAL_CONTRACT',
    code: c.contract_number,
    customer_name: c.customer_name,
    vehicle_name: c.vehicle_name,
    amount: c.rental_fee,
    payment_method: c.payment_method || 'CARD',
    paid_at: c.created_at,
    status: 'ACTIVE'
  }));

  const repairs = activeWorkOrders.filter(w => w.store_id === storeId && w.status === 'DELIVERED_PAID').map(w => ({
    id: w.id,
    type: 'REPAIR_WORK_ORDER',
    code: `REP-#${w.id}`,
    customer_name: w.customer_name,
    vehicle_name: w.vehicle_description,
    amount: w.total_cost || 35,
    payment_method: 'CASH/CARD',
    paid_at: w.paid_at || new Date().toISOString(),
    status: 'Paid & Delivered (Locked)'
  }));

  const allTransactions = [...contracts, ...repairs].sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
  return res.json(allTransactions);
});

router.post('/shifts/open', authenticateToken, (req: AuthRequest, res: Response) => {
  const { opening_cash, pin_code } = req.body;
  const storeId = req.user?.store_id || 1;

  let employeeName = req.user?.username || 'Employee';
  let employeeId = req.user?.id || 1;

  if (pin_code) {
    const matchedUser = memoryData.users.find(u => u.pin_hash === String(pin_code) && u.is_active);
    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid PIN code. Cannot open shift.' });
    }
    employeeName = `${matchedUser.first_name} ${matchedUser.last_name}`;
    employeeId = matchedUser.id;
  }

  const existing = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (existing) {
    return res.status(400).json({ error: 'A shift is already active for this store location. Overlapping duplicate shifts are prohibited.', shift: existing });
  }

  const targetStore = memoryData.stores.find(st => st.id === storeId);
  const configuredFloat = targetStore?.initial_cash_float !== undefined ? targetStore.initial_cash_float : 150;
  const floatAmount = Number(opening_cash ? opening_cash : configuredFloat);

  const newShift: Shift = {
    id: Date.now(),
    store_id: storeId,
    employee_id: employeeId,
    employee_name: employeeName,
    start_time: new Date().toISOString(),
    opening_cash: floatAmount,
    status: 'OPEN'
  };

  memoryData.shifts.unshift(newShift);
  return res.status(201).json(newShift);
});

router.post('/shifts/close', authenticateToken, (req: AuthRequest, res: Response) => {
  const { closing_cash, notes } = req.body;
  const storeId = req.user?.store_id || 1;

  const shift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (!shift) return res.status(404).json({ error: 'No active open shift found to close' });

  // Calculate expected cash from cash payments during shift
  const cashPayments = memoryData.contracts
    .filter(c => c.store_id === storeId && c.payment_method === 'CASH')
    .reduce((sum, c) => sum + c.rental_fee + c.extra_charges, 0);

  const expected = shift.opening_cash + cashPayments;
  const enteredClosing = Number(closing_cash || expected);

  shift.end_time = new Date().toISOString();
  shift.closing_cash = enteredClosing;
  shift.expected_cash = expected;
  shift.discrepancy = enteredClosing - expected;
  shift.status = 'CLOSED';
  shift.notes = notes || 'Shift closed normally';

  return res.json({ message: 'Shift closed successfully', shift });
});

router.get('/shifts/schedules', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const items = memoryData.schedules.filter(s => s.store_id === storeId);
  return res.json(items);
});

router.post('/shifts/schedules', authenticateToken, (req: AuthRequest, res: Response) => {
  const { day_code, employee_name, role, type, title, start_time, end_time } = req.body;
  const store_id = req.body.store_id ? Number(req.body.store_id) : (req.user?.store_id || 1);

  const newSlot = {
    id: Date.now(),
    store_id,
    day_code: day_code || 'L',
    employee_name: employee_name || 'Staff',
    role: role || 'EMPLOYEE',
    type: type || 'STORE_COUNTER',
    title: title || 'Turno Trabajo',
    start_time: start_time || '10:00',
    end_time: end_time || '17:30',
    status: 'CONFIRMED' as const
  };

  memoryData.schedules.push(newSlot);
  return res.status(201).json(newSlot);
});

router.put('/shifts/schedules/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const slotId = Number(req.params.id);
  const slot = memoryData.schedules.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ error: 'Schedule slot not found' });

  if (req.body.employee_name) slot.employee_name = req.body.employee_name;
  if (req.body.day_code) slot.day_code = req.body.day_code;
  if (req.body.start_time) slot.start_time = req.body.start_time;
  if (req.body.end_time) slot.end_time = req.body.end_time;
  if (req.body.title) slot.title = req.body.title;
  if (req.body.type) slot.type = req.body.type;

  return res.json({ message: 'Schedule slot updated successfully', slot });
});

router.delete('/shifts/schedules/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const slotId = Number(req.params.id);
  const idx = memoryData.schedules.findIndex(s => s.id === slotId);
  if (idx === -1) return res.status(404).json({ error: 'Schedule slot not found' });

  memoryData.schedules.splice(idx, 1);
  return res.json({ message: 'Schedule slot deleted successfully' });
});

// --- 6. DASHBOARD & REPORTS ---

router.get('/reports/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : req.user?.store_id;

  const storeVehicles = memoryData.vehicles.filter(v => !storeId || v.store_id === storeId);
  const storeContracts = memoryData.contracts.filter(c => !storeId || c.store_id === storeId);

  const totalRevenue = storeContracts.reduce((sum, c) => sum + c.rental_fee + (c.extra_charges || 0), 0);
  const cashSales = storeContracts.filter(c => c.payment_method === 'CASH').reduce((sum, c) => sum + c.rental_fee, 0);
  const cardSales = storeContracts.filter(c => c.payment_method === 'CARD').reduce((sum, c) => sum + c.rental_fee, 0);
  const totalDepositsHeld = storeContracts.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + c.deposit_collected, 0);

  const fleetStats = {
    total: storeVehicles.length,
    available: storeVehicles.filter(v => v.status === 'AVAILABLE').length,
    rented: storeVehicles.filter(v => v.status === 'RENTED').length,
    maintenance: storeVehicles.filter(v => v.status === 'MAINTENANCE').length
  };

  return res.json({
    totalRevenue,
    cashSales,
    cardSales,
    totalDepositsHeld,
    activeContractsCount: storeContracts.filter(c => c.status === 'ACTIVE').length,
    completedContractsCount: storeContracts.filter(c => c.status === 'COMPLETED').length,
    fleetStats,
    recentContracts: storeContracts.slice(0, 5)
  });
});

// --- 7. PUBLIC CUSTOMER BOOKING ENGINE ---

router.get('/public/tours', (req, res) => {
  return res.json(memoryData.tours || []);
});

router.get('/public/fleet', (req, res) => {
  const categoryMap = new Map<string, { category: string; display_name: string; daily_rate: number; hourly_rate: number; deposit_amount: number; available_count: number; icon: string }>();

  const icons: Record<string, string> = {
    'Scooters': 'fa-bolt-lightning',
    'City Bike': 'fa-bicycle',
    'E-Bike': 'fa-bolt',
    'Cargo Bike': 'fa-truck-ramp-box'
  };

  memoryData.vehicles.forEach(v => {
    const cat = v.category || 'City Bike';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        display_name: cat === 'Scooters' ? 'Electric Scooters' : cat === 'City Bike' ? 'Comfort City Bikes' : cat === 'E-Bike' ? 'Premium Electric Bikes' : 'Cargo & Family Bikes',
        daily_rate: v.daily_rate || v.rate_1d || 20,
        hourly_rate: v.hourly_rate || v.rate_1h || 5,
        deposit_amount: v.deposit_amount || 50,
        available_count: 0,
        icon: icons[cat] || 'fa-bicycle'
      });
    }
    if (v.status === 'AVAILABLE') {
      const current = categoryMap.get(cat)!;
      current.available_count++;
    }
  });

  return res.json(Array.from(categoryMap.values()));
});

router.get('/public/availability', (req, res) => {
  const { date } = req.query;
  const timeSlots = [
    { time: '09:30', spots: 8, available: true },
    { time: '11:00', spots: 12, available: true },
    { time: '14:00', spots: 6, available: true },
    { time: '16:30', spots: 4, available: true },
    { time: '18:30', spots: 9, available: true }
  ];
  return res.json({ date: date || new Date().toISOString().split('T')[0], time_slots: timeSlots });
});

router.post('/public/bookings', (req, res) => {
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
    payment_status: 'PAY_AT_STORE',
    payment_method: payment_method || 'CARD',
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

// --- 8. GLOBAL SETTINGS ---

router.get('/settings', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const settingsObj: Record<string, any> = {};
  
  (memoryData.settings || []).forEach(s => {
    if (!storeId || s.store_id === storeId) {
      settingsObj[s.key] = s.value;
    }
  });

  return res.json({
    company_name: settingsObj['COMPANY_NAME'] || 'QQBikes Málaga S.L.',
    company_cif: settingsObj['COMPANY_CIF'] || 'B29182736',
    vat_rate: Number(settingsObj['VAT_RATE'] || 21),
    default_deposit: Number(settingsObj['DEFAULT_DEPOSIT'] || 100),
    grace_period_minutes: Number(settingsObj['GRACE_PERIOD_MINUTES'] || 15)
  });
});

router.patch('/settings/:key', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const key = req.params.key.toUpperCase();
  const { value } = req.body;
  const storeId = req.user?.store_id || 1;

  let setting = (memoryData.settings || []).find(s => s.store_id === storeId && s.key === key);
  if (setting) {
    setting.value = String(value);
    setting.updated_at = new Date().toISOString();
  } else {
    setting = {
      id: Date.now(),
      store_id: storeId,
      key,
      value: String(value),
      value_type: 'STRING',
      updated_by: req.user?.id || 1,
      updated_at: new Date().toISOString()
    };
    memoryData.settings = memoryData.settings || [];
    memoryData.settings.push(setting);
  }

  return res.json({ message: 'Setting updated successfully', setting });
});

// --- 9. TARIFF MATRIX ---

router.get('/tariffs', (req, res) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : 1;

  const malagaMatrix = [
    { vehicle: 'Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '30 €', min20: '—', min30: '—', h1: '5 €', h2: '—', h5: '15 €', d1: '20 €', d3_plus: '15 €/día', w1_plus: '10 €/día', w2_plus: '8 €/día' },
    { vehicle: 'E-Bikes (VISA)', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '20 €', h5: '25 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '10 €', h1: '15 €', h2: '20 €', h5: '—', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'XL Cars', icon: 'fa-solid fa-truck text-danger', deposit: '20 €', min20: '15 €', min30: '20 €', h1: '30 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'S cars/Quads', icon: 'fa-solid fa-car text-info', deposit: '20 €', min20: '10 €', min30: '15 €', h1: '25 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'Buggy\'s', icon: 'fa-solid fa-motorcycle text-warning', deposit: '20 €', min20: '—', min30: '5 €', h1: '—', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' }
  ];

  const mijasMatrix = [
    { vehicle: 'E-Bike Trekking', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '25 €', h5: '30 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'MTB Mountain Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '50 €', min20: '—', min30: '—', h1: '7 €', h2: '—', h5: '15 €', d1: '25 €', d3_plus: '20 €/día', w1_plus: '15 €/día', w2_plus: '12 €/día' },
    { vehicle: 'Offroad E-Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '12 €', h1: '18 €', h2: '25 €', h5: '—', d1: '45 €', d3_plus: '35 €/día', w1_plus: '28 €/día', w2_plus: '22 €/día' }
  ];

  return res.json({
    store_id: storeId,
    matrix: storeId === 2 ? mijasMatrix : malagaMatrix
  });
});

// --- 10. REPAIRS & WORKSHOP ---

router.get('/repairs/parts', (req, res) => {
  const parts = [
    { id: 1, name: 'Cubierta maciza agujereada 8,5"', part_price: 18.00, labor_price: 35.00, total_price: 53.00 },
    { id: 2, name: 'Cubierta normal Xiaomi 8,5" (cámara no incluida)', part_price: 15.00, labor_price: 30.00, total_price: 45.00 },
    { id: 3, name: 'Cubierta normal Xiaomi 8,5" (cámara incluida)', part_price: 20.00, labor_price: 35.00, total_price: 55.00 },
    { id: 4, name: 'Cámara 8,5 Xiaomi Reforzada', part_price: 10.00, labor_price: 25.00, total_price: 35.00 },
    { id: 5, name: 'Kit 10" para Xiaomi', part_price: 50.00, labor_price: 70.00, total_price: 120.00 },
    { id: 6, name: 'Llanta reforzada para Xiaomi', part_price: 10.00, labor_price: 30.00, total_price: 40.00 },
    { id: 7, name: 'Caballete para Xiaomi', part_price: 7.00, labor_price: 15.00, total_price: 22.00 },
    { id: 8, name: 'Disco freno para Xiaomi 110mm', part_price: 10.00, labor_price: 25.00, total_price: 35.00 },
    { id: 9, name: 'Disco freno para Xiaomi 120mm', part_price: 7.00, labor_price: 20.00, total_price: 27.00 },
    { id: 10, name: 'Disco freno para Xiaomi 135mm', part_price: 20.00, labor_price: 35.00, total_price: 55.00 }
  ];
  return res.json(parts);
});

router.get('/repairs/services', (req, res) => {
  const services = [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00 },
    { id: 2, name: 'Revisión básica', price: 10.00 },
    { id: 3, name: 'Revisión completa', price: 15.00 },
    { id: 4, name: 'Arreglo/ajuste express', price: 5.00 },
    { id: 5, name: 'Pinchazo e-bike', price: 12.00 }
  ];
  return res.json(services);
});

const activeWorkOrders: any[] = [
  { id: 101, store_id: 1, customer_name: 'Carlos Fernandez', customer_phone: '+34 611 222 333', vehicle_description: 'Xiaomi m365 Pro #02', issue_description: 'Pinchazo cubierta maciza 8,5" y cambio de disco 120mm', total_cost: 80.00, status: 'IN_REPAIR' }
];

router.get('/repairs/work-orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  return res.json(activeWorkOrders.filter(w => w.store_id === storeId));
});

router.post('/repairs/work-orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, vehicle_description, issue_description } = req.body;
  const storeId = req.user?.store_id || 1;

  const newOrder = {
    id: Date.now(),
    store_id: storeId,
    customer_name,
    customer_phone,
    vehicle_description,
    issue_description,
    total_cost: 35.00,
    status: 'IN_REPAIR'
  };

  activeWorkOrders.unshift(newOrder);
  return res.status(201).json(newOrder);
});

router.put('/repairs/work-orders/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const order = activeWorkOrders.find(w => w.id === id);
  if (!order) return res.status(404).json({ error: 'Work order not found' });

  if (order.status === 'DELIVERED_PAID') {
    return res.status(400).json({ error: 'Work order is already paid and locked. Status cannot be modified after payment confirmation.' });
  }

  order.status = status || 'DELIVERED_PAID';
  if (order.status === 'DELIVERED_PAID') {
    order.paid_at = new Date().toISOString();
  }

  return res.json({ message: 'Work order status updated', order });
});

router.get('/shifts/employee-stats', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);

  const currentShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  const todayStr = new Date().toISOString().split('T')[0];

  const storeContracts = memoryData.contracts.filter(c => c.store_id === storeId);
  const shiftContracts = currentShift ? storeContracts.filter(c => new Date(c.created_at) >= new Date(currentShift.start_time)) : [];
  const todayContracts = storeContracts.filter(c => c.created_at.startsWith(todayStr));

  const shiftInflow = shiftContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);
  const todayInflow = todayContracts.reduce((sum, c) => sum + (c.rental_fee || 0), 0);

  const shiftOutflow = currentShift ? ((currentShift as any).withdrawals || []).reduce((sum: number, w: any) => sum + w.amount, 0) : 0;
  const todayOutflow = shiftOutflow;

  const openingFloat = currentShift ? currentShift.opening_cash : 100;
  const netShiftBalance = openingFloat + shiftInflow - shiftOutflow;

  return res.json({
    active_shift_open: !!currentShift,
    shift_opening_float: openingFloat,
    shift_contracts_count: shiftContracts.length,
    today_contracts_count: todayContracts.length,
    shift_inflow: shiftInflow,
    today_inflow: todayInflow,
    shift_outflow: shiftOutflow,
    today_outflow: todayOutflow,
    net_shift_balance: netShiftBalance
  });
});

// --- 11. SETTLEMENTS LEDGER ---

const settlementsLedger: any[] = [
  { id: 101, store_id: 1, period: 'Aug 01 - Aug 07, 2026', rental_amount: 1450, repair_amount: 220, total_amount: 1670, status: 'PAID' },
  { id: 102, store_id: 1, period: 'Aug 08 - Aug 14, 2026', rental_amount: 1820, repair_amount: 310, total_amount: 2130, status: 'PAID' }
];

router.get('/settlements', authenticateToken, (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  return res.json(settlementsLedger.filter(s => s.store_id === storeId));
});

router.post('/settlements/:id/pay', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const sett = settlementsLedger.find(s => s.id === id);
  if (!sett) return res.status(404).json({ error: 'Settlement record not found' });

  sett.status = 'PAID';
  return res.json({ message: 'Settlement paid successfully', settlement: sett });
});

// --- 12. PUBLIC CONTENT MODERATION & ADMIN INTEGRATION ---

// Reviews Moderation
router.get('/reviews', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.customer_reviews || []);
});

router.patch('/reviews/:id/approve', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const review = (memoryData.customer_reviews || []).find(r => r.id === id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  review.status = 'APPROVED';
  review.approved_by = req.user?.id || 1;
  review.approved_at = new Date().toISOString();
  return res.json(review);
});

router.patch('/reviews/:id/reject', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const review = (memoryData.customer_reviews || []).find(r => r.id === id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  review.status = 'REJECTED';
  review.rejected_by = req.user?.id || 1;
  review.rejected_at = new Date().toISOString();
  return res.json(review);
});

// Support Tickets Management
router.get('/support', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.support_tickets || []);
});

router.patch('/support/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status, staff_notes } = req.body;
  const ticket = (memoryData.support_tickets || []).find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });

  if (status) ticket.status = status;
  if (staff_notes) ticket.staff_notes = staff_notes;
  return res.json(ticket);
});

// Tour Bookings Management
router.get('/tour-bookings', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.tour_bookings || []);
});

// FAQ Management
router.get('/faqs', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.faqs || []);
});

router.post('/faqs', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { category, question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and Answer are required' });

  const faq = {
    id: Date.now(),
    category: category || 'General',
    question,
    answer,
    is_active: true,
    order_num: (memoryData.faqs || []).length + 1
  };
  memoryData.faqs = memoryData.faqs || [];
  memoryData.faqs.push(faq);
  return res.status(201).json(faq);
});

export default router;
