import { api } from '../api.js';

export async function renderRepairsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>🛠️ Spare Parts & Repair Services Catalog (Recambios y Servicios)</h2>
        <p class="page-desc">Official pricing table for Xiaomi scooter spare parts, bike repairs, & labor rates</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <!-- Scooter Spare Parts Catalog -->
      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem; color: var(--accent-cyan);">🛴 Xiaomi Scooter Parts (Recambio Patines)</h3>
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Item / Part Name</th>
                <th>Part Only (PVP)</th>
                <th>Part + Labor (PVP+M.O)</th>
              </tr>
            </thead>
            <tbody id="partsTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Bike Repairs & Labor Rates -->
      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem; color: var(--accent-emerald);">🚲 Bike Repairs & Labor (Servicios de Taller)</h3>
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Price (PVP)</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody id="servicesTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const partsTable = container.querySelector('#partsTableBody');
  const servicesTable = container.querySelector('#servicesTableBody');

  const parts = await api.getRepairParts();
  const services = await api.getRepairServices();

  partsTable.innerHTML = '';
  parts.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>€${p.pvp_part_only.toFixed(2)}</td>
      <td style="color: var(--accent-cyan); font-weight: 700;">€${p.pvp_with_labor.toFixed(2)}</td>
    `;
    partsTable.appendChild(tr);
  });

  servicesTable.innerHTML = '';
  services.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td style="color: var(--accent-emerald); font-weight: 700;">€${s.price.toFixed(2)}</td>
      <td><span class="status-badge status-AVAILABLE">${s.category}</span></td>
    `;
    servicesTable.appendChild(tr);
  });
}
