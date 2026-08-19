import { state } from '../api.js';
import { currentLang, setLanguage, t } from '../i18n.js';

export function renderHeader(container) {
  const isRtl = currentLang.code === 'ar';
  const shortRole = state.activeRole === 'ADMIN' ? 'Admin' : `Staff (${state.currentUser?.username || 'Fran'})`;
  const fullRole = state.activeRole === 'ADMIN' ? 'Admin (Miguel/Quique)' : `Staff (${state.currentUser?.username || 'Fran'})`;

  container.innerHTML = `
    <div class="container-fluid d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between gap-2 py-1">
      
      <!-- Brand & Mobile Drawer Toggle -->
      <div class="d-flex align-items-center justify-content-between w-100 w-md-auto me-md-2">
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-secondary btn-sm d-md-none me-2 px-2 py-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebarDrawer" aria-label="Toggle navigation">
            <i class="fa-solid fa-bars fs-6"></i>
          </button>
          
          <a class="navbar-brand text-light fw-bold fs-5 d-flex align-items-center m-0" href="#">
            <span class="p-1 bg-gradient rounded-circle me-2 text-info d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px; background: rgba(0, 210, 255, 0.15);">
              <i class="fa-solid fa-bicycle fs-6"></i>
            </span>
            <span class="font-monospace text-info">QQ</span><span class="text-light">Bikes</span>
          </a>
        </div>

        <!-- Mobile New Contract Quick Icon Button -->
        <button class="btn btn-info btn-sm fw-bold d-md-none px-2 py-1 shadow-sm d-flex align-items-center gap-1" id="topBtnNewContractMobile">
          <i class="fa-solid fa-plus"></i> <span class="small">${t('btn_new_contract')}</span>
        </button>
      </div>

      <!-- Header Actions: User Switcher, i18n Dropdown, Desktop New Contract -->
      <div class="d-flex align-items-center justify-content-end gap-2 w-100 w-md-auto flex-wrap flex-sm-nowrap">
        
        <!-- Desktop Primary Action: New Rental Contract -->
        <button class="btn btn-info btn-sm fw-bold px-3 d-none d-md-flex align-items-center shadow-sm" id="topBtnNewContract">
          <i class="fa-solid fa-plus me-1"></i> ${t('btn_new_contract')}
        </button>

        <!-- User Role Switcher Dropdown -->
        <div class="dropdown flex-grow-1 flex-sm-grow-0">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle text-light w-100 d-flex align-items-center justify-content-between gap-1 py-1 px-2" type="button" data-bs-toggle="dropdown" style="max-width: 220px;">
            <span class="d-flex align-items-center text-truncate small">
              <i class="fa-solid fa-circle-user me-1 text-info"></i>
              <span class="d-inline-block text-truncate">${fullRole}</span>
            </span>
          </button>
          <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
            <li><h6 class="dropdown-header">Switch Active Role</h6></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Fran" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Fran (Counter Staff)</a></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Gustavo" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Gustavo (Counter Staff)</a></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Abdallah" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Abdallah (Counter Staff)</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item user-role-option text-warning fw-bold" href="#" data-user="Miguel" data-role="ADMIN"><i class="fa-solid fa-shield-halved me-2"></i> Miguel (Admin)</a></li>
            <li><a class="dropdown-item user-role-option text-warning fw-bold" href="#" data-user="Quique" data-role="ADMIN"><i class="fa-solid fa-shield-halved me-2"></i> Quique (Admin)</a></li>
          </ul>
        </div>

        <!-- Multi-language i18n Dropdown -->
        <div class="dropdown">
          <select id="headerLangSelect" class="form-select form-select-sm bg-dark text-light border-secondary py-1 px-2 small">
            <option value="es" ${currentLang.code === 'es' ? 'selected' : ''}>🇪🇸 ES</option>
            <option value="en" ${currentLang.code === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
            <option value="ar" ${currentLang.code === 'ar' ? 'selected' : ''}>🇪🇬 AR</option>
          </select>
        </div>

      </div>
    </div>
  `;

  // Bind Top New Contract Triggers
  const triggerNewContract = () => {
    window.dispatchEvent(new CustomEvent('app:openNewContractModal'));
  };

  const newContractBtn = container.querySelector('#topBtnNewContract');
  if (newContractBtn) newContractBtn.addEventListener('click', triggerNewContract);

  const newContractBtnMobile = container.querySelector('#topBtnNewContractMobile');
  if (newContractBtnMobile) newContractBtnMobile.addEventListener('click', triggerNewContract);

  // Bind Role Switching Options
  container.querySelectorAll('.user-role-option').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const role = item.getAttribute('data-role');
      const uname = item.getAttribute('data-user');

      if (role === 'ADMIN') {
        window.dispatchEvent(new CustomEvent('app:openLoginModal'));
      } else {
        state.currentUser = { id: 3, username: uname, role };
        state.activeRole = role;
        localStorage.setItem('qq_active_role', role);
        window.dispatchEvent(new CustomEvent('app:refresh'));
      }
    });
  });

  // Bind Language Change Selector
  const langSelect = container.querySelector('#headerLangSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      window.dispatchEvent(new CustomEvent('app:languageChanged'));
    });
  }
}
