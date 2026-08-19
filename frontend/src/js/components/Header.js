import { state } from '../state.js';
import { api } from '../api.js';

export function renderHeader(container) {
  const isMiguel = state.currentUser?.username === 'miguel';
  const isQuique = state.currentUser?.username === 'quique';

  container.innerHTML = `
    <div class="container-fluid d-flex align-items-center justify-content-between">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-info fs-4 m-0" href="#">
        <span>🚲</span>
        <span>QQBikes</span>
        <span class="badge bg-info-subtle text-info fs-6 fw-semibold ms-2 d-none d-md-inline">Málaga System</span>
      </a>

      <div class="d-flex align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          <label for="storeSelect" class="form-label text-secondary small mb-0 d-none d-lg-inline">📍 Location:</label>
          <select id="storeSelect" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: auto;">
            <option value="1" ${state.activeStoreId === 1 ? 'selected' : ''}>Málaga Beach Store</option>
            <option value="2" ${state.activeStoreId === 2 ? 'selected' : ''}>Torremolinos Hub</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-2">
          <label for="userSelect" class="form-label text-secondary small mb-0 d-none d-lg-inline">👤 Staff User:</label>
          <select id="userSelect" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: auto;">
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

        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
          🟢 SHIFT ACTIVE
        </span>
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
