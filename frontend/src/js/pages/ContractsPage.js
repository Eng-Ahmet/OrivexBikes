import { api } from '../api.js';

let timerInterval = null;

export async function renderContractsPage(container) {
  if (timerInterval) clearInterval(timerInterval);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Active Rental Contracts & Live Timers</h2>
        <p class="page-desc">Real-time stopwatch timer for active rentals, returns, & deposit releases</p>
      </div>
      <div class="filter-bar">
        <select id="filterContractStatus" class="styled-select">
          <option value="ALL">All Contracts</option>
          <option value="ACTIVE">Active Rentals</option>
          <option value="COMPLETED">Returned & Completed</option>
        </select>
      </div>
    </div>

    <div class="table-card glass-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Contract #</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Start Time</th>
            <th>Elapsed Time (Stopwatch)</th>
            <th>Rental Fee</th>
            <th>Deposit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="contractsTableBody"></tbody>
      </table>
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
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No active or historical contracts found. Create a new contract to start tracking!</td></tr>`;
      return;
    }

    contracts.forEach(c => {
      const tr = document.createElement('tr');
      const isCompleted = c.status === 'COMPLETED';

      tr.innerHTML = `
        <td><strong>${c.contract_number}</strong></td>
        <td>${c.customer_name}<br><small style="color: var(--text-dim);">${c.customer_passport}</small></td>
        <td>${c.vehicle_name}</td>
        <td>${new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
        <td>
          ${!isCompleted ? `
            <span class="elapsed-timer" data-start="${c.start_time}" style="font-family: monospace; font-weight: 700; color: var(--accent-cyan); background: rgba(6,182,212,0.15); padding: 4px 10px; border-radius: 6px;">
              ⏱️ ${formatElapsed(c.start_time)}
            </span>
          ` : `
            <span style="color: var(--text-muted);">Completed</span>
          `}
        </td>
        <td>€${c.rental_fee.toFixed(2)} (${c.payment_method})</td>
        <td>€${c.deposit_collected.toFixed(2)}</td>
        <td><span class="status-badge status-${c.status === 'ACTIVE' ? 'RENTED' : 'AVAILABLE'}">${c.status}</span></td>
        <td>
          ${!isCompleted ? `
            <button class="btn btn-success btn-sm return-btn" data-id="${c.id}">
              🏁 Return Vehicle
            </button>
          ` : `
            <span style="color: var(--accent-emerald); font-size: 0.8rem; font-weight: 600;">✓ Deposit Released</span>
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

  // Ticking stopwatch live updates every 1000ms
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
