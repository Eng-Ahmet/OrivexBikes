import { Response } from 'express';
import { memoryData } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

export const getSettlements = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : (req.user?.store_id || 1);
  const status = req.query.status ? String(req.query.status) : 'ALL';

  let list = memoryData.neighbor_settlements;
  if (status !== 'ALL') {
    list = list.filter(s => s.status === status);
  }

  return res.json(list);
};

export const paySettlement = (req: IdempotentRequest, res: Response) => {
  const id = Number(req.params.id);
  const { payment_method } = req.body;
  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;
  const userId = (req as any).user?.id || 1;
  const userName = (req as any).user?.username || 'Staff';

  const settlement = memoryData.neighbor_settlements.find(s => s.id === id);
  if (!settlement) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Neighbor settlement record not found.' },
      request_id: requestId
    });
  }

  if (settlement.status === 'PAID') {
    return res.status(409).json({
      success: false,
      error: { code: 'SETTLEMENT_ALREADY_PAID', message: 'This settlement has already been paid.' },
      request_id: requestId
    });
  }

  const pMethod = payment_method === 'CASH' ? 'CASH' : (payment_method || 'CASH');
  const nowStr = new Date().toISOString();

  settlement.status = 'PAID';
  settlement.amount_paid = settlement.neighbor_share;
  settlement.payment_method = pMethod;
  settlement.paid_at = nowStr;
  settlement.paid_by = userId;

  // OWED != PAID: Generate cash movement ONLY when physical cash is paid out!
  if (pMethod === 'CASH') {
    const activeShift = memoryData.shifts.find(s => s.status === 'OPEN');
    const shiftId = activeShift ? activeShift.id : 901;

    memoryData.cash_movements.push({
      id: memoryData.cash_movements.length + 1,
      shift_id: shiftId,
      type: 'NEIGHBOR_PAYOUT',
      amount: -settlement.neighbor_share,
      reason: `Partner payout to ${settlement.neighbor_name} for contract #${settlement.contract_id}`,
      performed_by: userName,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: nowStr
    });
  }

  // Audit Log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: 1,
    user_id: userId,
    action: 'PAY_NEIGHBOR_SETTLEMENT',
    entity_type: 'NeighborSettlement',
    entity_id: settlement.id,
    new_values: JSON.stringify({ amount_paid: settlement.neighbor_share, payment_method: pMethod }),
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: nowStr
  });

  return res.json({ message: 'Partner payout processed successfully', settlement });
};
