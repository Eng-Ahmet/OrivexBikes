import { api } from '../api.js';

export async function renderRepairsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">🛠️ Spare Parts & Repair Services Catalog</h2>
        <p class="text-secondary small mb-0">Official pricing table for Xiaomi scooter spare parts, bike repairs, & labor rates</p>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-lg-2 g-3 mb-4">
      <!-- Xiaomi Scooter Parts -->
      <div class="col">
        <div class="card-glass p-3 shadow-sm h-100">
          <h4 class="fw-bold text-info fs-6 mb-3">🛴 Xiaomi Scooter Parts (Recambio Patines)</h4>
          <div class="table-responsive">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Item / Part Name</th>
                  <th scope="col">Part Only (PVP)</th>
                  <th scope="col">Part + Labor (PVP+M.O)</th>
                </tr>
              </thead>
              <tbody id="partsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bike Repairs & Labor -->
      <div class="col">
        <div class="card-glass p-3 shadow-sm h-100">
          <h4 class="fw-bold text-success fs-6 mb-3">🚲 Bike Repairs & Labor (Servicios de Taller)</h4>
          <div class="table-responsive">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Service Name</th>
                  <th scope="col">Price (PVP)</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>
              <tbody id="servicesTableBody"></tbody>
            </table>
          </div>
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
      <td class="fw-semibold text-light">${p.name}</td>
      <td class="fw-bold">€${p.pvp_part_only.toFixed(2)}</td>
      <td class="fw-bold text-info">€${p.pvp_with_labor.toFixed(2)}</td>
    `;
    partsTable.appendChild(tr);
  });

  servicesTable.innerHTML = '';
  services.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold text-light">${s.name}</td>
      <td class="fw-bold text-success">€${s.price.toFixed(2)}</td>
      <td><span class="badge bg-success-subtle text-success rounded-pill">${s.category}</span></td>
    `;
    servicesTable.appendChild(tr);
  });
}
