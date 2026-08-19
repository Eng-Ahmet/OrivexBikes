import { api, state } from '../api.js';
import { t } from '../i18n.js';

export async function renderAnalyticsPage(container) {
  const isAdmin = state.activeRole === 'ADMIN';

  if (!isAdmin) {
    container.innerHTML = `
      <div class="card-glass p-4 text-center text-danger my-5">
        <i class="fa-solid fa-lock fs-1 mb-2"></i>
        <h4>Admin Access Restricted</h4>
        <p class="text-secondary mb-0">You must be logged in as an Admin Manager (Miguel or Quique) to access executive analytics and historical date range audits.</p>
      </div>
    `;
    return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-chart-line text-info me-2"></i> ${t('analytics_title')}</h2>
        <p class="text-secondary small mb-0">${t('analytics_subtitle')}</p>
      </div>

      <!-- CUSTOM DATE RANGE PICKER -->
      <div class="d-flex flex-wrap align-items-center gap-2 bg-dark bg-opacity-75 p-2 rounded border border-secondary">
        <div class="d-flex align-items-center gap-1">
          <label class="text-secondary small me-1">From:</label>
          <input type="date" id="adminFromDate" class="form-control form-control-sm bg-dark text-light border-secondary" value="${todayStr}" style="width: 140px;" />
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="text-secondary small me-1">To:</label>
          <input type="date" id="adminToDate" class="form-control form-control-sm bg-dark text-light border-secondary" value="${todayStr}" style="width: 140px;" />
        </div>
        <button id="btnFilterDateRange" class="btn btn-info btn-sm fw-bold">
          <i class="fa-solid fa-filter me-1"></i> Filter Date Range
        </button>
      </div>
    </div>

    <!-- Financial KPI Summary Cards -->
    <div id="analyticsKpiRow" class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3 mb-4"></div>

    <!-- Historical Activity Tabs: Contracts | Workshop Repairs | Shift Audits -->
    <div class="card-glass p-3 shadow-sm">
      <ul class="nav nav-tabs border-secondary mb-3" id="adminAuditTabs">
        <li class="nav-item">
          <button class="nav-link active text-light fw-bold" id="tabContractsBtn" data-bs-toggle="tab" data-bs-target="#tabContracts">
            <i class="fa-solid fa-file-contract me-1 text-info"></i> Rental Contracts History
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-light fw-bold" id="tabRepairsBtn" data-bs-toggle="tab" data-bs-target="#tabRepairs">
            <i class="fa-solid fa-screwdriver-wrench me-1 text-warning"></i> Workshop Repairs History
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link text-light fw-bold" id="tabShiftsBtn" data-bs-toggle="tab" data-bs-target="#tabShifts">
            <i class="fa-solid fa-clock-rotate-left me-1 text-success"></i> Shift Audits & Cash Logs
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <!-- Tab 1: Rental Contracts -->
        <div class="tab-pane fade show active" id="tabContracts">
          <div class="table-responsive mb-3">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Contract #</th>
                  <th scope="col">Date / Time</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Rental Fee</th>
                  <th scope="col">Deposit</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody id="adminContractsBody"></tbody>
            </table>
          </div>

          <!-- Contracts 50-Item Pagination Controls -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top border-secondary" id="contractsPagControls"></div>
        </div>

        <!-- Tab 2: Workshop Repairs -->
        <div class="tab-pane fade" id="tabRepairs">
          <div class="table-responsive mb-3">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Ticket #</th>
                  <th scope="col">Date / Time</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Device Model</th>
                  <th scope="col">Reported Issue</th>
                  <th scope="col">Parts Used</th>
                  <th scope="col">Total Price (€)</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody id="adminRepairsBody"></tbody>
            </table>
          </div>

          <!-- Repairs 50-Item Pagination Controls -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top border-secondary" id="repairsPagControls"></div>
        </div>

        <!-- Tab 3: Shift Audits & Cash Logs -->
        <div class="tab-pane fade" id="tabShifts">
          <div class="table-responsive mb-3">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Date / Time</th>
                  <th scope="col">Operator</th>
                  <th scope="col">Opening Float</th>
                  <th scope="col">Cash Rentals</th>
                  <th scope="col">Withdrawals</th>
                  <th scope="col">Expected</th>
                  <th scope="col">Closing Drawer</th>
                  <th scope="col">Discrepancy</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody id="adminShiftsBody"></tbody>
            </table>
          </div>

          <!-- Shifts 50-Item Pagination Controls -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top border-secondary" id="shiftsPagControls"></div>
        </div>
      </div>
    </div>
  `;

  const fromDateInput = container.querySelector('#adminFromDate');
  const toDateInput = container.querySelector('#adminToDate');
  const btnFilter = container.querySelector('#btnFilterDateRange');
  const kpiRow = container.querySelector('#analyticsKpiRow');
  const contractsBody = container.querySelector('#adminContractsBody');
  const repairsBody = container.querySelector('#adminRepairsBody');
  const shiftsBody = container.querySelector('#adminShiftsBody');

  const contractsPagControls = container.querySelector('#contractsPagControls');
  const repairsPagControls = container.querySelector('#repairsPagControls');
  const shiftsPagControls = container.querySelector('#shiftsPagControls');

  const ITEMS_PER_PAGE = 50;
  let currentContractsPage = 1;
  let currentRepairsPage = 1;
  let currentShiftsPage = 1;

  let filteredRentals = [];
  let filteredRepairs = [];
  let filteredShifts = [];

  function renderPagination(controlsEl, currentPage, totalItems, onPageChange) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    controlsEl.innerHTML = `
      <div class="text-secondary small">
        Showing <strong class="text-light">${startItem} - ${endItem}</strong> of <strong class="text-info">${totalItems}</strong> records (50 per page)
      </div>
      <nav>
        <ul class="pagination pagination-sm pagination-glass mb-0">
          <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
            <button class="page-link" id="prevPageBtn"><i class="fa-solid fa-chevron-left"></i> Previous</button>
          </li>
          <li class="page-item active">
            <span class="page-link">Page ${currentPage} of ${totalPages}</span>
          </li>
          <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
            <button class="page-link" id="nextPageBtn">Next <i class="fa-solid fa-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    `;

    const prevBtn = controlsEl.querySelector('#prevPageBtn');
    const nextBtn = controlsEl.querySelector('#nextPageBtn');

    if (prevBtn && currentPage > 1) {
      prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    }
    if (nextBtn && currentPage < totalPages) {
      nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    }
  }

  function renderContractsTable() {
    const startIdx = (currentContractsPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredRentals.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    contractsBody.innerHTML = pageItems.length === 0 ? `
      <tr><td colspan="8" class="text-center text-secondary py-4">No rental contracts found for selected date range.</td></tr>
    ` : pageItems.map(c => `
      <tr>
        <td class="fw-bold text-info">${c.contract_number}</td>
        <td class="font-monospace text-secondary">${new Date(c.start_time || c.created_at).toLocaleString()}</td>
        <td class="fw-semibold text-light">${c.customer_name} <span class="text-secondary small">(${c.customer_passport})</span></td>
        <td class="fw-semibold">${c.vehicle_name}</td>
        <td class="fw-bold text-light">€${(c.rental_fee || 0).toFixed(2)}</td>
        <td class="text-warning">€${(c.deposit_collected || 0).toFixed(2)}</td>
        <td><span class="badge bg-secondary-subtle text-secondary">${c.payment_method}</span></td>
        <td><span class="badge ${c.status === 'ACTIVE' ? 'badge-rented' : 'badge-available'} rounded-pill">${c.status}</span></td>
      </tr>
    `).join('');

    renderPagination(contractsPagControls, currentContractsPage, filteredRentals.length, (newPage) => {
      currentContractsPage = newPage;
      renderContractsTable();
    });
  }

  function renderRepairsTable() {
    const startIdx = (currentRepairsPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredRepairs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    repairsBody.innerHTML = pageItems.length === 0 ? `
      <tr><td colspan="8" class="text-center text-secondary py-4">No workshop repair tickets found for selected date range.</td></tr>
    ` : pageItems.map(r => `
      <tr>
        <td class="fw-bold text-warning">${r.ticket_number}</td>
        <td class="font-monospace text-secondary">${new Date(r.created_at).toLocaleString()}</td>
        <td class="fw-semibold text-light">${r.customer_name} <span class="text-secondary small">(${r.customer_phone})</span></td>
        <td>${r.device_model}</td>
        <td class="text-secondary">${r.reported_issue}</td>
        <td class="small">${Array.isArray(r.parts_used) ? r.parts_used.join(', ') : (r.parts_used || '-')}</td>
        <td class="fw-bold text-success">€${(r.total_price || 0).toFixed(2)}</td>
        <td><span class="badge bg-info-subtle text-info rounded-pill">${r.status}</span></td>
      </tr>
    `).join('');

    renderPagination(repairsPagControls, currentRepairsPage, filteredRepairs.length, (newPage) => {
      currentRepairsPage = newPage;
      renderRepairsTable();
    });
  }

  function renderShiftsTable() {
    const startIdx = (currentShiftsPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredShifts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    shiftsBody.innerHTML = pageItems.length === 0 ? `
      <tr><td colspan="9" class="text-center text-secondary py-4">No shift closures found for selected date range.</td></tr>
    ` : pageItems.map(s => {
      const disc = Number(s.discrepancy || 0);
      let discBadge = `<span class="badge bg-success-subtle text-success">€0.00</span>`;
      if (disc > 0) discBadge = `<span class="badge bg-success-subtle text-success">+€${disc.toFixed(2)}</span>`;
      if (disc < 0) discBadge = `<span class="badge bg-danger-subtle text-danger">-€${Math.abs(disc).toFixed(2)}</span>`;

      return `
        <tr>
          <td class="font-monospace text-secondary">${new Date(s.closed_at || s.created_at).toLocaleString()}</td>
          <td class="fw-bold text-info"><i class="fa-solid fa-user me-1"></i> ${s.employee_name}</td>
          <td>€${(s.opening_cash || 0).toFixed(2)}</td>
          <td class="text-success">+€${(s.cash_sales || 0).toFixed(2)}</td>
          <td class="text-danger">-€${(s.total_withdrawals || 0).toFixed(2)}</td>
          <td class="fw-bold">€${(s.expected_cash || 0).toFixed(2)}</td>
          <td class="fw-bold text-light">€${(s.closing_cash || 0).toFixed(2)}</td>
          <td>${discBadge}</td>
          <td class="text-secondary small">${s.notes || '-'}</td>
        </tr>
      `;
    }).join('');

    renderPagination(shiftsPagControls, currentShiftsPage, filteredShifts.length, (newPage) => {
      currentShiftsPage = newPage;
      renderShiftsTable();
    });
  }

  async function loadAdminData() {
    const fromVal = fromDateInput.value;
    const toVal = toDateInput.value;

    const fromTs = new Date(`${fromVal}T00:00:00`).getTime();
    const toTs = new Date(`${toVal}T23:59:59`).getTime();

    const [report, rentals, repairs, shiftLogs] = await Promise.all([
      api.getDashboardReport(),
      api.getRentals('ALL'),
      api.getRepairWorkOrders(),
      api.getShiftHistory()
    ]);

    filteredRentals = (rentals || []).filter(c => {
      const cTs = new Date(c.start_time || c.created_at).getTime();
      return cTs >= fromTs && cTs <= toTs;
    });

    filteredRepairs = (repairs || []).filter(r => {
      const rTs = new Date(r.created_at).getTime();
      return rTs >= fromTs && rTs <= toTs;
    });

    filteredShifts = (shiftLogs || []).filter(s => {
      const sTs = new Date(s.closed_at || s.created_at).getTime();
      return sTs >= fromTs && sTs <= toTs;
    });

    // Calculate dynamic KPIs for filtered period
    const periodRevenue = filteredRentals.reduce((sum, c) => sum + (c.rental_fee || 0), 0) + filteredRepairs.reduce((sum, r) => sum + (r.total_price || 0), 0);
    const periodCash = filteredRentals.filter(c => c.payment_method === 'CASH').reduce((sum, c) => sum + (c.rental_fee || 0), 0);
    const periodCard = filteredRentals.filter(c => c.payment_method === 'CARD').reduce((sum, c) => sum + (c.rental_fee || 0), 0);
    const periodDeposits = filteredRentals.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + (c.deposit_collected || 0), 0);

    kpiRow.innerHTML = `
      <div class="col">
        <div class="card-glass p-3 h-100">
          <div class="text-secondary small mb-1">${t('kpi_total_revenue')} (${fromVal})</div>
          <div class="fs-3 fw-bold text-info">€${periodRevenue.toFixed(2)}</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100">
          <div class="text-secondary small mb-1">${t('kpi_cash_sales')}</div>
          <div class="fs-3 fw-bold text-success">€${periodCash.toFixed(2)}</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100">
          <div class="text-secondary small mb-1">${t('kpi_card_sales')}</div>
          <div class="fs-3 fw-bold text-primary">€${periodCard.toFixed(2)}</div>
        </div>
      </div>
      <div class="col">
        <div class="card-glass p-3 h-100">
          <div class="text-secondary small mb-1">${t('kpi_deposits')}</div>
          <div class="fs-3 fw-bold text-warning">€${periodDeposits.toFixed(2)}</div>
        </div>
      </div>
    `;

    currentContractsPage = 1;
    currentRepairsPage = 1;
    currentShiftsPage = 1;

    renderContractsTable();
    renderRepairsTable();
    renderShiftsTable();
  }

  btnFilter.addEventListener('click', loadAdminData);
  await loadAdminData();
}
