import { api, state } from './api.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderNewContractModal } from './modals/NewContractModal.js';
import { renderReturnVehicleModal } from './modals/ReturnVehicleModal.js';
import { renderExtendContractModal } from './modals/ExtendContractModal.js';
import { mountCurrentPage, getInitialActiveTab, setActiveTab } from './router.js';
import { showToast } from './components/Toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerContainer = document.getElementById('headerContainer');
  const sidebarContainer = document.getElementById('sidebarContainer');
  const pageContainer = document.getElementById('pageContainer');
  const modalsContainer = document.getElementById('modalsContainer');

  // Initialize persistent active tab from URL Hash / LocalStorage
  state.activeTab = getInitialActiveTab();

  async function renderAll() {
    renderHeader(headerContainer);
    renderSidebar(sidebarContainer);
    await mountCurrentPage(pageContainer);
  }

  // Initial API Auth
  await api.login(state.activeRole, state.activeStoreId);

  // Mount layout components & dynamic modals
  renderNewContractModal(modalsContainer);
  renderReturnVehicleModal(modalsContainer);
  renderExtendContractModal(modalsContainer);
  await renderAll();

  // Application Global Event Listeners
  window.addEventListener('app:tabChanged', async (e) => {
    setActiveTab(e.detail.tabId);
    renderSidebar(sidebarContainer);
    await mountCurrentPage(pageContainer);
  });

  window.addEventListener('hashchange', async () => {
    const tabId = getInitialActiveTab();
    if (tabId !== state.activeTab) {
      setActiveTab(tabId);
      renderSidebar(sidebarContainer);
      await mountCurrentPage(pageContainer);
    }
  });

  window.addEventListener('app:roleChanged', async () => {
    if (state.activeRole === 'EMPLOYEE' && (state.activeTab === 'reportsTab' || state.activeTab === 'settingsTab')) {
      setActiveTab('fleetTab');
    }
    showToast(`Switched user role to ${state.activeRole}`, 'info');
    await renderAll();
  });

  window.addEventListener('app:refresh', async () => {
    await renderAll();
  });
});
