import { state } from '../api.js';
import { t } from '../i18n.js';
import { setActiveTab } from '../router.js';

export function renderSidebar(container) {
  const isAdmin = state.activeRole === 'ADMIN';

  const navHtml = `
    <nav class="nav nav-pills flex-column gap-2 mb-4">
      <button class="sidebar-btn ${state.activeTab === 'fleetTab' ? 'active' : ''}" data-tab="fleetTab">
        <i class="fa-solid fa-bicycle me-2"></i> ${t('fleet_tab')}
      </button>
      <button class="sidebar-btn ${state.activeTab === 'rentalsTab' ? 'active' : ''}" data-tab="rentalsTab">
        <i class="fa-solid fa-clock me-2"></i> ${t('rentals_tab')}
      </button>
      <button class="sidebar-btn ${state.activeTab === 'shiftsTab' ? 'active' : ''}" data-tab="shiftsTab">
        <i class="fa-solid fa-cash-register me-2"></i> ${t('shifts_tab')}
      </button>
      <button class="sidebar-btn ${state.activeTab === 'tariffsTab' ? 'active' : ''}" data-tab="tariffsTab">
        <i class="fa-solid fa-tags me-2"></i> ${t('tariffs_tab')}
      </button>
      <button class="sidebar-btn ${state.activeTab === 'schedulesTab' ? 'active' : ''}" data-tab="schedulesTab">
        <i class="fa-solid fa-calendar-days me-2"></i> ${t('schedules_tab')}
      </button>
      <button class="sidebar-btn ${state.activeTab === 'repairsTab' ? 'active' : ''}" data-tab="repairsTab">
        <i class="fa-solid fa-screwdriver-wrench me-2"></i> ${t('repairs_tab')}
      </button>
      ${isAdmin ? `
        <button class="sidebar-btn ${state.activeTab === 'reportsTab' ? 'active' : ''}" data-tab="reportsTab">
          <i class="fa-solid fa-chart-line me-2"></i> ${t('reports_tab')}
        </button>
        <button class="sidebar-btn ${state.activeTab === 'settingsTab' ? 'active' : ''}" data-tab="settingsTab">
          <i class="fa-solid fa-sliders me-2"></i> ${t('settings_tab')}
        </button>
      ` : ''}
    </nav>

    <div>
      <button class="btn btn-info w-100 fw-bold shadow-sm py-2 btn-new-contract-trigger">
        <i class="fa-solid fa-plus me-1"></i> ${t('new_contract_btn')}
      </button>
    </div>
  `;

  container.innerHTML = `
    <div class="sidebar-panel d-flex flex-column justify-content-between h-100">
      ${navHtml}
    </div>
  `;

  // Also render into Mobile Offcanvas Container
  const mobileContainer = document.getElementById('mobileDrawerContainer');
  if (mobileContainer) {
    mobileContainer.innerHTML = navHtml;
  }

  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      setActiveTab(tabId);
      window.dispatchEvent(new CustomEvent('app:tabChanged', { detail: { tabId } }));
    });
  });

  document.querySelectorAll('.btn-new-contract-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('app:openNewContractModal'));
    });
  });
}
