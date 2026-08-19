import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export async function renderRepairsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">🛠️ Workshop Repairs & Spare Parts Catalog</h2>
        <p class="text-secondary small mb-0">Separate customer workshop repair work orders, Xiaomi spare parts, & pricing formula calculator</p>
      </div>
      <button id="btnNewRepairTicket" class="btn btn-warning fw-bold btn-sm shadow-sm">
        ➕ New Customer Repair Ticket (تسجيل إصلاح دراجة زبون)
      </button>
    </div>

    <!-- Section 1: Customer Workshop Repair Tickets Log (TRACKED SEPARATELY FROM RENTALS) -->
    <div class="card-glass p-3 shadow-sm mb-4 border-start border-3 border-warning">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-warning fs-6 mb-0">🚲 Customer Workshop Repair Tickets (سجل إصلاحات الدراجات والسكوترات الخارجية)</h5>
        <span class="badge bg-warning-subtle text-warning border border-warning-subtle">Separate Workshop Accounting</span>
      </div>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Ticket #</th>
              <th scope="col">Customer</th>
              <th scope="col">Device / Bike Model</th>
              <th scope="col">Reported Issue</th>
              <th scope="col">Parts Used</th>
              <th scope="col">Total Price (€)</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Update Status</th>
            </tr>
          </thead>
          <tbody id="workOrdersTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Section 2: Custom Part Price Formula Calculator -->
    <div class="card-glass p-4 shadow-sm mb-4">
      <h5 class="fw-bold text-info fs-6 mb-2">🧮 Custom Spare Part Pricing Calculator (معادلة تسعير القطع الأخرى)</h5>
      <p class="text-secondary small mb-3">Formula: <code>PVP = Coste x 1,21 x 2,20 + Mano de obra</code> (Cost x 2.662 + Labor)</p>
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label text-secondary small fw-semibold">Wholesale Cost Price (€)</label>
          <input type="number" id="calcPartCost" class="form-control bg-dark text-light border-secondary" step="0.5" placeholder="e.g. 10.00" />
        </div>
        <div class="col-md-4">
          <label class="form-label text-secondary small fw-semibold">Labor Type (أجور العمل)</label>
          <select id="calcLaborType" class="form-select bg-dark text-light border-secondary">
            <option value="15">Mechanical Repair (€15/h)</option>
            <option value="25">Electrical Repair (€25/h)</option>
            <option value="0">No Labor (Part Only)</option>
          </select>
        </div>
        <div class="col-md-4">
          <div class="bg-dark bg-opacity-75 p-2 rounded border border-secondary text-center">
            <div class="text-secondary small">Calculated Selling Price (PVP)</div>
            <div id="calcPVPResult" class="fs-4 fw-bold text-success">€0.00</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Full 29 Xiaomi m365 Parts Catalog & Bike Repair Services -->
    <div class="row row-cols-1 row-cols-lg-2 g-3 mb-4">
      <!-- 29 Xiaomi Scooter Parts -->
      <div class="col">
        <div class="card-glass p-3 shadow-sm h-100">
          <h5 class="fw-bold text-info fs-6 mb-3">🛴 Xiaomi m365 / Pro Spare Parts Catalog (29 Items)</h5>
          <div class="table-responsive" style="max-height: 480px; overflow-y: auto;">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.8rem;">
              <thead class="table-dark text-secondary sticky-top">
                <tr>
                  <th scope="col">Part Name</th>
                  <th scope="col">PVP Repuesto</th>
                  <th scope="col">PVP Mano de Obra</th>
                </tr>
              </thead>
              <tbody id="partsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bike Repairs & Labor Rates -->
      <div class="col">
        <div class="card-glass p-3 shadow-sm h-100">
          <h5 class="fw-bold text-success fs-6 mb-3">🚲 Bike Repair Services & Hourly Labor Rates</h5>
          
          <div class="bg-dark bg-opacity-50 p-2 rounded border border-secondary mb-3 d-flex justify-content-around text-center">
            <div>
              <div class="text-secondary small">Mechanical Labor</div>
              <div class="fw-bold text-warning fs-6">15 € / hora</div>
            </div>
            <div>
              <div class="text-secondary small">Electrical Labor</div>
              <div class="fw-bold text-info fs-6">25 € / hora</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark text-secondary">
                <tr>
                  <th scope="col">Service Name</th>
                  <th scope="col">PVP Servicio</th>
                </tr>
              </thead>
              <tbody id="servicesTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: New Customer Workshop Repair Ticket -->
    <div id="newRepairModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-warning">🛠️ Create Customer Workshop Repair Ticket</h5>
            <button type="button" class="btn-close btn-close-white" id="closeRepairModalBtn"></button>
          </div>
          <form id="newRepairOrderForm">
            <div class="modal-body">
              <div class="mb-2">
                <label class="form-label text-secondary small fw-semibold">Customer Full Name *</label>
                <input type="text" id="repCustName" class="form-control bg-dark text-light border-secondary" placeholder="e.g. Maria Gomez" required />
              </div>
              <div class="mb-2">
                <label class="form-label text-secondary small fw-semibold">Customer Phone *</label>
                <input type="tel" id="repCustPhone" class="form-control bg-dark text-light border-secondary" placeholder="e.g. +34 611 222 333" required />
              </div>
              <div class="mb-2">
                <label class="form-label text-secondary small fw-semibold">Bike / Scooter Device Model *</label>
                <input type="text" id="repDeviceModel" class="form-control bg-dark text-light border-secondary" placeholder="e.g. Xiaomi m365 Pro / BH Mountain Bike" required />
              </div>
              <div class="mb-2">
                <label class="form-label text-secondary small fw-semibold">Issue Description *</label>
                <textarea id="repIssue" class="form-control bg-dark text-light border-secondary" rows="2" placeholder="e.g. Front tire puncture & brake lever loose" required></textarea>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label text-secondary small fw-semibold">Parts Cost (€)</label>
                  <input type="number" id="repPartsCost" class="form-control bg-dark text-light border-secondary" step="0.5" value="0.00" />
                </div>
                <div class="col-6">
                  <label class="form-label text-secondary small fw-semibold">Labor Charge (€)</label>
                  <input type="number" id="repLaborCost" class="form-control bg-dark text-light border-secondary" step="0.5" value="15.00" />
                </div>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelRepairModalBtn">Cancel</button>
              <button type="submit" class="btn btn-warning btn-sm fw-bold">Issue Repair Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const workOrdersTable = container.querySelector('#workOrdersTableBody');
  const partsTable = container.querySelector('#partsTableBody');
  const servicesTable = container.querySelector('#servicesTableBody');

  const calcCostInput = container.querySelector('#calcPartCost');
  const calcLaborSelect = container.querySelector('#calcLaborType');
  const calcResultEl = container.querySelector('#calcPVPResult');

  const repairModalEl = container.querySelector('#newRepairModal');

  function updateFormulaCalc() {
    const cost = Number(calcCostInput.value || 0);
    const labor = Number(calcLaborSelect.value || 0);
    if (cost <= 0) {
      calcResultEl.textContent = '€0.00';
      return;
    }
    // PVP = Cost * 1.21 * 2.20 + Labor
    const pvp = (cost * 1.21 * 2.20) + labor;
    calcResultEl.textContent = `€${pvp.toFixed(2)}`;
  }

  calcCostInput.addEventListener('input', updateFormulaCalc);
  calcLaborSelect.addEventListener('change', updateFormulaCalc);

  async function loadData() {
    // 1. Load Workshop Work Orders
    const orders = await api.getRepairWorkOrders();
    workOrdersTable.innerHTML = '';
    if (!orders || orders.length === 0) {
      workOrdersTable.innerHTML = `<tr><td colspan="8" class="text-center text-secondary py-3">No customer workshop repair tickets found. Click "New Customer Repair Ticket" to record one!</td></tr>`;
    } else {
      orders.forEach(o => {
        const tr = document.createElement('tr');
        let statusBadgeClass = 'badge bg-secondary';
        if (o.status === 'RECEIVED') statusBadgeClass = 'badge bg-primary-subtle text-primary border border-primary-subtle';
        if (o.status === 'IN_PROGRESS') statusBadgeClass = 'badge bg-warning-subtle text-warning border border-warning-subtle';
        if (o.status === 'READY') statusBadgeClass = 'badge bg-info-subtle text-info border border-info-subtle';
        if (o.status === 'DELIVERED_PAID') statusBadgeClass = 'badge bg-success-subtle text-success border border-success-subtle';

        tr.innerHTML = `
          <td class="fw-bold text-info">${o.ticket_number}</td>
          <td>
            <div class="fw-semibold text-light">${o.customer_name}</div>
            <div class="text-secondary small">${o.customer_phone}</div>
          </td>
          <td class="fw-semibold">${o.device_model}</td>
          <td class="text-secondary small">${o.issue_description}</td>
          <td class="text-muted small">${o.parts_used || '-'}</td>
          <td class="fw-bold text-success">€${o.total_price.toFixed(2)}</td>
          <td><span class="${statusBadgeClass} rounded-pill">${o.status}</span></td>
          <td class="text-end">
            <select class="form-select form-select-sm bg-dark text-light border-secondary status-select" data-id="${o.id}" style="width: 140px; display: inline-block;">
              <option value="RECEIVED" ${o.status === 'RECEIVED' ? 'selected' : ''}>RECEIVED</option>
              <option value="IN_PROGRESS" ${o.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
              <option value="READY" ${o.status === 'READY' ? 'selected' : ''}>READY</option>
              <option value="DELIVERED_PAID" ${o.status === 'DELIVERED_PAID' ? 'selected' : ''}>DELIVERED_PAID</option>
            </select>
          </td>
        `;
        workOrdersTable.appendChild(tr);
      });

      workOrdersTable.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', async (e) => {
          const id = Number(sel.getAttribute('data-id'));
          const newStat = e.target.value;
          await api.updateRepairWorkOrderStatus(id, newStat);
          showToast(`Ticket status updated to ${newStat}`, 'success');
          await loadData();
        });
      });
    }

    // 2. Load Parts & Services Tables
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
      `;
      servicesTable.appendChild(tr);
    });
  }

  const hideModal = () => {
    repairModalEl.style.display = 'none';
    repairModalEl.classList.remove('show');
  };

  container.querySelector('#btnNewRepairTicket')?.addEventListener('click', () => {
    repairModalEl.style.display = 'block';
    repairModalEl.classList.add('show');
  });

  container.querySelector('#closeRepairModalBtn')?.addEventListener('click', hideModal);
  container.querySelector('#cancelRepairModalBtn')?.addEventListener('click', hideModal);

  container.querySelector('#newRepairOrderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      customer_name: container.querySelector('#repCustName').value,
      customer_phone: container.querySelector('#repCustPhone').value,
      device_model: container.querySelector('#repDeviceModel').value,
      issue_description: container.querySelector('#repIssue').value,
      parts_cost: Number(container.querySelector('#repPartsCost').value || 0),
      labor_cost: Number(container.querySelector('#repLaborCost').value || 15)
    };

    const res = await api.createRepairWorkOrder(data);
    if (res.error) showToast(res.error, 'error');
    else {
      hideModal();
      container.querySelector('#newRepairOrderForm').reset();
      showToast(`✅ Customer Repair Ticket ${res.ticket_number} created!`, 'success');
      await loadData();
    }
  });

  await loadData();
}
