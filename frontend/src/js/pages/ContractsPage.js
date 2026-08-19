import { api } from '../api.js';
import { t } from '../i18n.js';

let timerInterval = null;

export async function renderContractsPage(container) {
  if (timerInterval) clearInterval(timerInterval);

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-clock text-info me-2"></i> ${t('rentals_title')}</h2>
        <p class="text-secondary small mb-0">${t('rentals_subtitle')}</p>
      </div>
      <div>
        <select id="filterContractStatus" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: 180px;">
          <option value="ALL">${t('all_statuses')}</option>
          <option value="ACTIVE">${t('rented')}</option>
          <option value="COMPLETED">${t('available')}</option>
        </select>
      </div>
    </div>

    <div class="card-glass p-3 shadow-sm">
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">${t('th_contract_num')}</th>
              <th scope="col">${t('th_customer')}</th>
              <th scope="col">${t('th_vehicle')}</th>
              <th scope="col">${t('th_ownership')}</th>
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
  const tableBody = container.querySelector('#contractsTableBody');

  function renderTimerCell(c) {
    if (c.status === 'COMPLETED') {
      return `<span class="text-secondary">Completed</span>`;
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
        <span class="badge bg-info-subtle text-info border border-info-subtle font-monospace px-2 py-1">
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
        <span class="badge bg-danger-subtle text-danger border border-danger-subtle font-monospace px-2 py-1 pulse-dot">
          ⚠️ ${t('overdue')} +${overdueStr} (+€${estPenalty})
        </span>
      `;
    }
  }

  async function loadContracts() {
    const contracts = await api.getRentals(filterStatus.value);
    tableBody.innerHTML = '';

    if (!contracts || contracts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-secondary py-4">No contracts found matching current filter. Click "New Rental Contract" to issue one!</td></tr>`;
      return;
    }

    contracts.forEach(c => {
      const tr = document.createElement('tr');
      const isCompleted = c.status === 'COMPLETED';
      const isNeighbor = c.item_owner === 'NEIGHBOR';

      let debtHtml = `<span class="text-secondary">-</span>`;
      if (isNeighbor && c.neighbor_payout) {
        debtHtml = `<span class="badge bg-warning-subtle text-warning border border-warning-subtle">€${c.neighbor_payout.toFixed(2)} (Owed to ${c.neighbor_name || 'Partner'})</span>`;
      }

      tr.innerHTML = `
        <td class="fw-bold text-info">
          ${c.contract_number}
          ${c.extensions && c.extensions.length > 0 ? `<div class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.65rem;">🔄 Extended (${c.extensions.length})</div>` : ''}
        </td>
        <td>
          <div class="fw-semibold text-light">${c.customer_name}</div>
          <div class="text-secondary" style="font-size: 0.75rem;">${c.customer_passport} • ${c.customer_phone}</div>
        </td>
        <td class="fw-semibold">${c.vehicle_name}</td>
        <td>
          ${isNeighbor ? `
            <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill"><i class="fa-solid fa-handshake me-1"></i> ${t('neighbor_owned')} (${c.neighbor_name || 'Partner'})</span>
          ` : `
            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill"><i class="fa-solid fa-house me-1"></i> ${t('store_owned')}</span>
          `}
        </td>
        <td class="timer-cell" data-id="${c.id}">${renderTimerCell(c)}</td>
        <td class="fw-bold text-light">€${c.rental_fee.toFixed(2)} <span class="badge bg-secondary-subtle text-secondary">${c.payment_method}</span></td>
        <td>${debtHtml}</td>
        <td class="text-warning fw-semibold">€${c.deposit_collected.toFixed(2)}</td>
        <td>
          <span class="badge ${c.status === 'ACTIVE' ? 'badge-rented' : 'badge-available'} rounded-pill">${c.status}</span>
        </td>
        <td class="text-end">
          ${!isCompleted ? `
            <div class="d-flex gap-1 justify-content-end">
              <button class="btn btn-outline-info btn-sm fw-semibold extend-btn" data-id="${c.id}">
                <i class="fa-solid fa-rotate-right me-1"></i> ${t('btn_extend')}
              </button>
              <button class="btn btn-success btn-sm fw-semibold return-btn" data-id="${c.id}">
                <i class="fa-solid fa-flag-checkered me-1"></i> ${t('btn_return')}
              </button>
            </div>
          ` : `
            <span class="text-success small fw-semibold">✓ Released</span>
          `}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.return-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        window.dispatchEvent(new CustomEvent('app:openReturnModal', { detail: { contractId: id } }));
      });
    });

    tableBody.querySelectorAll('.extend-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        window.dispatchEvent(new CustomEvent('app:openExtendModal', { detail: { contractId: id } }));
      });
    });
  }

  timerInterval = setInterval(async () => {
    const contracts = await api.getRentals(filterStatus.value);
    container.querySelectorAll('.timer-cell').forEach(cell => {
      const cId = Number(cell.getAttribute('data-id'));
      const c = contracts.find(item => item.id === cId);
      if (c) {
        cell.innerHTML = renderTimerCell(c);
      }
    });
  }, 3000);

  filterStatus.addEventListener('change', loadContracts);
  await loadContracts();
}
