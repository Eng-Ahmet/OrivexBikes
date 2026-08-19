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

router.get('/users', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(memoryData.users);
});

// --- 2. STORES / CAMPSITES ---

router.get('/stores', (req, res) => {
  return res.json(memoryData.stores);
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
    rental_fee: Number(rental_fee || vehicle.hourly_rate * (duration_hours || 2)),
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

router.post('/shifts/open', authenticateToken, (req: AuthRequest, res: Response) => {
  const { opening_cash } = req.body;
  const storeId = req.user?.store_id || 1;

  const existing = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
  if (existing) return res.status(400).json({ error: 'A shift is already open for this store', shift: existing });

  const newShift: Shift = {
    id: Date.now(),
    store_id: storeId,
    employee_id: req.user?.id || 1,
    employee_name: req.user?.username || 'Sofia Employee',
    start_time: new Date().toISOString(),
    opening_cash: Number(opening_cash || 100),
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

export default router;
