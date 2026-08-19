import { api } from '../api.js';

export async function renderFleetPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Fleet Inventory & Availability</h2>
        <p class="page-desc">Real-time status of bikes, e-scooters & cargo vehicles</p>
      </div>
      <div class="filter-bar">
        <input type="text" id="searchVehicle" class="styled-select" placeholder="🔍 Search name, QR code, frame..." style="min-width: 220px;" />

        <select id="filterCategory" class="styled-select">
          <option value="ALL">All Categories</option>
          <option value="E-Bike">E-Bikes</option>
          <option value="E-Scooter">E-Scooters</option>
          <option value="City Bike">City Bikes</option>
          <option value="Mountain Bike">Mountain Bikes</option>
          <option value="Cargo Bike">Cargo Bikes</option>
        </select>

        <select id="filterStatus" class="styled-select">
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>
    </div>

    <div id="vehicleGrid" class="vehicle-grid"></div>
  `;

  const searchInput = container.querySelector('#searchVehicle');
  const filterCategory = container.querySelector('#filterCategory');
  const filterStatus = container.querySelector('#filterStatus');
  const vehicleGrid = container.querySelector('#vehicleGrid');

  async function loadVehicles() {
    const query = searchInput.value.trim();
    const cat = filterCategory.value;
    const stat = filterStatus.value;
    const vehicles = await api.getVehicles(cat, stat, query);

    vehicleGrid.innerHTML = '';
    if (!vehicles || vehicles.length === 0) {
      vehicleGrid.innerHTML = `<div class="glass-panel" style="padding: 2rem; grid-column: 1/-1; text-align: center; color: var(--text-muted);">No vehicles found matching current filter or search.</div>`;
      return;
    }

    vehicles.forEach(v => {
      const hourly = Number(v.rate_1h || v.hourly_rate || 5);
      const daily = Number(v.rate_1d || v.daily_rate || 20);
      const deposit = Number(v.deposit_amount || 30);

      const card = document.createElement('div');
      card.className = 'vehicle-card glass-panel';
      card.innerHTML = `
        <div class="vehicle-header">
          <div>
            <div class="vehicle-name">${v.name}</div>
            <div class="vehicle-category">${v.category} • ${v.qr_code}</div>
          </div>
          <span class="status-badge status-${v.status}">${v.status}</span>
        </div>

        <div class="vehicle-specs">
          <div class="spec-item">
            <span class="spec-label">Hourly Rate</span>
            <span class="spec-val">€${hourly.toFixed(2)}/h</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Daily Rate</span>
            <span class="spec-val">€${daily.toFixed(2)}/day</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Deposit</span>
            <span class="spec-val">€${deposit.toFixed(2)}</span>
          </div>
        </div>

        ${v.battery_level !== undefined ? `
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
            ⚡ Battery: <strong style="color: ${v.battery_level > 50 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}">${v.battery_level}%</strong>
          </div>
        ` : ''}

        <div style="margin-top: auto;">
          ${v.status === 'AVAILABLE' ? `
            <button class="btn btn-primary btn-sm btn-full rent-btn" data-id="${v.id}">
              ✨ Rent This Vehicle
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm btn-full" disabled style="opacity: 0.6;">
              Unavailable
            </button>
          `}
        </div>
      `;
      vehicleGrid.appendChild(card);
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
