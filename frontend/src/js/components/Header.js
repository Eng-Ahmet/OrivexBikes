import { state } from '../api.js';
import { api } from '../api.js';
import { currentLang, setLanguage, t } from '../i18n.js';

export function renderHeader(container) {
  const isMiguel = state.currentUser?.username === 'miguel';
  const isQuique = state.currentUser?.username === 'quique';

  container.innerHTML = `
    <div class="container-fluid d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <!-- Mobile Drawer Toggle Button -->
        <button class="btn btn-outline-secondary btn-sm d-md-none me-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebarDrawer">
          <i class="fa-solid fa-bars fs-5"></i>
        </button>

        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-info fs-4 m-0" href="#">
          <i class="fa-solid fa-bicycle text-info fs-3"></i>
          <span>${t('brand_title')}</span>
          <span class="badge bg-info-subtle text-info fs-6 fw-semibold ms-2 d-none d-lg-inline">${t('brand_subtitle')}</span>
        </a>
      </div>

      <div class="d-flex align-items-center gap-2 gap-md-3">
        <!-- Store Location Select -->
        <div class="d-flex align-items-center gap-1">
          <i class="fa-solid fa-shop text-secondary d-none d-lg-inline" title="${t('location')}"></i>
          <select id="storeSelect" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: auto;">
            <option value="1" ${state.activeStoreId === 1 ? 'selected' : ''}>Málaga Beach Store</option>
            <option value="2" ${state.activeStoreId === 2 ? 'selected' : ''}>Torremolinos Hub</option>
          </select>
        </div>

        <!-- Staff User Role Select -->
        <div class="d-flex align-items-center gap-1">
          <i class="fa-solid fa-user-gear text-secondary d-none d-lg-inline" title="${t('staff_user')}"></i>
          <select id="userSelect" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: auto;">
            <optgroup label="⚡ Admin Managers">
              <option value="miguel" ${isMiguel ? 'selected' : ''}>Miguel (Admin)</option>
              <option value="quique" ${isQuique ? 'selected' : ''}>Quique (Admin)</option>
            </optgroup>
            <optgroup label="👤 Counter Staff">
              <option value="ahmet" ${state.currentUser?.username === 'ahmet' ? 'selected' : ''}>Ahmet (Staff)</option>
              <option value="fran" ${state.currentUser?.username === 'fran' ? 'selected' : ''}>Fran (Staff)</option>
              <option value="gustavo" ${state.currentUser?.username === 'gustavo' ? 'selected' : ''}>Gustavo (Staff)</option>
              <option value="abdallah" ${state.currentUser?.username === 'abdallah' ? 'selected' : ''}>Abdallah (Staff)</option>
            </optgroup>
          </select>
        </div>

        <!-- Language Switcher (ES / EN / AR) -->
        <div class="d-flex align-items-center gap-1">
          <i class="fa-solid fa-globe text-info"></i>
          <select id="languageSelect" class="form-select form-select-sm bg-dark text-info border-info fw-semibold" style="width: auto;">
            <option value="es" ${currentLang.code === 'es' ? 'selected' : ''}>Español 🇪🇸</option>
            <option value="en" ${currentLang.code === 'en' ? 'selected' : ''}>English 🇬🇧</option>
            <option value="ar" ${currentLang.code === 'ar' ? 'selected' : ''}>العربية 🇪🇬</option>
          </select>
        </div>

        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 d-none d-sm-inline">
          <i class="fa-solid fa-circle text-success me-1 font-monospace" style="font-size: 0.6rem;"></i> ${t('shift_active')}
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

  document.getElementById('languageSelect').addEventListener('change', (e) => {
    setLanguage(e.target.value);
    window.dispatchEvent(new CustomEvent('app:refresh'));
  });
}
