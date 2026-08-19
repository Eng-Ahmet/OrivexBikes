import { state } from '../state.js';

export function renderSidebar(container) {
  const isAdmin = state.activeRole === 'ADMIN';

  container.innerHTML = `
    <nav class="nav-menu">
      <button class="nav-item ${state.activeTab === 'fleetTab' ? 'active' : ''}" data-tab="fleetTab">
        <span class="nav-icon">🚲</span> Fleet Inventory
      </button>
      <button class="nav-item ${state.activeTab === 'rentalsTab' ? 'active' : ''}" data-tab="rentalsTab">
        <span class="nav-icon">📋</span> Active Rentals & Timers
      </button>
      <button class="nav-item ${state.activeTab === 'shiftsTab' ? 'active' : ''}" data-tab="shiftsTab">
        <span class="nav-icon">💵</span> Shift & Cash Drawer
      </button>
      <button class="nav-item ${state.activeTab === 'schedulesTab' ? 'active' : ''}" data-tab="schedulesTab">
        <span class="nav-icon">📅</span> Weekly Staff Roster
      </button>
      <button class="nav-item ${state.activeTab === 'repairsTab' ? 'active' : ''}" data-tab="repairsTab">
        <span class="nav-icon">🛠️</span> Parts & Repair Catalog
      </button>
      ${isAdmin ? `
        <button class="nav-item ${state.activeTab === 'reportsTab' ? 'active' : ''}" data-tab="reportsTab">
          <span class="nav-icon">📊</span> Admin Analytics & Reports
        </button>
        <button class="nav-item ${state.activeTab === 'settingsTab' ? 'active' : ''}" data-tab="settingsTab">
          <span class="nav-icon">⚙️</span> Store Settings & Staff
        </button>
      ` : ''}
    </nav>

    <div class="sidebar-action">
      <button id="btnNewContract" class="btn btn-primary btn-glow btn-full">
        ✨ New Rental Contract
      </button>
    </div>
  `;

  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      state.activeTab = tabId;
      window.dispatchEvent(new CustomEvent('app:tabChanged', { detail: { tabId } }));
    });
  });

  document.getElementById('btnNewContract')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('app:openNewContractModal'));
  });
}
