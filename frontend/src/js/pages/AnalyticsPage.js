import { api } from '../api.js';

export async function renderAnalyticsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">📊 Admin Analytics & Financial Overview</h2>
        <p class="text-secondary small mb-0">Executive breakdown of revenue, cash vs card sales, & held deposits</p>
      </div>
    </div>

    <!-- Bootstrap KPI Cards Row -->
    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
      <div class="col">
        <div class="card-glass p-3 h-100 border-start border-3 border-cyan">
          <div class="text-secondary small">Total Gross Revenue</div>
          <div id="kpiTotalRevenue" class="fs-3 fw-bold text-info mt-1">€0.00</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100 border-start border-3 border-success">
          <div class="text-secondary small">Cash Sales</div>
          <div id="kpiCashSales" class="fs-3 fw-bold text-success mt-1">€0.00</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100 border-start border-3 border-primary">
          <div class="text-secondary small">Card (VISA) Sales</div>
          <div id="kpiCardSales" class="fs-3 fw-bold text-primary mt-1">€0.00</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100 border-start border-3 border-warning">
          <div class="text-secondary small">Active Deposits Held</div>
          <div id="kpiDeposits" class="fs-3 fw-bold text-warning mt-1">€0.00</div>
        </div>
      </div>
    </div>
  `;

  const rep = await api.getDashboardReport();
  if (rep) {
    container.querySelector('#kpiTotalRevenue').textContent = `€${(rep.totalRevenue || 0).toFixed(2)}`;
    container.querySelector('#kpiCashSales').textContent = `€${(rep.cashSales || 0).toFixed(2)}`;
    container.querySelector('#kpiCardSales').textContent = `€${(rep.cardSales || 0).toFixed(2)}`;
    container.querySelector('#kpiDeposits').textContent = `€${(rep.totalDepositsHeld || 0).toFixed(2)}`;
  }
}
