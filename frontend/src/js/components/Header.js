import { state } from '../state.js';
import { api } from '../api.js';

export function renderHeader(container) {
  container.innerHTML = `
    <div class="header-brand">
      <div class="logo-icon">🚲</div>
      <div class="brand-text">
        <h1>QQBikes</h1>
        <span class="brand-subtitle">Rental & Store Management System</span>
      </div>
    </div>

    <div class="header-controls">
      <div class="control-group">
        <label for="storeSelect">📍 Store Location:</label>
        <select id="storeSelect" class="styled-select">
          <option value="1" ${state.activeStoreId === 1 ? 'selected' : ''}>Málaga Beach Campsite Store</option>
          <option value="2" ${state.activeStoreId === 2 ? 'selected' : ''}>Torremolinos Central Hub</option>
          <option value="3" ${state.activeStoreId === 3 ? 'selected' : ''}>Marbella Resort & Marina Store</option>
          <option value="4" ${state.activeStoreId === 4 ? 'selected' : ''}>Nerja Coastal Depot</option>
          <option value="5" ${state.activeStoreId === 5 ? 'selected' : ''}>Fuengirola Promenade Hub</option>
        </select>
      </div>

      <div class="role-badge-container">
        <span class="control-label">User Role:</span>
        <div class="role-toggle-group">
          <button id="roleEmployeeBtn" class="role-toggle-btn ${state.activeRole === 'EMPLOYEE' ? 'active' : ''}">
            👤 EMPLOYEE
          </button>
          <button id="roleAdminBtn" class="role-toggle-btn ${state.activeRole === 'ADMIN' ? 'active' : ''}">
            ⚡ ADMIN
          </button>
        </div>
      </div>

      <div id="shiftStatusBadge" class="shift-badge open">
        <span class="pulse-dot"></span>
        <span id="shiftStatusText">Shift: OPEN</span>
      </div>
    </div>
  `;

  document.getElementById('storeSelect').addEventListener('change', async (e) => {
    state.activeStoreId = Number(e.target.value);
    await api.login(state.activeRole, state.activeStoreId);
    window.dispatchEvent(new CustomEvent('app:refresh'));
  });

  document.getElementById('roleEmployeeBtn').addEventListener('click', async () => {
    state.activeRole = 'EMPLOYEE';
    state.currentUser.username = 'Sofia Employee';
    await api.login('EMPLOYEE', state.activeStoreId);
    window.dispatchEvent(new CustomEvent('app:roleChanged'));
  });

  document.getElementById('roleAdminBtn').addEventListener('click', async () => {
    state.activeRole = 'ADMIN';
    state.currentUser.username = 'Carlos Admin';
    await api.login('ADMIN', state.activeStoreId);
    window.dispatchEvent(new CustomEvent('app:roleChanged'));
  });
}
