import { state } from '../state.js';

export function renderSidebar(container) {
  const isAdmin = state.activeRole === 'ADMIN';

  container.innerHTML = `
    <div class="sidebar-panel d-flex flex-column justify-content-between h-100">
      <nav class="nav nav-pills flex-column gap-2 mb-4">
        <button class="sidebar-btn ${state.activeTab === 'fleetTab' ? 'active' : ''}" data-tab="fleetTab">
          <span>🚲</span> Fleet Inventory
        </button>
        <button class="sidebar-btn ${state.activeTab === 'rentalsTab' ? 'active' : ''}" data-tab="rentalsTab">
          <span>📋</span> Active Rentals & Timers
        </button>
        <button class="sidebar-btn ${state.activeTab === 'shiftsTab' ? 'active' : ''}" data-tab="shiftsTab">
          <span>💵</span> Shift & Cash Audit
        </button>
        <button class="sidebar-btn ${state.activeTab === 'schedulesTab' ? 'active' : ''}" data-tab="schedulesTab">
          <span>📅</span> Weekly Staff Roster
        </button>
        <button class="sidebar-btn ${state.activeTab === 'repairsTab' ? 'active' : ''}" data-tab="repairsTab">
          <span>🛠️</span> Parts & Repair Catalog
        </button>
        ${isAdmin ? `
          <button class="sidebar-btn ${state.activeTab === 'reportsTab' ? 'active' : ''}" data-tab="reportsTab">
            <span>📊</span> Admin Analytics
          </button>
          <button class="sidebar-btn ${state.activeTab === 'settingsTab' ? 'active' : ''}" data-tab="settingsTab">
            <span>⚙️</span> Store Settings & Staff
          </button>
        ` : ''}
      </nav>

      <div>
        <button id="btnNewContract" class="btn btn-info w-100 fw-bold shadow-sm py-2">
          ✨ New Rental Contract
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('.sidebar-btn').forEach(btn => {
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
