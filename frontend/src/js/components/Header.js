import { state } from '../state.js';
import { api } from '../api.js';

export function renderHeader(container) {
  const isMiguel = state.currentUser?.username === 'miguel';
  const isQuique = state.currentUser?.username === 'quique';

  container.innerHTML = `
    <div class="header-brand">
      <div class="logo-icon">🚲</div>
      <div class="brand-text">
        <h1>QQBikes</h1>
        <span class="brand-subtitle">Málaga Rental & Debt Settlement System</span>
      </div>
    </div>

    <div class="header-controls" style="display: flex; gap: 1.25rem; align-items: center;">
      <div class="control-group">
        <label for="storeSelect" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">📍 Store Location:</label>
        <select id="storeSelect" class="styled-select" style="padding: 0.5rem 0.75rem;">
          <option value="1" ${state.activeStoreId === 1 ? 'selected' : ''}>Málaga Beach Campsite Store</option>
          <option value="2" ${state.activeStoreId === 2 ? 'selected' : ''}>Torremolinos Central Hub</option>
        </select>
      </div>

      <div class="control-group">
        <label for="userSelect" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">👤 Active Staff User:</label>
        <select id="userSelect" class="styled-select" style="padding: 0.5rem 0.75rem;">
          <optgroup label="⚡ Admin Managers (Miguel & Quique)">
            <option value="miguel" ${isMiguel ? 'selected' : ''}>Miguel (Admin Manager)</option>
            <option value="quique" ${isQuique ? 'selected' : ''}>Quique (Admin Manager)</option>
          </optgroup>
          <optgroup label="👤 Staff Employees">
            <option value="ahmet" ${state.currentUser?.username === 'ahmet' ? 'selected' : ''}>Ahmet (Counter Staff)</option>
            <option value="fran" ${state.currentUser?.username === 'fran' ? 'selected' : ''}>Fran (Staff)</option>
            <option value="gustavo" ${state.currentUser?.username === 'gustavo' ? 'selected' : ''}>Gustavo (Staff)</option>
            <option value="abdallah" ${state.currentUser?.username === 'abdallah' ? 'selected' : ''}>Abdallah (Staff)</option>
          </optgroup>
        </select>
      </div>

      <div id="shiftStatusBadge" class="shift-badge open" style="display: flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.15); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.3);">
        <span style="width: 8px; height: 8px; background: var(--accent-emerald); border-radius: 50%;"></span>
        <span id="shiftStatusText" style="font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald);">Shift: ACTIVE</span>
      </div>
    </div>
  `;

  document.getElementById('storeSelect').addEventListener('change', async (e) => {
    state.activeStoreId = Number(e.target.value);
    await api.login(state.activeRole, state.activeStoreId);
    window.dispatchEvent(new CustomEvent('app:refresh'));
  });

  document.getElementById('userSelect').addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === 'miguel' || val === 'quique') {
      state.activeRole = 'ADMIN';
      state.currentUser.username = val;
    } else {
      state.activeRole = 'EMPLOYEE';
      state.currentUser.username = val;
    }
    await api.login(state.activeRole, state.activeStoreId);
    window.dispatchEvent(new CustomEvent('app:roleChanged'));
  });
}
