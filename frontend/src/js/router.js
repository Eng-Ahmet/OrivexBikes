import { state } from './state.js';
import { renderFleetPage } from './pages/FleetPage.js';
import { renderContractsPage } from './pages/ContractsPage.js';
import { renderShiftsPage } from './pages/ShiftsPage.js';
import { renderAnalyticsPage } from './pages/AnalyticsPage.js';
import { renderSettingsPage } from './pages/SettingsPage.js';

export async function mountCurrentPage(container) {
  container.innerHTML = '';

  const pageMap = {
    fleetTab: renderFleetPage,
    rentalsTab: renderContractsPage,
    shiftsTab: renderShiftsPage,
    reportsTab: renderAnalyticsPage,
    settingsTab: renderSettingsPage
  };

  const renderFn = pageMap[state.activeTab] || renderFleetPage;
  await renderFn(container);
}
