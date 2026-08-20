import { Response } from 'express';
import { memoryData, Vehicle } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getVehicles = (req: AuthRequest, res: Response) => {
  const storeId = req.query.store_id ? Number(req.query.store_id) : req.user?.store_id;
  const category = req.query.category as string;
  const status = req.query.status as string;
  const search = (req.query.q as string || '').toLowerCase().trim();

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
  if (search) {
    result = result.filter(v => 
      v.name.toLowerCase().includes(search) ||
      v.qr_code.toLowerCase().includes(search) ||
      v.frame_number.toLowerCase().includes(search) ||
      v.category.toLowerCase().includes(search)
    );
  }

  // Pagination support
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 50));
  const startIndex = (page - 1) * limit;
  const paginatedResult = result.slice(startIndex, startIndex + limit);

  return res.json({
    total: result.length,
    page,
    limit,
    vehicles: paginatedResult
  });
};

export const createVehicle = (req: AuthRequest, res: Response) => {
  const { name, category, hourly_rate, daily_rate, deposit_amount, store_id, battery_level } = req.body;

  if (!name) return res.status(400).json({ error: 'Vehicle name is required' });

  const newVehicle: Vehicle = {
    id: Date.now(),
    store_id: Number(store_id || req.user?.store_id || 1),
    category: category || 'City Bike',
    qr_code: `QQ-${(category || 'CB').substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
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
};

export const updateVehicleStatus = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const vehicle = memoryData.vehicles.find(v => v.id === id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  vehicle.status = status;
  return res.json(vehicle);
};

export const transferVehicle = (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { target_store_id, reason } = req.body;
  const scope = req.storeScope!;

  if (!target_store_id) {
    return res.status(400).json({ error: 'Target store ID is required for vehicle transfer' });
  }

  const targetStoreId = Number(target_store_id);
  if (!scope.allowedStoreIds.includes(targetStoreId)) {
    return res.status(403).json({ error: 'Access denied: Unauthorized target store context' });
  }

  const vehicle = memoryData.vehicles.find(v => v.id === id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const nowIso = new Date().toISOString();

  // 1. Close active FleetLocationHistory
  const activeHist = memoryData.fleet_location_history.find(h => h.vehicle_id === vehicle.id && h.effective_end === null);
  if (activeHist) {
    activeHist.effective_end = nowIso;
  }

  // 2. Create new FleetLocationHistory
  const newHist = {
    id: Date.now(),
    company_id: scope.companyId,
    vehicle_id: vehicle.id,
    store_id: targetStoreId,
    effective_start: nowIso,
    effective_end: null,
    reason: reason || `Fleet relocation from store #${vehicle.current_store_id || vehicle.store_id} to #${targetStoreId}`,
    transferred_by: req.user?.id || 1,
    created_at: nowIso
  };
  memoryData.fleet_location_history.push(newHist);

  // 3. Update vehicle current store pointer
  const oldStoreId = vehicle.current_store_id || vehicle.store_id;
  vehicle.current_store_id = targetStoreId;
  vehicle.store_id = targetStoreId;

  // 4. Audit Log
  memoryData.audit_logs.push({
    id: memoryData.audit_logs.length + 1,
    company_id: scope.companyId,
    store_id: targetStoreId,
    user_id: req.user?.id || 1,
    action: 'VEHICLE_TRANSFER',
    entity_type: 'Vehicle',
    entity_id: vehicle.id,
    new_values: JSON.stringify({ from_store: oldStoreId, to_store: targetStoreId, reason, timestamp: nowIso }),
    request_id: `req-${Date.now()}`,
    created_at: nowIso
  });

  return res.json({ message: `Vehicle transferred to store #${targetStoreId} successfully`, vehicle, history: newHist });
};

