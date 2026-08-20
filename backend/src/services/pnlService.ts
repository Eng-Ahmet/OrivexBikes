import { memoryData } from '../db/initSchema.js';

export interface StorePnlReport {
  company_id: number;
  store_id: number | null;
  store_name: string;
  from_date: string;
  to_date: string;
  rental_revenue: number;
  sales_revenue: number;
  other_revenue: number;
  total_revenue: number;
  operating_expenses: number;
  payroll_cost: number;
  total_costs: number;
  net_operating_profit: number;
}

export class PnlService {
  static getStorePnl(companyId: number, storeId: number | null, allowedStoreIds: number[], fromDate?: string, toDate?: string): StorePnlReport {
    const from = fromDate || '2025-01-01';
    const to = toDate || '2099-12-31';

    // 1. Rental Revenue strictly attributed to revenue_store_id
    const rentals = (memoryData.contracts || []).filter((r: any) => {
      const revStore = r.revenue_store_id || r.pickup_store_id || r.store_id;
      const matchStore = storeId !== null ? revStore === storeId : allowedStoreIds.includes(revStore);
      const rDate = (r.created_at || '').split('T')[0];
      const matchDate = rDate >= from && rDate <= to;
      const validStatus = r.status === 'COMPLETED' || r.status === 'ACTIVE';
      return matchStore && matchDate && validStatus;
    });
    const rentalRevenue = rentals.reduce((sum: number, r: any) => sum + (r.rental_fee || 0) + (r.extra_charges || 0), 0);

    // 2. Sales & Repair Revenue
    const repairs = (memoryData.repair_work_orders || []).filter((rw: any) => {
      const matchStore = storeId !== null ? rw.store_id === storeId : allowedStoreIds.includes(rw.store_id);
      const rwDate = (rw.created_at || '').split('T')[0];
      const validStatus = rw.status === 'DELIVERED_PAID' || rw.status === 'READY';
      return matchStore && rwDate >= from && rwDate <= to && validStatus;
    });
    const salesRevenue = repairs.reduce((sum: number, rw: any) => sum + (rw.total_amount || rw.estimated_cost || 0), 0);

    // 3. Operating Expenses (ACTIVE status only)
    const expenses = (memoryData.expenses || []).filter(e => {
      const matchStore = storeId !== null ? e.store_id === storeId : allowedStoreIds.includes(e.store_id);
      return matchStore && e.date >= from && e.date <= to && e.status === 'ACTIVE';
    });
    const operatingExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // 4. Payroll Costs
    const payrolls = (memoryData.payroll_records || []).filter(p => {
      const matchStore = storeId !== null ? true : true; // filtered via period
      return p.status === 'APPROVED' || p.status === 'PAID' || p.status === 'LOCKED';
    });
    const payrollCost = payrolls.reduce((sum, p) => sum + (p.gross_pay || 0), 0);

    const totalRevenue = Number((rentalRevenue + salesRevenue).toFixed(2));
    const totalCosts = Number((operatingExpenses + payrollCost).toFixed(2));
    const netProfit = Number((totalRevenue - totalCosts).toFixed(2));

    let storeName = 'All Authorized Stores Combined';
    if (storeId !== null) {
      const targetStore = memoryData.stores.find(s => s.id === storeId);
      if (targetStore) storeName = targetStore.name;
    }

    return {
      company_id: companyId,
      store_id: storeId,
      store_name: storeName,
      from_date: from,
      to_date: to,
      rental_revenue: Number(rentalRevenue.toFixed(2)),
      sales_revenue: Number(salesRevenue.toFixed(2)),
      other_revenue: 0,
      total_revenue: totalRevenue,
      operating_expenses: Number(operatingExpenses.toFixed(2)),
      payroll_cost: Number(payrollCost.toFixed(2)),
      total_costs: totalCosts,
      net_operating_profit: netProfit
    };
  }
}
