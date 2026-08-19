import { api } from '../api.js';
import { t } from '../i18n.js';

let timerInterval = null;

export async function renderContractsPage(container) {
  if (timerInterval) clearInterval(timerInterval);

  const todayStr = new Date().toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-clock text-info me-2"></i> ${t('rentals_title')}</h2>
        <p class="text-secondary small mb-0">${t('rentals_subtitle')}</p>
      </div>

      <!-- Operational Filters: Status & Date Picker -->
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <div>
          <label class="form-label text-secondary small mb-0 me-1"><i class="fa-solid fa-calendar me-1"></i> Return Date:</label>
          <input type="date" id="filterReturnDate" class="form-control form-control-sm bg-dark text-light border-secondary d-inline-block" style="width: 150px;" value="${todayStr}" />
        </div>

        <div>
          <label class="form-label text-secondary small mb-0 me-1"><i class="fa-solid fa-filter me-1"></i> Status:</label>
          <select id="filterContractStatus" class="form-select form-select-sm bg-dark text-light border-secondary d-inline-block" style="width: 160px;">
            <option value="ALL">${t('all_statuses')}</option>
            <option value="ACTIVE" selected>${t('rented')}</option>
            <option value="COMPLETED">${t('available')}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Live Daily Operations & Overdue Return Alert Banner -->
    <div id="dailyAlertBanner" class="mb-3"></div>

    <div class="card-glass p-3 shadow-sm">
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">${t('th_contract_num')}</th>
              <th scope="col">${t('th_customer')}</th>
              <th scope="col">${t('th_vehicle')}</th>
              <th scope="col">Return Schedule</th>
              <th scope="col">${t('th_countdown')}</th>
              <th scope="col">${t('th_fee')}</th>
              <th scope="col">${t('th_neighbor_debt')}</th>
              <th scope="col">${t('th_deposit')}</th>
              <th scope="col">${t('th_status')}</th>
              <th scope="col" class="text-end">${t('th_actions')}</th>
            </tr>
          </thead>
          <tbody id="contractsTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const filterStatus = container.querySelector('#filterContractStatus');
  const filterReturnDate = container.querySelector('#filterReturnDate');
  const tableBody = container.querySelector('#contractsTableBody');
  const alertBanner = container.querySelector('#dailyAlertBanner');

  function renderTimerCell(c) {
    if (c.status === 'COMPLETED') {
      return `<span class="text-secondary font-monospace"><i class="fa-solid fa-check text-success me-1"></i> Returned</span>`;
    }

    const expectedTime = new Date(c.expected_end_time || c.end_time || c.start_time).getTime();
    const now = Date.now();
    const diff = expectedTime - now;

    if (diff > 0) {
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const remMins = minutes % 60;
      const remStr = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;

      return `
        <span class="badge bg-warning-subtle text-warning border border-warning-subtle font-monospace px-2 py-1">
          ⌛ ${remStr} ${t('remaining')}
        </span>
      `;
    } else {
      const overdueMins = Math.floor(Math.abs(diff) / 60000);
      const overdueHours = Math.floor(overdueMins / 60);
      const remOverdue = overdueMins % 60;
      const overdueStr = overdueHours > 0 ? `${overdueHours}h ${remOverdue}m` : `${remOverdue}m`;
      const estPenalty = Math.max(5, Math.ceil(overdueMins / 60) * 15);

      return `
        <span class="badge bg-danger-subtle text-danger border border-danger-subtle font-monospace px-2 py-1">
          ⚠️ ${t('overdue')} +${overdueStr} (+€${estPenalty})
        </span>
      `;
    }
  }

  async function loadContracts() {
    const contracts = await api.getRentals(filterStatus.value);
    const selectedDate = filterReturnDate.value;

    let dueTodayCount = 0;
    let overdueCount = 0;
    const now = Date.now();

    // Filter by selected return date if picked
    let displayList = contracts || [];
    if (selectedDate) {
      displayList = displayList.filter(c => {
        const retDate = (c.expected_end_time || c.start_time || '').slice(0, 10);
        return retDate === selectedDate || c.status === 'ACTIVE';
      });
    }

    // Calculate Alert Banner statistics
    (contracts || []).forEach(c => {
      if (c.status === 'ACTIVE') {
        const expectedTime = new Date(c.expected_end_time || c.start_time).getTime();
        const isToday = (c.expected_end_time || '').slice(0, 10) === todayStr;
        if (expectedTime < now) overdueCount++;
        else if (isToday) dueTodayCount++;
      }
    });

    // Render Alert Banner
    if (overdueCount > 0 || dueTodayCount > 0) {
      alertBanner.innerHTML = `
        <div class="alert alert-warning bg-dark border-warning border-2 d-flex align-items-center justify-content-between mb-0 py-2 px-3 shadow-sm">
          <div class="d-flex align-items-center">
            <span class="fs-5 me-2">🔔</span>
            <div>
              <strong class="text-warning">Daily Returns Alert:</strong>
              <span class="text-light ms-1">${dueTodayCount} vehicle(s) scheduled for return today.</span>
              ${overdueCount > 0 ? `<strong class="text-danger ms-2"><i class="fa-solid fa-triangle-exclamation me-1"></i> ${overdueCount} OVERDUE return(s) require action!</strong>` : ''}
            </div>
          </div>
          <button class="btn btn-outline-warning btn-sm fw-bold" onclick="document.getElementById('filterContractStatus').value='ACTIVE'; document.getElementById('filterContractStatus').dispatchEvent(new Event('change'));">
            Inspect Active Rentals
          </button>
        </div>
      `;
    } else {
      alertBanner.innerHTML = `
        <div class="alert alert-secondary bg-dark border-secondary d-flex align-items-center py-2 px-3 mb-0 small">
          <i class="fa-solid fa-circle-check text-success me-2"></i> All daily vehicle returns are on schedule with 0 overdue items.
        </div>
      `;
    }

    tableBody.innerHTML = '';

    if (!displayList || displayList.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-secondary py-4">No vehicle rental contracts recorded for the selected filter date (${selectedDate || 'Today'}).</td></tr>`;
      return;
    }

    displayList.forEach(c => {
      const tr = document.createElement('tr');
      const isCompleted = c.status === 'COMPLETED';
      const isNeighbor = c.item_owner === 'NEIGHBOR';

      let debtHtml = `<span class="text-secondary">-</span>`;
      if (isNeighbor && c.neighbor_payout) {
        debtHtml = `<span class="text-warning font-monospace fw-bold">€${Number(c.neighbor_payout).toFixed(2)}</span> <br/><small class="text-secondary">Owed to ${c.neighbor_name || 'Partner'}</small>`;
      }

      const returnTimeFormatted = new Date(c.expected_end_time || c.start_time).toLocaleString();

      tr.innerHTML = `
        <td class="fw-bold text-info font-monospace">${c.contract_number}</td>
        <td class="fw-semibold text-light">${c.customer_name} <br/><small class="text-secondary"><i class="fa-solid fa-phone me-1"></i>${c.customer_phone}</small></td>
        <td><strong class="text-light">${c.vehicle_name || 'Unit'}</strong> <br/><small class="text-secondary font-monospace">QR: ${c.qr_code || '-'}</small></td>
        <td>
          <span class="badge ${isNeighbor ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-info-subtle text-info border border-info-subtle'}">
            ${isNeighbor ? `Neighbor (${c.neighbor_name || 'Partner'})` : 'Store Unit'}
          </span>
        </td>
        <td class="font-monospace text-secondary small"><i class="fa-solid fa-calendar-check me-1 text-info"></i> ${returnTimeFormatted}</td>
        <td class="timer-cell">${renderTimerCell(c)}</td>
        <td class="fw-bold text-light">€${(c.rental_fee || 0).toFixed(2)}</td>
        <td>${debtHtml}</td>
        <td class="fw-semibold text-warning font-monospace">€${(c.deposit_collected || 0).toFixed(2)}</td>
        <td>
          <span class="badge ${isCompleted ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success border border-success-subtle'} rounded-pill">
            ${isCompleted ? 'Completed' : 'Active'}
          </span>
        </td>
        <td class="text-end">
          ${isCompleted ? `
            <button class="btn btn-outline-secondary btn-sm disabled"><i class="fa-solid fa-check me-1"></i> Returned</button>
          ` : `
            <button class="btn btn-success btn-sm btn-return-contract fw-bold" data-id="${c.id}">
              <i class="fa-solid fa-flag-checkered me-1"></i> ${t('modal_return_title').split(' ')[0]}
            </button>
          `}
        </td>
      `;

      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.btn-return-contract').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        window.dispatchEvent(new CustomEvent('app:openReturnModal', { detail: { contractId: id } }));
      });
    });
  }

  filterStatus.addEventListener('change', loadContracts);
  filterReturnDate.addEventListener('change', loadContracts);

  await loadContracts();

  timerInterval = setInterval(() => {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(tr => {
      const timerCell = tr.querySelector('.timer-cell');
      const btnReturn = tr.querySelector('.btn-return-contract');
      if (timerCell && btnReturn) {
        const id = Number(btnReturn.getAttribute('data-id'));
        api.getRentals('ACTIVE').then(list => {
          const contract = list.find(c => c.id === id);
          if (contract) timerCell.innerHTML = renderTimerCell(contract);
        });
      }
    });
  }, 10000);
}
