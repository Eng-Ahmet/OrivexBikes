import { Response } from 'express';
import { memoryData, RentalContract } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRentals = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : req.user?.store_id;
  const status = req.query.status as string;
  const search = (req.query.q as string || '').toLowerCase().trim();

  let list = memoryData.contracts;
  if (storeId) {
    list = list.filter(c => c.store_id === storeId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(c => c.status === status);
  }
  if (search) {
    list = list.filter(c => 
      c.contract_number.toLowerCase().includes(search) ||
      c.customer_name.toLowerCase().includes(search) ||
      c.customer_passport.toLowerCase().includes(search) ||
      c.vehicle_name.toLowerCase().includes(search)
    );
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 50));
  const startIndex = (page - 1) * limit;
  const paginatedList = list.slice(startIndex, startIndex + limit);

  return res.json({
    total: list.length,
    page,
    limit,
    contracts: paginatedList
  });
};

export const createRental = (req: AuthRequest, res: Response) => {
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

  if (!customer_name || !customer_passport || !vehicle_id) {
    return res.status(400).json({ error: 'Customer name, passport/ID, and vehicle selection are required' });
  }

  const vehicle = memoryData.vehicles.find(v => v.id === Number(vehicle_id));
  if (!vehicle) return res.status(404).json({ error: 'Selected vehicle not found' });
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
    customer_phone: customer_phone || '+34 600 000 000',
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

  vehicle.status = 'RENTED';
  memoryData.contracts.unshift(contract);

  return res.status(201).json(contract);
};

export const returnVehicle = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { extra_charges, deposit_refunded } = req.body;

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) return res.status(404).json({ error: 'Rental contract not found' });
  if (contract.status === 'COMPLETED') return res.status(400).json({ error: 'Contract is already completed' });

  contract.status = 'COMPLETED';
  contract.extra_charges = Number(extra_charges || 0);
  contract.deposit_refunded = Number(deposit_refunded !== undefined ? deposit_refunded : contract.deposit_collected);

  const vehicle = memoryData.vehicles.find(v => v.id === contract.vehicle_id);
  if (vehicle) {
    vehicle.status = 'AVAILABLE';
  }

  return res.json({ message: 'Vehicle returned successfully', contract });
};
