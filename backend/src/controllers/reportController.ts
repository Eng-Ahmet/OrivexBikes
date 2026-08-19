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
