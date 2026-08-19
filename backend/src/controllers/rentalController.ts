import { Request, Response } from 'express';
import { memoryData, RentalContract, ContractExtension, FinancialEvent, NeighborSettlement, CashMovement, AuditLog } from '../db/initSchema.js';
import { TracedRequest } from '../middleware/requestTracing.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

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

export const createRental = (req: IdempotentRequest, res: Response) => {
  const {
    customer_name,
    customer_passport,
    customer_phone,
    vehicle_id,
    duration_hours,
    rental_fee,
    start_time,
    expected_end_time,
    payment_method,
    card_guarantee_mode,
    card_last4,
    card_expiry
  } = req.body;

  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;
  const storeId = Number(req.body.store_id || 1);
  const userId = (req as any).user?.id || 3;
  const userName = (req as any).user?.username || 'Ahmet';

  if (!customer_name || !customer_passport || !vehicle_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Customer name, passport/DNI, and vehicle selection are required.'
      },
      request_id: requestId
    });
  }

  const vehicle = memoryData.vehicles.find(v => v.id === Number(vehicle_id));
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Selected vehicle was not found.'
      },
      request_id: requestId
    });
  }

  if (vehicle.status !== 'AVAILABLE') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'VEHICLE_NOT_AVAILABLE',
        message: `Vehicle ${vehicle.name} is currently in status ${vehicle.status} and cannot be rented.`,
        details: { vehicle_id: vehicle.id, current_status: vehicle.status }
      },
      request_id: requestId
    });
  }

  const now = new Date();
  const startTimeStr = start_time ? new Date(start_time).toISOString() : now.toISOString();
  const duration = Number(duration_hours || 1);
  const expectedEndTimeStr = expected_end_time
    ? new Date(expected_end_time).toISOString()
    : new Date(now.getTime() + duration * 3600 * 1000).toISOString();

  const calculatedRentalFee = Number(rental_fee || vehicle.rate_1h || 15);
  const deposit = vehicle.deposit_amount || 30;
  const selectedPaymentMethod = payment_method === 'CASH' ? 'CASH' : 'CARD';

  // Neighbor Commission Calculations
  let storeCommission = 0;
  let neighborPayout = 0;
  if (vehicle.item_owner === 'NEIGHBOR') {
    storeCommission = calculatedRentalFee * 0.20;
    neighborPayout = calculatedRentalFee * 0.80;
  }

  const contractNum = `QQ-2026-${String(memoryData.contracts.length + 1).padStart(4, '0')}`;
  const contractId = Date.now();

  const newContract: RentalContract = {
    id: contractId,
    contract_number: contractNum,
    store_id: storeId,
    employee_id: userId,
    employee_name: userName,
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
    deposit_retained: 0,
    extra_charges: 0,
    payment_method: selectedPaymentMethod,
    card_guarantee_mode: card_guarantee_mode || 'REFERENCE_ONLY',
    card_last4,
    card_expiry,
    created_at: startTimeStr,
    item_owner: vehicle.item_owner,
    neighbor_name: vehicle.neighbor_name,
    store_commission: storeCommission,
    neighbor_payout: neighborPayout,
    extensions: []
  };

  // Lock vehicle to RENTED
  vehicle.status = 'RENTED';
  memoryData.contracts.unshift(newContract);

  // 1. Log Financial Event - Rental Payment
  const rentalEvent: FinancialEvent = {
    id: memoryData.financial_events.length + 1,
    company_id: 1,
    store_id: storeId,
    source_type: 'CONTRACT',
    source_id: contractId,
    type: 'RENTAL_PAYMENT',
    amount: calculatedRentalFee,
    direction: 'IN',
    payment_method: selectedPaymentMethod,
    reference_id: contractNum,
    created_by: userId,
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: startTimeStr
  };
  memoryData.financial_events.push(rentalEvent);

  // 2. Log Financial Event - Deposit Collected
  const depositEvent: FinancialEvent = {
    id: memoryData.financial_events.length + 1,
    company_id: 1,
    store_id: storeId,
    source_type: 'CONTRACT',
    source_id: contractId,
    type: 'DEPOSIT_COLLECTED',
    amount: deposit,
    direction: 'IN',
    payment_method: selectedPaymentMethod,
    reference_id: contractNum,
    created_by: userId,
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: startTimeStr
  };
  memoryData.financial_events.push(depositEvent);

  // 3. Register Drawer Cash Movements ONLY if CASH
  if (selectedPaymentMethod === 'CASH') {
    const activeShift = memoryData.shifts.find(s => s.store_id === storeId && s.status === 'OPEN');
    const shiftId = activeShift ? activeShift.id : 901;

    memoryData.cash_movements.push({
      id: memoryData.cash_movements.length + 1,
      shift_id: shiftId,
      type: 'RENTAL_PAYMENT',
      amount: calculatedRentalFee,
      reason: `Rental fee for contract ${contractNum}`,
      performed_by: userName,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: startTimeStr
    });

    memoryData.cash_movements.push({
      id: memoryData.cash_movements.length + 1,
      shift_id: shiftId,
      type: 'DEPOSIT_COLLECTED',
      amount: deposit,
      reason: `Deposit held for contract ${contractNum}`,
      performed_by: userName,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: startTimeStr
    });
  }

  // 4. Neighbor Settlement Log (OWED != PAID)
  if (vehicle.item_owner === 'NEIGHBOR') {
    const settlement: NeighborSettlement = {
      id: memoryData.neighbor_settlements.length + 1,
      vehicle_id: vehicle.id,
      contract_id: contractId,
      neighbor_name: vehicle.neighbor_name || 'Partner',
      gross_rental_amount: calculatedRentalFee,
      store_commission: storeCommission,
      neighbor_share: neighborPayout,
      amount_paid: 0,
      status: 'PENDING',
      created_at: startTimeStr
    };
    memoryData.neighbor_settlements.push(settlement);
  }

  // 5. Audit Log
  const audit: AuditLog = {
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: storeId,
    user_id: userId,
    action: 'CREATE_CONTRACT',
    entity_type: 'RentalContract',
    entity_id: contractId,
    new_values: JSON.stringify({ contract_number: contractNum, rental_fee: calculatedRentalFee, deposit }),
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: startTimeStr
  };
  memoryData.audit_logs.push(audit);

  return res.status(201).json(newContract);
};

export const returnVehicle = (req: IdempotentRequest, res: Response) => {
  const id = Number(req.params.id);
  const { extra_charges, deposit_refunded, vehicle_condition, notes } = req.body;
  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;
  const userId = (req as any).user?.id || 3;
  const userName = (req as any).user?.username || 'Ahmet';

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Rental contract not found.' },
      request_id: requestId
    });
  }

  if (contract.status !== 'ACTIVE' && contract.status !== 'OVERDUE') {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_STATE_TRANSITION', message: `Cannot return contract in status ${contract.status}` },
      request_id: requestId
    });
  }

  const now = new Date();
  const returnTimeStr = now.toISOString();

  // 3-Tier Late Return Fee Engine
  let calculatedLateFee = 0;
  if (contract.expected_end_time) {
    const expectedTime = new Date(contract.expected_end_time).getTime();
    const diffMs = now.getTime() - expectedTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins > 15 && diffMins <= 60) {
      // Tier 1: 16-60 mins -> 1 extra hour rate
      calculatedLateFee = 15.00;
    } else if (diffMins > 60) {
      // Tier 2: >60 mins -> full daily rate per day
      const daysOver = Math.ceil(diffMins / (24 * 60));
      calculatedLateFee = daysOver * 40.00;
    }
  }

  const userExtraCharges = Number(extra_charges || 0);
  const totalExtraCharges = userExtraCharges + calculatedLateFee;

  const depositCollected = contract.deposit_collected;
  const actualRefunded = Number(deposit_refunded !== undefined ? deposit_refunded : Math.max(0, depositCollected - totalExtraCharges));
  const depositRetained = Math.max(0, depositCollected - actualRefunded);

  // Update Contract
  contract.status = 'COMPLETED';
  contract.actual_return_at = returnTimeStr;
  contract.end_time = returnTimeStr;
  contract.extra_charges = totalExtraCharges;
  contract.deposit_refunded = actualRefunded;
  contract.deposit_retained = depositRetained;

  // Update Vehicle Status
  const vehicle = memoryData.vehicles.find(v => v.id === contract.vehicle_id);
  if (vehicle) {
    if (vehicle_condition === 'DAMAGED' || vehicle_condition === 'MAINTENANCE') {
      vehicle.status = 'MAINTENANCE';
    } else {
      vehicle.status = 'AVAILABLE';
    }
  }

  // 1. Log Deposit Retention Transfer Event (NO CASH MOVEMENT)
  if (depositRetained > 0) {
    memoryData.financial_events.push({
      id: memoryData.financial_events.length + 1,
      company_id: 1,
      store_id: contract.store_id,
      source_type: 'CONTRACT',
      source_id: contract.id,
      type: 'DEPOSIT_APPLIED_TO_CHARGE',
      amount: depositRetained,
      direction: 'NONE',
      payment_method: 'DEPOSIT_TRANSFER',
      reference_id: contract.contract_number,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: returnTimeStr
    });
  }

  // 2. Log Deposit Refunded Event
  if (actualRefunded > 0) {
    memoryData.financial_events.push({
      id: memoryData.financial_events.length + 1,
      company_id: 1,
      store_id: contract.store_id,
      source_type: 'CONTRACT',
      source_id: contract.id,
      type: 'DEPOSIT_REFUNDED',
      amount: actualRefunded,
      direction: 'OUT',
      payment_method: contract.payment_method,
      reference_id: contract.contract_number,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: returnTimeStr
    });

    // Cash movement ONLY if CASH
    if (contract.payment_method === 'CASH') {
      const activeShift = memoryData.shifts.find(s => s.store_id === contract.store_id && s.status === 'OPEN');
      const shiftId = activeShift ? activeShift.id : 901;

      memoryData.cash_movements.push({
        id: memoryData.cash_movements.length + 1,
        shift_id: shiftId,
        type: 'DEPOSIT_REFUNDED',
        amount: -actualRefunded,
        reason: `Deposit refund for contract ${contract.contract_number}`,
        performed_by: userName,
        created_by: userId,
        request_id: requestId,
        idempotency_key: idempotencyKey,
        created_at: returnTimeStr
      });
    }
  }

  // 3. Audit Log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: contract.store_id,
    user_id: userId,
    action: 'RETURN_VEHICLE',
    entity_type: 'RentalContract',
    entity_id: contract.id,
    new_values: JSON.stringify({ actualRefunded, depositRetained, totalExtraCharges, calculatedLateFee }),
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: returnTimeStr
  });

  return res.json(contract);
};

export const extendRentalContract = (req: IdempotentRequest, res: Response) => {
  const id = Number(req.params.id);
  const { additional_hours, additional_fee } = req.body;
  const requestId = req.requestId || `req-${Date.now()}`;

  const contract = memoryData.contracts.find(c => c.id === id);
  if (!contract) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Rental contract not found.' },
      request_id: requestId
    });
  }

  if (contract.status !== 'ACTIVE') {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_STATE_TRANSITION', message: 'Contract is not active.' },
      request_id: requestId
    });
  }

  const extraHours = Number(additional_hours || 1);
  const extraFee = Number(additional_fee || 10);

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
