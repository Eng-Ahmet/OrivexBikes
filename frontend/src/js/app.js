import { api, state } from './api.js';
import { getInitialActiveTab, setActiveTab } from './router.js';
import { initI18n, setLanguage, t } from './i18n.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderFleetPage } from './pages/FleetPage.js';
import { renderRentalsPage } from './pages/RentalsPage.js';
import { renderShiftsPage } from './pages/ShiftsPage.js';
import { renderTariffsPage } from './pages/TariffsPage.js';
import { renderSchedulesPage } from './pages/SchedulesPage.js';
import { renderRepairsPage } from './pages/RepairsPage.js';
import { renderAnalyticsPage } from './pages/AnalyticsPage.js';
import { renderSettingsPage } from './pages/SettingsPage.js';
import { renderNewContractModal } from './modals/NewContractModal.js';
import { renderReturnVehicleModal } from './modals/ReturnVehicleModal.js';
import { renderLoginModal } from './modals/LoginModal.js';

async function initApp() {
  initI18n();

  const headerContainer = document.getElementById('headerContainer');
  const sidebarContainer = document.getElementById('sidebarContainer');
  const pageContainer = document.getElementById('pageContainer');
  const modalsContainer = document.getElementById('modalsContainer');

  function renderLayout() {
    if (headerContainer) renderHeader(headerContainer);
    if (sidebarContainer) renderSidebar(sidebarContainer);
  }

  async function renderActiveView() {
    renderLayout();
    if (!pageContainer) return;

    switch (state.activeTab) {
      case 'fleetTab':
        await renderFleetPage(pageContainer);
        break;
      case 'rentalsTab':
        await renderRentalsPage(pageContainer);
        break;
      case 'shiftsTab':
        await renderShiftsPage(pageContainer);
        break;
      case 'tariffsTab':
        await renderTariffsPage(pageContainer);
        break;
      case 'schedulesTab':
        await renderSchedulesPage(pageContainer);
        break;
      case 'repairsTab':
        await renderRepairsPage(pageContainer);
        break;
      case 'reportsTab':
        await renderAnalyticsPage(pageContainer);
        break;
      case 'settingsTab':
        await renderSettingsPage(pageContainer);
        break;
      default:
        await renderFleetPage(pageContainer);
        break;
    }
  }

  // Render Modals once into modalsContainer
  if (modalsContainer) {
    modalsContainer.innerHTML = '';
    renderNewContractModal(modalsContainer);
    renderReturnVehicleModal(modalsContainer);
    renderLoginModal(modalsContainer);
  }

  // Global Event Listeners
  window.addEventListener('app:tabChanged', () => renderActiveView());
  window.addEventListener('app:languageChanged', () => renderActiveView());
  window.addEventListener('app:refresh', () => renderActiveView());
  window.addEventListener('hashchange', () => {
    state.activeTab = getInitialActiveTab();
    renderActiveView();
  });

  state.activeTab = getInitialActiveTab();
  await renderActiveView();

  // AUTOMATIC OPEN SHIFT VERIFICATION ON DEVICE LOGIN
  const activeShift = await api.getCurrentShift();
  if (!activeShift || !activeShift.id) {
    // Switch to shifts tab to enforce initial float verification
    setActiveTab('shiftsTab');
    await renderActiveView();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
