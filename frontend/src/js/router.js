import { state } from './api.js';
import { renderFleetPage } from './pages/FleetPage.js';
import { renderContractsPage } from './pages/ContractsPage.js';
import { renderShiftsPage } from './pages/ShiftsPage.js';
import { renderSchedulesPage } from './pages/SchedulesPage.js';
import { renderRepairsPage } from './pages/RepairsPage.js';
import { renderTariffsPage } from './pages/TariffsPage.js';
import { renderAnalyticsPage } from './pages/AnalyticsPage.js';
import { renderSettingsPage } from './pages/SettingsPage.js';

const validTabs = ['fleetTab', 'rentalsTab', 'shiftsTab', 'schedulesTab', 'repairsTab', 'tariffsTab', 'reportsTab', 'settingsTab'];

export function getInitialActiveTab() {
  const hash = window.location.hash.replace('#', '');
  const saved = localStorage.getItem('qqbikes_active_tab');

  if (hash && validTabs.includes(hash)) return hash;
  if (saved && validTabs.includes(saved)) return saved;
  return 'fleetTab';
}

export function setActiveTab(tabId) {
  if (validTabs.includes(tabId)) {
    state.activeTab = tabId;
    localStorage.setItem('qqbikes_active_tab', tabId);
    if (window.location.hash !== `#${tabId}`) {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  }
}

export async function mountCurrentPage(container) {
  // Ensure active tab is loaded from hash/localStorage
  if (!state.activeTab || !validTabs.includes(state.activeTab)) {
    state.activeTab = getInitialActiveTab();
  }

  container.innerHTML = '';

  const pageMap = {
    fleetTab: renderFleetPage,
    rentalsTab: renderContractsPage,
    shiftsTab: renderShiftsPage,
    schedulesTab: renderSchedulesPage,
    repairsTab: renderRepairsPage,
    tariffsTab: renderTariffsPage,
    reportsTab: renderAnalyticsPage,
    settingsTab: renderSettingsPage
  };

  const renderFn = pageMap[state.activeTab] || renderFleetPage;
  await renderFn(container);
}
