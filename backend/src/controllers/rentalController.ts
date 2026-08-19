import { Response } from 'express';
import { memoryData, RentalContract } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRentals = (req: AuthRequest, res: Response) => {
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
    payment_method,
    item_owner,
    neighbor_name
  } = req.body;

  if (!customer_name || !customer_passport) {
    return res.status(400).json({ error: 'Customer name and passport ID are required' });
  }

  const vehicle = memoryData.vehicles.find(v => v.id === Number(vehicle_id));
  if (!vehicle) return res.status(404).json({ error: 'Vehicle/Equipment not found' });
  if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle is currently unavailable for rental' });

  const now = new Date();
  const endTime = new Date(now.getTime() + Number(duration_hours || 2) * 3600000);

  const calculatedFee = Number(rental_fee || (vehicle.rate_1h || vehicle.hourly_rate || 5) * (duration_hours || 2));
  
  // Third-Party Neighbor Debt Settlement ("من مدين لمن")
  const isNeighbor = (item_owner || vehicle.item_owner) === 'NEIGHBOR';
  const partnerName = neighbor_name || vehicle.neighbor_name || 'Neighbor Partner';
  const storeComm = isNeighbor ? calculatedFee * 0.20 : calculatedFee;
  const neighborPayout = isNeighbor ? calculatedFee * 0.80 : 0;

  const contract: RentalContract = {
    id: Date.now(),
    contract_number: `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    store_id: req.user?.store_id || vehicle.store_id,
    employee_id: req.user?.id || 1,
    employee_name: `${req.user?.username || 'Ahmet'}`,
    customer_name,
    customer_passport,
    customer_phone: customer_phone || '+34 600 000 000',
    vehicle_id: vehicle.id,
    vehicle_name: vehicle.name,
    start_time: now.toISOString(),
    end_time: endTime.toISOString(),
    status: 'ACTIVE',
    rental_fee: calculatedFee,
    deposit_collected: Number(deposit_collected || vehicle.deposit_amount),
    deposit_refunded: 0,
    extra_charges: 0,
    payment_method: payment_method || 'CARD',
    created_at: now.toISOString(),
    item_owner: isNeighbor ? 'NEIGHBOR' : 'STORE',
    neighbor_name: isNeighbor ? partnerName : undefined,
    store_commission: storeComm,
    neighbor_payout: neighborPayout
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

  const vehicle = memoryData.vehicles.find(v => v.id === contract.vehicle_id);
  if (vehicle) {
    vehicle.status = 'AVAILABLE';
  }

  contract.status = 'COMPLETED';
  contract.extra_charges = Number(extra_charges || 0);
  contract.deposit_refunded = Number(deposit_refunded !== undefined ? deposit_refunded : contract.deposit_collected);

  return res.json({ message: 'Vehicle returned successfully', contract });
};
