import { api } from '../api.js';

let timerInterval = null;

export async function renderContractsPage(container) {
  if (timerInterval) clearInterval(timerInterval);

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">📋 Active Rentals & Partner Debt Ledger</h2>
        <p class="text-secondary small mb-0">Real-time stopwatch timers, active rental contracts, & neighbor partner payout audit</p>
      </div>
      <div>
        <select id="filterContractStatus" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: 180px;">
          <option value="ALL">All Contracts</option>
          <option value="ACTIVE">Active Rentals</option>
          <option value="COMPLETED">Returned & Completed</option>
        </select>
      </div>
    </div>

    <div class="card-glass p-3 shadow-sm">
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.875rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Contract #</th>
              <th scope="col">Customer</th>
              <th scope="col">Vehicle / Equipment</th>
              <th scope="col">Ownership / Partner</th>
              <th scope="col">Elapsed Time (Stopwatch)</th>
              <th scope="col">Rental Fee</th>
              <th scope="col">Neighbor Debt (من مدين لمن)</th>
              <th scope="col">Deposit</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="contractsTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const filterStatus = container.querySelector('#filterContractStatus');
  const tableBody = container.querySelector('#contractsTableBody');

  function formatElapsed(startTimeStr) {
    const start = new Date(startTimeStr).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - start) / 1000));

    const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
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
        <td class="fw-bold text-info">${c.contract_number}</td>
        <td>
          <div class="fw-semibold text-light">${c.customer_name}</div>
          <div class="text-secondary" style="font-size: 0.75rem;">${c.customer_passport}</div>
        </td>
        <td class="fw-semibold">${c.vehicle_name}</td>
        <td>
          ${isNeighbor ? `
            <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill">🤝 NEIGHBOR (${c.neighbor_name || 'Partner'})</span>
          ` : `
            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">🏠 STORE OWNED</span>
          `}
        </td>
        <td>
          ${!isCompleted ? `
            <span class="elapsed-timer badge bg-info-subtle text-info border border-info-subtle font-monospace px-2 py-1" data-start="${c.start_time}">
              ⏱️ ${formatElapsed(c.start_time)}
            </span>
          ` : `
            <span class="text-secondary">Completed</span>
          `}
        </td>
        <td class="fw-bold text-light">€${c.rental_fee.toFixed(2)} <span class="badge bg-secondary-subtle text-secondary">${c.payment_method}</span></td>
        <td>${debtHtml}</td>
        <td class="text-warning fw-semibold">€${c.deposit_collected.toFixed(2)}</td>
        <td>
          <span class="badge ${c.status === 'ACTIVE' ? 'badge-rented' : 'badge-available'} rounded-pill">${c.status}</span>
        </td>
        <td class="text-end">
          ${!isCompleted ? `
            <button class="btn btn-success btn-sm fw-semibold return-btn" data-id="${c.id}">
              🏁 Return
            </button>
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
  }

  timerInterval = setInterval(() => {
    container.querySelectorAll('.elapsed-timer').forEach(el => {
      const start = el.getAttribute('data-start');
      if (start) {
        el.innerHTML = `⏱️ ${formatElapsed(start)}`;
      }
    });
  }, 1000);

  filterStatus.addEventListener('change', loadContracts);
  await loadContracts();
}
