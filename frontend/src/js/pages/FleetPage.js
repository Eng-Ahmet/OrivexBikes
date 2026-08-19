import { api, state } from '../api.js';
import { t } from '../i18n.js';

export async function renderFleetPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-bicycle text-info me-2"></i> ${t('fleet_title')}</h2>
        <p class="text-secondary small mb-0">${t('fleet_subtitle')}</p>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button id="btnViewTariffMatrix" class="btn btn-outline-info btn-sm fw-semibold">
          <i class="fa-solid fa-tags me-1"></i> ${t('btn_view_tariff_matrix')}
        </button>

        <input type="text" id="searchVehicle" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="🔍 ${t('search_placeholder')}" style="width: 180px;" />
        
        <select id="filterCategory" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: 160px;">
          <option value="ALL">${t('all_categories')}</option>
          <option value="Scooters">E-Scooters (Etwow / Ninebot)</option>
          <option value="E-Bikes (VISA)">E-Bikes (VISA)</option>
          <option value="Bikes">Bicycles (Quert / Altec / MTB / Bici Niño)</option>
          <option value="S cars/Quads">Quads & S Cars</option>
          <option value="XL Cars">XL Cars & Jeep</option>
          <option value="Buggy's">Buggy's (Azul / Rojo)</option>
          <option value="Accessories / Shoes">Accessories / Partner Items</option>
        </select>

        <select id="filterStatus" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: 140px;">
          <option value="ALL">${t('all_statuses')}</option>
          <option value="AVAILABLE">${t('available')}</option>
          <option value="RENTED">${t('rented')}</option>
          <option value="MAINTENANCE">${t('maintenance')}</option>
        </select>
      </div>
    </div>

    <!-- Bootstrap 4-Column Grid Container -->
    <div id="vehicleGrid" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4 g-3"></div>
  `;

  const searchInput = container.querySelector('#searchVehicle');
  const filterCategory = container.querySelector('#filterCategory');
  const filterStatus = container.querySelector('#filterStatus');
  const vehicleGrid = container.querySelector('#vehicleGrid');

  container.querySelector('#btnViewTariffMatrix').addEventListener('click', () => {
    state.activeTab = 'tariffsTab';
    window.dispatchEvent(new CustomEvent('app:tabChanged', { detail: { tabId: 'tariffsTab' } }));
  });

  async function loadVehicles() {
    const query = searchInput.value.trim();
    const cat = filterCategory.value;
    const stat = filterStatus.value;
    const vehicles = await api.getVehicles(cat, stat, query);

    vehicleGrid.innerHTML = '';
    if (!vehicles || vehicles.length === 0) {
      vehicleGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="card-glass p-4 text-secondary">No physical vehicles found matching current search or filter criteria.</div>
        </div>
      `;
      return;
    }

    vehicles.forEach(v => {
      const hourly = Number(v.rate_1h || v.hourly_rate || 5);
      const daily = Number(v.rate_1d || v.daily_rate || 20);
      const deposit = Number(v.deposit_amount || 30);
      const isNeighbor = v.item_owner === 'NEIGHBOR';

      const col = document.createElement('div');
      col.className = 'col';

      let statusBadgeClass = 'badge-available';
      if (v.status === 'RENTED') statusBadgeClass = 'badge-rented';
      if (v.status === 'MAINTENANCE') statusBadgeClass = 'badge-maintenance';

      col.innerHTML = `
        <div class="card-glass h-100 p-3 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="fw-bold text-light mb-0 fs-6">${v.name}</h5>
                <span class="text-secondary" style="font-size: 0.75rem;">${v.category} • ${v.qr_code}</span>
              </div>
              <span class="badge ${statusBadgeClass} rounded-pill">${v.status}</span>
            </div>

            ${isNeighbor ? `
              <div class="mb-2"><span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill" style="font-size: 0.7rem;"><i class="fa-solid fa-handshake me-1"></i> Neighbor (${v.neighbor_name || 'Partner'})</span></div>
            ` : ''}

            <!-- Official Tariff Matrix Breakdown for Vehicle -->
            <div class="bg-dark bg-opacity-50 p-2 rounded border border-secondary border-opacity-25 my-2" style="font-size: 0.8rem;">
              <div class="d-flex justify-content-between text-secondary"><span>${t('rate_1h')}</span><strong class="text-cyan">€${hourly.toFixed(2)}</strong></div>
              ${v.rate_30m ? `<div class="d-flex justify-content-between text-secondary"><span>${t('rate_30m')}</span><strong class="text-light">€${v.rate_30m.toFixed(2)}</strong></div>` : ''}
              ${v.rate_20m ? `<div class="d-flex justify-content-between text-secondary"><span>${t('rate_20m')}</span><strong class="text-light">€${v.rate_20m.toFixed(2)}</strong></div>` : ''}
              <div class="d-flex justify-content-between text-secondary"><span>${t('rate_1d')}</span><strong class="text-light">€${daily.toFixed(2)}</strong></div>
              <div class="d-flex justify-content-between text-secondary border-top border-secondary border-opacity-25 pt-1 mt-1"><span>${t('deposit')}</span><strong class="text-warning">€${deposit.toFixed(2)}</strong></div>
            </div>

            ${v.battery_level !== undefined ? `
              <div class="small text-secondary mb-3" style="font-size: 0.75rem;">
                <i class="fa-solid fa-bolt text-warning me-1"></i> ${t('battery')} <strong class="${v.battery_level > 50 ? 'text-success' : 'text-warning'}">${v.battery_level}%</strong>
              </div>
            ` : ''}
          </div>

          <div>
            ${v.status === 'AVAILABLE' ? `
              <button class="btn btn-primary btn-sm w-100 fw-semibold rent-btn" data-id="${v.id}">
                <i class="fa-solid fa-key me-1"></i> ${t('btn_rent_vehicle')}
              </button>
            ` : `
              <button class="btn btn-outline-secondary btn-sm w-100 disabled" disabled>
                ${t('btn_currently_rented')}
              </button>
            `}
          </div>
        </div>
      `;

      vehicleGrid.appendChild(col);
    });

    vehicleGrid.querySelectorAll('.rent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        window.dispatchEvent(new CustomEvent('app:openNewContractModal', { detail: { vehicleId: id } }));
      });
    });
  }

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadVehicles, 250);
  });
  filterCategory.addEventListener('change', loadVehicles);
  filterStatus.addEventListener('change', loadVehicles);

  await loadVehicles();
}
