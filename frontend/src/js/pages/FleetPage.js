import { api, state } from '../api.js';
import { t } from '../i18n.js';

export async function renderFleetPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-layer-group text-info me-2"></i> ${t('fleet_title')}</h2>
        <p class="text-secondary small mb-0">Official 53 Málaga physical inventory units grouped by category cards with live unit counters</p>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center">
        <button id="btnViewTariffMatrix" class="btn btn-outline-info btn-sm fw-semibold">
          <i class="fa-solid fa-tags me-1"></i> ${t('btn_view_tariff_matrix')}
        </button>

        <!-- Duration Rate Filter -->
        <div class="d-flex align-items-center gap-1">
          <i class="fa-solid fa-stopwatch text-info"></i>
          <select id="filterDuration" class="form-select form-select-sm bg-dark text-info border-info fw-semibold" style="width: auto;">
            <option value="ALL">All Durations (Full Matrix)</option>
            <option value="20m">20 Minutos Rate</option>
            <option value="30m">30 Minutos Rate</option>
            <option value="1h">1 Hora Rate</option>
            <option value="2h">2 Horas Rate</option>
            <option value="5h">5 Horas Rate</option>
            <option value="1d">1 Día Rate</option>
          </select>
        </div>

        <select id="filterCategory" class="form-select form-select-sm bg-dark text-light border-secondary" style="width: 160px;">
          <option value="ALL">${t('all_categories')}</option>
          <option value="Scooters">E-Scooters (Etwow / Ninebot)</option>
          <option value="E-Bikes (VISA)">E-Bikes (VISA)</option>
          <option value="Bikes">Bicycles (Quert / Altec / MTB / Bici Niño)</option>
          <option value="S cars/Quads">Quads & S Cars</option>
          <option value="XL Cars">XL Cars & Jeep</option>
          <option value="Buggy's">Buggy's (Azul / Rojo)</option>
        </select>
      </div>
    </div>

    <!-- Grouped Category Cards Grid Container -->
    <div id="categoryGrid" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3"></div>
  `;

  const filterCategory = container.querySelector('#filterCategory');
  const filterDuration = container.querySelector('#filterDuration');
  const categoryGrid = container.querySelector('#categoryGrid');

  container.querySelector('#btnViewTariffMatrix').addEventListener('click', () => {
    state.activeTab = 'tariffsTab';
    window.dispatchEvent(new CustomEvent('app:tabChanged', { detail: { tabId: 'tariffsTab' } }));
  });

  async function loadVehicles() {
    const selectedCat = filterCategory.value;
    const durFilter = filterDuration.value;
    const allVehicles = await api.getVehicles('ALL', 'ALL', '');

    // Group 53 vehicles by category or model name
    const grouped = {};
    allVehicles.forEach(v => {
      let groupName = v.category;
      if (v.name.includes('Quert')) groupName = 'Quert Bicycles (10 Units)';
      else if (v.name.includes('Altec')) groupName = 'Altec Bicycles (8 Units)';
      else if (v.name.includes('BH Mountain')) groupName = 'Mountain Bikes BH (3 Units)';
      else if (v.name.includes('Niño')) groupName = 'Bicis Niño (2 Units)';
      else if (v.category.includes('E-Bikes')) groupName = 'E-Bikes VISA (8 Units)';
      else if (v.name.includes('Ninebot')) groupName = 'Patinetes Ninebot (4 Units)';
      else if (v.name.includes('Etwow')) groupName = 'Patinetes Etwow (4 Units)';
      else if (v.name.includes('Quad')) groupName = 'Quads (4 Units)';
      else if (v.category.includes('XL Cars')) groupName = 'XL Cars & Jeep (6 Units)';
      else if (v.category.includes("Buggy's")) groupName = "Buggy's Azul & Rojo (4 Units)";

      if (!grouped[groupName]) {
        grouped[groupName] = {
          name: groupName,
          category: v.category,
          rate_20m: v.rate_20m,
          rate_30m: v.rate_30m,
          rate_1h: v.rate_1h || v.hourly_rate,
          rate_2h: v.rate_2h,
          rate_5h: v.rate_5h,
          rate_1d: v.rate_1d || v.daily_rate,
          deposit_amount: v.deposit_amount,
          item_owner: v.item_owner,
          neighbor_name: v.neighbor_name,
          units: []
        };
      }
      grouped[groupName].units.push(v);
    });

    categoryGrid.innerHTML = '';
    const groupKeys = Object.keys(grouped);

    if (groupKeys.length === 0) {
      categoryGrid.innerHTML = `<div class="col-12 text-center py-5 text-secondary">No vehicle categories found.</div>`;
      return;
    }

    groupKeys.forEach(key => {
      const g = grouped[key];
      if (selectedCat !== 'ALL' && !g.category.includes(selectedCat)) return;

      const availableCount = g.units.filter(u => u.status === 'AVAILABLE').length;
      const rentedCount = g.units.filter(u => u.status === 'RENTED').length;
      const maintCount = g.units.filter(u => u.status === 'MAINTENANCE').length;
      const totalCount = g.units.length;

      const isNeighbor = g.item_owner === 'NEIGHBOR';
      const col = document.createElement('div');
      col.className = 'col';

      // Duration highlight calculation
      let durationHighlightHtml = '';
      if (durFilter === '20m' && g.rate_20m) {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>20 Min Rate: €${g.rate_20m.toFixed(2)}</strong></div>`;
      } else if (durFilter === '30m' && g.rate_30m) {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>30 Min Rate: €${g.rate_30m.toFixed(2)}</strong></div>`;
      } else if (durFilter === '1h') {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>1 Hour Rate: €${(g.rate_1h || 5).toFixed(2)}</strong></div>`;
      } else if (durFilter === '2h' && g.rate_2h) {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>2 Hours Rate: €${g.rate_2h.toFixed(2)}</strong></div>`;
      } else if (durFilter === '5h' && g.rate_5h) {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>5 Hours Rate: €${g.rate_5h.toFixed(2)}</strong></div>`;
      } else if (durFilter === '1d') {
        durationHighlightHtml = `<div class="p-2 bg-info bg-opacity-25 rounded border border-info text-info mb-2 text-center"><strong>1 Day Rate: €${(g.rate_1d || 20).toFixed(2)}</strong></div>`;
      }

      col.innerHTML = `
        <div class="card-glass h-100 p-3 d-flex flex-column justify-content-between shadow-sm">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="fw-bold text-light mb-0 fs-6">${g.name}</h5>
                <span class="text-secondary" style="font-size: 0.75rem;">${g.category}</span>
              </div>
              <span class="badge ${availableCount > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} rounded-pill px-2 py-1">
                ${availableCount} / ${totalCount} ${t('available')}
              </span>
            </div>

            ${isNeighbor ? `
              <div class="mb-2"><span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill" style="font-size: 0.7rem;"><i class="fa-solid fa-handshake me-1"></i> Partner (${g.neighbor_name || 'Neighbor'})</span></div>
            ` : ''}

            ${durationHighlightHtml}

            <!-- Rates breakdown -->
            <div class="bg-dark bg-opacity-50 p-2 rounded border border-secondary border-opacity-25 my-2" style="font-size: 0.8rem;">
              <div class="d-flex justify-content-between text-secondary"><span>1 Hour Rate:</span><strong class="text-cyan">€${(g.rate_1h || 5).toFixed(2)}</strong></div>
              ${g.rate_30m ? `<div class="d-flex justify-content-between text-secondary"><span>30 Min Rate:</span><strong class="text-light">€${g.rate_30m.toFixed(2)}</strong></div>` : ''}
              ${g.rate_20m ? `<div class="d-flex justify-content-between text-secondary"><span>20 Min Rate:</span><strong class="text-light">€${g.rate_20m.toFixed(2)}</strong></div>` : ''}
              <div class="d-flex justify-content-between text-secondary"><span>1 Day Rate:</span><strong class="text-light">€${(g.rate_1d || 20).toFixed(2)}</strong></div>
              <div class="d-flex justify-content-between text-secondary border-top border-secondary border-opacity-25 pt-1 mt-1"><span>${t('deposit')}</span><strong class="text-warning">€${(g.deposit_amount || 30).toFixed(2)}</strong></div>
            </div>

            <!-- Units Badge List -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              ${g.units.map(u => `
                <span class="badge ${u.status === 'AVAILABLE' ? 'bg-success-subtle text-success' : u.status === 'RENTED' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}" style="font-size: 0.65rem;" title="${u.name} (${u.status})">
                  ${u.qr_code || u.name}
                </span>
              `).join('')}
            </div>
          </div>

          <div>
            ${availableCount > 0 ? `
              <button class="btn btn-primary btn-sm w-100 fw-semibold rent-category-btn" data-category="${g.category}">
                <i class="fa-solid fa-key me-1"></i> ${t('btn_rent_vehicle')} (${availableCount} Available)
              </button>
            ` : `
              <button class="btn btn-outline-secondary btn-sm w-100 disabled" disabled>
                All ${totalCount} Units Rented
              </button>
            `}
          </div>
        </div>
      `;

      categoryGrid.appendChild(col);
    });

    categoryGrid.querySelectorAll('.rent-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        window.dispatchEvent(new CustomEvent('app:openNewContractModal', { detail: { category: cat } }));
      });
    });
  }

  filterCategory.addEventListener('change', loadVehicles);
  filterDuration.addEventListener('change', loadVehicles);

  await loadVehicles();
}
