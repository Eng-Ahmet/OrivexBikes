import { api, state } from './api.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderNewContractModal } from './modals/NewContractModal.js';
import { renderReturnVehicleModal } from './modals/ReturnVehicleModal.js';
import { mountCurrentPage } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerContainer = document.getElementById('headerContainer');
  const sidebarContainer = document.getElementById('sidebarContainer');
  const pageContainer = document.getElementById('pageContainer');
  const modalsContainer = document.getElementById('modalsContainer');

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
  await renderAll();

  // Application Global Event Listeners
  window.addEventListener('app:tabChanged', async (e) => {
    state.activeTab = e.detail.tabId;
    renderSidebar(sidebarContainer);
    await mountCurrentPage(pageContainer);
  });

  window.addEventListener('app:roleChanged', async () => {
    if (state.activeRole === 'EMPLOYEE' && (state.activeTab === 'reportsTab' || state.activeTab === 'settingsTab')) {
      state.activeTab = 'fleetTab';
    }
    await renderAll();
  });

  window.addEventListener('app:refresh', async () => {
    await renderAll();
  });
});
