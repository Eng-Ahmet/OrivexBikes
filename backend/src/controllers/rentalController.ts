import { Request, Response } from 'express';
import { memoryData, RentalContract, ContractExtension } from '../db/initSchema.js';

export const getRentals = (req: Request, res: Response) => {
  const storeId = Number(req.query.store_id || 1);
  const status = req.query.status ? String(req.query.status) : 'ALL';
  const q = req.query.q ? String(req.query.q).toLowerCase() : '';

  let contracts = memoryData.contracts.filter(c => c.store_id === storeId);

  if (status !== 'ALL') {
    contracts = contracts.filter(c => c.status === status);
  }

  if (q) {
    contracts = contracts.filter(c =>
      c.contract_number.toLowerCase().includes(q) ||
      c.customer_name.toLowerCase().includes(q) ||
      c.vehicle_name.toLowerCase().includes(q)
    );
  }

  return res.json(contracts);
};

export const createRental = (req: Request, res: Response) => {
  const { customer_name, customer_passport, customer_phone, vehicle_id, duration_hours, rental_fee, start_time, expected_end_time, payment_method } = req.body;

  if (!customer_name || !customer_passport || !vehicle_id) {
    return res.status(400).json({ error: 'Customer details and vehicle are required' });
  }

  const vehicle = memoryData.vehicles.find(v => v.id === Number(vehicle_id));
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle is not currently available for rent' });

  const now = new Date();
  const startTimeStr = start_time ? new Date(start_time).toISOString() : now.toISOString();
  
  let expectedEndTimeStr = expected_end_time ? new Date(expected_end_time).toISOString() : new Date(now.getTime() + (Number(duration_hours || 1) * 3600 * 1000)).toISOString();

  // Price Calculation from request or default
  const calculatedRentalFee = Number(rental_fee || vehicle.rate_1h || 15);
  const deposit = vehicle.deposit_amount || 30;

  // Neighbor Commission Split (80% Neighbor Payout / 20% Store Commission)
  let storeCommission = 0;
  let neighborPayout = 0;
  if (vehicle.item_owner === 'NEIGHBOR') {
    storeCommission = calculatedRentalFee * 0.20;
    neighborPayout = calculatedRentalFee * 0.80;
  }

  const contractNum = `QQ-2026-${String(memoryData.contracts.length + 1).padStart(4, '0')}`;

  const newContract: RentalContract = {
    id: Date.now(),
    contract_number: contractNum,
    store_id: Number(req.body.store_id || 1),
    employee_id: (req as any).user?.id || 3,
    employee_name: (req as any).user?.username || 'Ahmet',
    customer_name,
    customer_passport,
    customer_phone: customer_phone || '-',
    vehicle_id: vehicle.id,
    vehicle_name: vehicle.name,
    start_time: startTimeStr,
    end_time: expectedEndTimeStr,
    expected_end_time: expectedEndTimeStr,
    status: 'ACTIVE',
    rental_fee: calculatedRentalFee,
    deposit_collected: deposit,
    deposit_refunded: 0,
    extra_charges: 0,
    payment_method: payment_method || 'CARD',
    created_at: startTimeStr,
    item_owner: vehicle.item_owner,
    neighbor_name: vehicle.neighbor_name,
    store_commission: storeCommission,
    neighbor_payout: neighborPayout,
    extensions: []
  };

  vehicle.status = 'RENTED';
  memoryData.contracts.unshift(newContract);

  return res.status(201).json(newContract);
};

export const returnVehicle = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { extra_charges, deposit_refunded } = req.body;

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) return res.status(404).json({ error: 'Rental contract not found' });
  if (contract.status !== 'ACTIVE') return res.status(400).json({ error: 'Contract is not currently active' });

  const vehicle = memoryData.vehicles.find(v => v.id === contract.vehicle_id);
  if (vehicle) vehicle.status = 'AVAILABLE';

  contract.status = 'COMPLETED';
  contract.end_time = new Date().toISOString();
  contract.extra_charges = Number(extra_charges || 0);
  contract.deposit_refunded = Number(deposit_refunded !== undefined ? deposit_refunded : contract.deposit_collected);

  return res.json(contract);
};

export const extendRentalContract = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { additional_hours, additional_fee } = req.body;

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) return res.status(404).json({ error: 'Rental contract not found' });
  if (contract.status !== 'ACTIVE') return res.status(400).json({ error: 'Contract is not active' });

  const extraHours = Number(additional_hours || 1);
  const extraFee = Number(additional_fee || 10);

  // Extend expected end time
  const currentExpected = new Date(contract.expected_end_time || contract.end_time || contract.start_time).getTime();
  const newExpected = new Date(currentExpected + (extraHours * 3600 * 1000)).toISOString();

  contract.expected_end_time = newExpected;
  contract.end_time = newExpected;
  contract.rental_fee += extraFee;

  const extensionEntry: ContractExtension = {
    id: Date.now(),
    extended_by: (req as any).user?.username || 'Ahmet',
    additional_duration: `+${extraHours} Hour(s)`,
    additional_fee: extraFee,
    created_at: new Date().toISOString()
  };

  if (!contract.extensions) contract.extensions = [];
  contract.extensions.push(extensionEntry);

  return res.json({ message: 'Contract extended successfully', contract });
};
