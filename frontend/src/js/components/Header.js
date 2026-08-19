import { state } from '../api.js';
import { currentLang, setLanguage, t } from '../i18n.js';

export function renderHeader(container) {
  const isRtl = currentLang.code === 'ar';
  const roleName = state.activeRole === 'ADMIN' ? 'Admin Manager (Miguel/Quique)' : `Staff (${state.currentUser?.username || 'Fran'})`;

  container.innerHTML = `
    <div class="container-fluid d-flex align-items-center justify-content-between">
      
      <!-- Brand & Mobile Drawer Toggle -->
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary d-md-none me-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebarDrawer">
          <i class="fa-solid fa-bars"></i>
        </button>
        
        <a class="navbar-brand text-light fw-bold fs-4 d-flex align-items-center me-3" href="#">
          <span class="p-2 bg-gradient rounded-circle me-2 text-info d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background: rgba(0, 210, 255, 0.15);">
            <i class="fa-solid fa-bicycle"></i>
          </span>
          <span class="font-monospace text-info">QQ</span><span class="text-light">Bikes</span>
        </a>

        <!-- Store Location Badge -->
        <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-none d-lg-inline-block">
          <i class="fa-solid fa-location-dot me-1 text-danger"></i> Store #1 (Malaga Central)
        </span>
      </div>

      <!-- Header Actions: Primary New Contract, User Switcher, i18n Dropdown -->
      <div class="d-flex align-items-center gap-2">
        
        <!-- Primary Action: New Rental Contract -->
        <button class="btn btn-info btn-sm fw-bold px-3 d-flex align-items-center shadow-sm" id="topBtnNewContract">
          <i class="fa-solid fa-plus me-1"></i> ${t('btn_new_contract')}
        </button>

        <!-- User Role Switcher Dropdown -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle text-light d-flex align-items-center" type="button" data-bs-toggle="dropdown">
            <i class="fa-solid fa-circle-user me-1 text-info"></i> ${roleName}
          </button>
          <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
            <li><h6 class="dropdown-header">Switch Active Role</h6></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Fran" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Fran (Counter Staff)</a></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Gustavo" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Gustavo (Counter Staff)</a></li>
            <li><a class="dropdown-item user-role-option" href="#" data-user="Abdallah" data-role="EMPLOYEE"><i class="fa-solid fa-user me-2"></i> Abdallah (Counter Staff)</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item user-role-option text-warning fw-bold" href="#" data-user="Miguel" data-role="ADMIN"><i class="fa-solid fa-shield-halved me-2"></i> Miguel (Admin - PIN Required)</a></li>
            <li><a class="dropdown-item user-role-option text-warning fw-bold" href="#" data-user="Quique" data-role="ADMIN"><i class="fa-solid fa-shield-halved me-2"></i> Quique (Admin - PIN Required)</a></li>
          </ul>
        </div>

        <!-- Multi-language i18n Dropdown -->
        <div class="dropdown">
          <select id="headerLangSelect" class="form-select form-select-sm bg-dark text-light border-secondary">
            <option value="es" ${currentLang.code === 'es' ? 'selected' : ''}>Español 🇪🇸</option>
            <option value="en" ${currentLang.code === 'en' ? 'selected' : ''}>English 🇬🇧</option>
            <option value="ar" ${currentLang.code === 'ar' ? 'selected' : ''}>العربية 🇪🇬</option>
          </select>
        </div>

      </div>
    </div>
  `;

  // Bind Top New Contract Trigger
  const newContractBtn = container.querySelector('#topBtnNewContract');
  if (newContractBtn) {
    newContractBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('app:openNewContractModal'));
    });
  }

  // Bind Role Switching Options
  container.querySelectorAll('.user-role-option').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const role = item.getAttribute('data-role');
      const uname = item.getAttribute('data-user');

      if (role === 'ADMIN') {
        // Enforce Admin PIN Authentication
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
