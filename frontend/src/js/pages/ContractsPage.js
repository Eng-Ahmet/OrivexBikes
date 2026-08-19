import { api } from '../api.js';

export async function renderContractsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Active Rental Contracts & Returns</h2>
        <p class="page-desc">Manage ongoing rentals, process returns & extra charges</p>
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
            <th>Duration / Return</th>
            <th>Fee</th>
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

  async function loadContracts() {
    const contracts = await api.getRentals(filterStatus.value);
    tableBody.innerHTML = '';

    if (!contracts || contracts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No contracts found matching filter.</td></tr>`;
      return;
    }

    contracts.forEach(c => {
      const tr = document.createElement('tr');
      const isCompleted = c.status === 'COMPLETED';

      tr.innerHTML = `
        <td><strong>${c.contract_number}</strong></td>
        <td>${c.customer_name}<br><small style="color: var(--text-dim);">${c.customer_passport}</small></td>
        <td>${c.vehicle_name}</td>
        <td>${new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${new Date(c.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>€${c.rental_fee.toFixed(2)} (${c.payment_method})</td>
        <td>€${c.deposit_collected.toFixed(2)}</td>
        <td><span class="status-badge status-${c.status === 'ACTIVE' ? 'RENTED' : 'AVAILABLE'}">${c.status}</span></td>
        <td>
          ${!isCompleted ? `
            <button class="btn btn-success btn-sm return-btn" data-id="${c.id}">
              🏁 Process Return
            </button>
          ` : `
            <span style="color: var(--accent-emerald); font-size: 0.8rem; font-weight: 600;">✓ Released</span>
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

  filterStatus.addEventListener('change', loadContracts);
  await loadContracts();
}
