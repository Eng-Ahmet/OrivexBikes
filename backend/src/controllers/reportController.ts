import { Response } from 'express';
import { memoryData } from '../db/initSchema.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardReport = (req: AuthRequest, res: Response) => {
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
};

export const getDailyReport = (req: AuthRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const scope = req.storeScope;
  const storeId = scope?.activeStoreId || (req.query.store_id ? Number(req.query.store_id) : 1);

  const contracts = memoryData.contracts.filter(c => (c.store_id === storeId || !storeId) && (c.created_at || '').startsWith(date));
  const totalRevenue = contracts.reduce((sum, c) => sum + (c.rental_fee || 0) + (c.extra_charges || 0), 0);

  return res.json({
    date,
    store_id: storeId,
    total_contracts: contracts.length,
    total_revenue: totalRevenue,
    contracts
  });
};

export const getMonthlyReport = (req: AuthRequest, res: Response) => {
  const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
  const scope = req.storeScope;
  const storeId = scope?.activeStoreId || (req.query.store_id ? Number(req.query.store_id) : 1);

  const contracts = memoryData.contracts.filter(c => (c.store_id === storeId || !storeId) && (c.created_at || '').startsWith(month));
  const totalRevenue = contracts.reduce((sum, c) => sum + (c.rental_fee || 0) + (c.extra_charges || 0), 0);

  return res.json({
    month,
    store_id: storeId,
    total_contracts: contracts.length,
    total_revenue: totalRevenue,
    contracts
  });
};

