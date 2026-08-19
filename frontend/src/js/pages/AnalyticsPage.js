import { api } from '../api.js';

export async function renderAnalyticsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Financial Analytics & Performance Dashboard</h2>
        <p class="page-desc">Store revenue breakdown, cash vs card summary & fleet utilization</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card glass-panel">
        <div class="kpi-icon">💰</div>
        <div class="kpi-details">
          <span class="kpi-title">Total Revenue Today</span>
          <span id="kpiTotalRevenue" class="kpi-value">€0.00</span>
        </div>
      </div>

      <div class="kpi-card glass-panel">
        <div class="kpi-icon">💵</div>
        <div class="kpi-details">
          <span class="kpi-title">Cash Payments</span>
          <span id="kpiCashSales" class="kpi-value">€0.00</span>
        </div>
      </div>

      <div class="kpi-card glass-panel">
        <div class="kpi-icon">💳</div>
        <div class="kpi-details">
          <span class="kpi-title">Card Payments</span>
          <span id="kpiCardSales" class="kpi-value">€0.00</span>
        </div>
      </div>

      <div class="kpi-card glass-panel">
        <div class="kpi-icon">🔒</div>
        <div class="kpi-details">
          <span class="kpi-title">Active Deposits Held</span>
          <span id="kpiDeposits" class="kpi-value">€0.00</span>
        </div>
      </div>
    </div>
  `;

  const rep = await api.getDashboardReport();
  container.querySelector('#kpiTotalRevenue').textContent = `€${rep.totalRevenue.toFixed(2)}`;
  container.querySelector('#kpiCashSales').textContent = `€${rep.cashSales.toFixed(2)}`;
  container.querySelector('#kpiCardSales').textContent = `€${rep.cardSales.toFixed(2)}`;
  container.querySelector('#kpiDeposits').textContent = `€${rep.totalDepositsHeld.toFixed(2)}`;
}
