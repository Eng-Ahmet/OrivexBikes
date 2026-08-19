import { Request, Response } from 'express';
import { memoryData, RepairWorkOrder } from '../db/initSchema.js';

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

export const createRepairWorkOrder = (req: Request, res: Response) => {
  const { customer_name, customer_phone, device_model, issue_description, parts_used, parts_cost, labor_cost } = req.body;

  if (!customer_name || !device_model || !issue_description) {
    return res.status(400).json({ error: 'Customer name, device model, and issue description are required' });
  }

  const pCost = Number(parts_cost || 0);
  const lCost = Number(labor_cost || 15);
  const totalPrice = pCost + lCost;

  const ticketNum = `REP-2026-${String(memoryData.repair_work_orders.length + 1).padStart(3, '0')}`;

  const newOrder: RepairWorkOrder = {
    id: Date.now(),
    ticket_number: ticketNum,
    store_id: Number(req.body.store_id || 1),
    customer_name,
    customer_phone: customer_phone || '-',
    device_model,
    issue_description,
    parts_used: parts_used || '-',
    parts_cost: pCost,
    labor_cost: lCost,
    total_price: totalPrice,
    status: 'RECEIVED',
    created_at: new Date().toISOString()
  };

  memoryData.repair_work_orders.unshift(newOrder);
  return res.status(201).json(newOrder);
};

export const updateRepairWorkOrderStatus = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const order = memoryData.repair_work_orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Repair work order ticket not found' });

  if (status) {
    order.status = status;
  }

  return res.json(order);
};
