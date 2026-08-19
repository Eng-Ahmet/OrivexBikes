import { api, state } from '../api.js';
import { showToast } from '../components/Toast.js';

export async function renderSettingsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">⚙️ Store Settings & Admin Configuration</h2>
        <p class="text-secondary small mb-0">Configure initial cash float, register past revenue entries, & manage staff directory</p>
      </div>
    </div>

    <!-- Admin Cash Drawer Setup & Past Cash Log Split Grid -->
    <div class="row row-cols-1 row-cols-lg-2 g-3 mb-4">
      <!-- 1. Store Initial Cash Float Setup -->
      <div class="col">
        <div class="card-glass p-4 h-100">
          <h5 class="fw-bold text-info fs-6 mb-3">💵 Initial Cash Drawer Reserve Setup (رصيد الصندوق المبدئي)</h5>
          <form id="storeConfigForm">
            <div class="mb-3">
              <label class="form-label text-secondary small fw-semibold">Default Store Initial Cash Float (€) *</label>
              <input type="number" id="initialCashFloatInput" class="form-control bg-dark text-light border-secondary" step="0.5" placeholder="150.00" required />
              <div class="form-text text-secondary small">This sets the default starting float cash for daily shift openings at this store location.</div>
            </div>
            <button type="submit" class="btn btn-info btn-sm fw-bold">
              💾 Save Initial Cash Float
            </button>
          </form>
        </div>
      </div>

      <!-- 2. Record Historical / Past Revenue Entry -->
      <div class="col">
        <div class="card-glass p-4 h-100">
          <h5 class="fw-bold text-warning fs-6 mb-3">📜 Register Historical Cash Entry (تسجيل إيرادات ومبالغ سابقة)</h5>
          <form id="historicalCashForm">
            <div class="row g-2 mb-2">
              <div class="col-md-6">
                <label class="form-label text-secondary small fw-semibold">Amount (€) *</label>
                <input type="number" id="histAmount" class="form-control bg-dark text-light border-secondary" step="0.5" min="1" placeholder="e.g. 50.00" required />
              </div>
              <div class="col-md-6">
                <label class="form-label text-secondary small fw-semibold">Date of Past Cash *</label>
                <input type="date" id="histDate" class="form-control bg-dark text-light border-secondary" required />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary small fw-semibold">Description / Purpose *</label>
              <input type="text" id="histDescription" class="form-control bg-dark text-light border-secondary" placeholder="e.g. Offline rental cash collected yesterday" required />
            </div>
            <button type="submit" class="btn btn-warning btn-sm fw-semibold">
              📥 Register Past Cash Entry
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Historical Cash Audit Trail Table -->
    <div class="card-glass p-3 shadow-sm mb-4">
      <h5 class="fw-bold text-light fs-6 mb-3">📋 Historical Cash Entries Audit Trail (سجل الأموال السابقة)</h5>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Date of Cash</th>
              <th scope="col">Recorded Amount</th>
              <th scope="col">Category</th>
              <th scope="col">Description</th>
              <th scope="col">Recorded By</th>
              <th scope="col">Entry Timestamp</th>
            </tr>
          </thead>
          <tbody id="histCashTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Active Staff Members & Access Roles -->
    <div class="card-glass p-3 shadow-sm">
      <h5 class="fw-bold text-info fs-6 mb-3">👥 Active Staff Members & Access Roles</h5>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Staff User</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Assigned Store</th>
              <th scope="col">Permission Role</th>
            </tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const configForm = container.querySelector('#storeConfigForm');
  const floatInput = container.querySelector('#initialCashFloatInput');
  const histForm = container.querySelector('#historicalCashForm');
  const histTableBody = container.querySelector('#histCashTableBody');
  const usersTableBody = container.querySelector('#usersTableBody');

  // Set today's default date for date input
  container.querySelector('#histDate').value = new Date().toISOString().split('T')[0];

  async function loadData() {
    const stores = await api.getStores();
    const currentStore = stores.find(s => s.id === state.activeStoreId) || stores[0];
    if (currentStore) {
      floatInput.value = (currentStore.initial_cash_float || 150.00).toFixed(2);
    }

    const histLogs = await api.getHistoricalCashLogs(state.activeStoreId);
    histTableBody.innerHTML = '';
    if (!histLogs || histLogs.length === 0) {
      histTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary py-3">No historical cash logs registered yet.</td></tr>`;
    } else {
      histLogs.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="fw-bold text-light">${l.date}</td>
          <td class="fw-bold text-warning">€${l.amount.toFixed(2)}</td>
          <td><span class="badge bg-warning-subtle text-warning rounded-pill">${l.category}</span></td>
          <td class="text-secondary">${l.description}</td>
          <td>${l.recorded_by}</td>
          <td class="text-muted small">${new Date(l.created_at).toLocaleString()}</td>
        `;
        histTableBody.appendChild(tr);
      });
    }

    const users = await api.getUsers();
    usersTableBody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      const isAdmin = u.user_type === 'ADMIN';

      tr.innerHTML = `
        <td class="fw-bold text-light">${u.first_name} ${u.last_name} (@${u.username})</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${u.store_name || 'Málaga Beach Campsite Store'}</td>
        <td>
          <span class="badge ${isAdmin ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-secondary'} rounded-pill">
            ${isAdmin ? '⚡ ADMIN MANAGER' : '👤 COUNTER STAFF'}
          </span>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });
  }

  configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = Number(floatInput.value);
    const res = await api.updateStoreConfig(state.activeStoreId, val);
    if (res.error) showToast(res.error, 'error');
    else {
      showToast('💾 Store initial cash float updated successfully!', 'success');
      await loadData();
    }
  });

  histForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      amount: Number(container.querySelector('#histAmount').value),
      date: container.querySelector('#histDate').value,
      description: container.querySelector('#histDescription').value
    };

    const res = await api.recordHistoricalCash(state.activeStoreId, data);
    if (res.error) showToast(res.error, 'error');
    else {
      histForm.reset();
      container.querySelector('#histDate').value = new Date().toISOString().split('T')[0];
      showToast('📥 Historical cash entry registered!', 'success');
      await loadData();
    }
  });

  await loadData();
}
