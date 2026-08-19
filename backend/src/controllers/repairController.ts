import { Request, Response } from 'express';
import { memoryData, RepairWorkOrder, RepairTicketPart, FinancialEvent, AuditLog } from '../db/initSchema.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

export const getRepairParts = (req: Request, res: Response) => {
  return res.json(memoryData.repair_parts);
};

export const getRepairServices = (req: Request, res: Response) => {
  return res.json(memoryData.repair_services);
};

export const getRepairWorkOrders = (req: Request, res: Response) => {
  const storeId = Number(req.query.store_id || 1);
  const orders = memoryData.repair_work_orders.filter(o => o.store_id === storeId);
  return res.json(orders);
};

export const createRepairWorkOrder = (req: IdempotentRequest, res: Response) => {
  const {
    customer_name,
    customer_phone,
    device_model,
    issue_description,
    selected_parts, // Array of { part_id, quantity }
    labor_cost,
    discount,
    extra_charges
  } = req.body;

  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;
  const storeId = Number(req.body.store_id || 1);
  const userId = (req as any).user?.id || 3;

  if (!customer_name || !device_model || !issue_description) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Customer name, device model, and issue description are required.' },
      request_id: requestId
    });
  }

  // Process Selected Parts & Validate Negative Stock Invariant
  const itemizedParts: RepairTicketPart[] = [];
  let calculatedPartsCost = 0;
  const partsUsedNames: string[] = [];

  if (Array.isArray(selected_parts)) {
    for (const item of selected_parts) {
      const part = memoryData.repair_parts.find(p => p.id === Number(item.part_id));
      if (!part) continue;

      const qty = Number(item.quantity || 1);

      // Negative Stock Prevention Check
      const availableStock = part.stock_quantity !== undefined ? part.stock_quantity : 50;
      if (availableStock < qty) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for part: ${part.name}. Requested: ${qty}, Available: ${availableStock}`,
            details: { part_id: part.id, requested: qty, available: availableStock }
          },
          request_id: requestId
        });
      }

      // Deduct Stock
      if (part.stock_quantity !== undefined) {
        part.stock_quantity -= qty;
      }

      const total = part.pvp_part_only * qty;
      calculatedPartsCost += total;
      partsUsedNames.push(`${part.name} × ${qty}`);

      itemizedParts.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        repair_order_id: 0, // Assigned below
        part_id: part.id,
        part_name: part.name,
        quantity: qty,
        unit_cost: part.pvp_part_only,
        selling_price: part.pvp_part_only,
        total
      });
    }
  }

  const lCost = Number(labor_cost || 15);
  const disc = Number(discount || 0);
  const extra = Number(extra_charges || 0);
  const totalPrice = calculatedPartsCost + lCost - disc + extra;

  const ticketNum = `REP-2026-${String(memoryData.repair_work_orders.length + 1).padStart(3, '0')}`;
  const orderId = Date.now();

  itemizedParts.forEach(p => { p.repair_order_id = orderId; });

  const newOrder: RepairWorkOrder = {
    id: orderId,
    ticket_number: ticketNum,
    store_id: storeId,
    customer_name,
    customer_phone: customer_phone || '-',
    device_model,
    issue_description,
    parts_used: partsUsedNames.join(', ') || 'None',
    parts: itemizedParts,
    parts_cost: calculatedPartsCost,
    labor_cost: lCost,
    total_price: totalPrice,
    status: 'RECEIVED',
    created_at: new Date().toISOString()
  };

  memoryData.repair_work_orders.unshift(newOrder);

  // Audit Log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: 1,
    store_id: storeId,
    user_id: userId,
    action: 'CREATE_REPAIR_TICKET',
    entity_type: 'RepairWorkOrder',
    entity_id: orderId,
    new_values: JSON.stringify({ ticket_number: ticketNum, totalPrice, parts_cost: calculatedPartsCost }),
    request_id: requestId,
    idempotency_key: idempotencyKey,
    created_at: new Date().toISOString()
  });

  return res.status(201).json(newOrder);
};

export const updateRepairWorkOrderStatus = (req: IdempotentRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status, payment_method } = req.body;
  const requestId = req.requestId || `req-${Date.now()}`;
  const idempotencyKey = req.idempotencyKey;
  const userId = (req as any).user?.id || 3;
  const userName = (req as any).user?.username || 'Ahmet';

  const order = memoryData.repair_work_orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'RESOURCE_NOT_FOUND', message: 'Repair work order ticket not found.' },
      request_id: requestId
    });
  }

  const oldStatus = order.status;
  if (status) {
    order.status = status;
    order.updated_at = new Date().toISOString();
  }

  // If status changed to DELIVERED_PAID, trigger financial event & cash movement
  if (status === 'DELIVERED_PAID' && oldStatus !== 'DELIVERED_PAID') {
    const pMethod = payment_method === 'CASH' ? 'CASH' : 'CARD';

    // 1. Log Financial Event
    const event: FinancialEvent = {
      id: memoryData.financial_events.length + 1,
      company_id: 1,
      store_id: order.store_id,
      source_type: 'REPAIR',
      source_id: order.id,
      type: 'REPAIR_PAYMENT',
      amount: order.total_price,
      direction: 'IN',
      payment_method: pMethod,
      reference_id: order.ticket_number,
      created_by: userId,
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString()
    };
    memoryData.financial_events.push(event);

    // 2. Register Cash Movement ONLY if CASH
    if (pMethod === 'CASH') {
      const activeShift = memoryData.shifts.find(s => s.store_id === order.store_id && s.status === 'OPEN');
      const shiftId = activeShift ? activeShift.id : 901;

      memoryData.cash_movements.push({
        id: memoryData.cash_movements.length + 1,
        shift_id: shiftId,
        type: 'ADDITION',
        amount: order.total_price,
        reason: `Workshop payment for ticket ${order.ticket_number}`,
        performed_by: userName,
        created_by: userId,
        request_id: requestId,
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString()
      });
    }

    // 3. Audit Log
    memoryData.audit_logs.push({
      id: memoryData.audit_logs.length + 1,
      company_id: 1,
      store_id: order.store_id,
      user_id: userId,
      action: 'COMPLETE_REPAIR_TICKET',
      entity_type: 'RepairWorkOrder',
      entity_id: order.id,
      new_values: JSON.stringify({ ticket_number: order.ticket_number, total_price: order.total_price, payment_method: pMethod }),
      request_id: requestId,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString()
    });
  }

  return res.json(order);
};
