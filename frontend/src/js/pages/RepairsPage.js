import { api, state } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export async function renderRepairsPage(container) {
  const repairTickets = await api.getRepairWorkOrders();

  // LATIN-ONLY CHARACTER VALIDATION HELPER
  function isLatinOnly(str) {
    if (!str) return true;
    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return !hasArabic.test(str);
  }

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-screwdriver-wrench text-warning me-2"></i> ${t('workshop_title')}</h2>
        <p class="text-secondary small mb-0">${t('workshop_subtitle')}</p>
      </div>
      <button id="btnNewRepairTicket" class="btn btn-warning btn-sm fw-bold">
        <i class="fa-solid fa-plus me-1"></i> New Repair Ticket
      </button>
    </div>

    <!-- Active Workshop Work Orders Ledger -->
    <div class="card-glass p-3 mb-4 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-warning fs-6 mb-0"><i class="fa-solid fa-list-check me-2"></i> Active Workshop Tickets</h5>
        <span class="badge bg-warning-subtle text-warning border border-warning-subtle font-monospace">${(repairTickets || []).length} Tickets</span>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Ticket #</th>
              <th scope="col">Date / Time</th>
              <th scope="col">Customer</th>
              <th scope="col">Device Model</th>
              <th scope="col">Reported Issue</th>
              <th scope="col">Spare Parts</th>
              <th scope="col">Total Price (€)</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody id="repairTicketsTableBody">
            ${(!repairTickets || repairTickets.length === 0) ? `
              <tr><td colspan="8" class="text-center text-secondary py-4">No active workshop repair tickets. Click "New Repair Ticket" to register one!</td></tr>
            ` : repairTickets.map(ticket => `
              <tr>
                <td class="fw-bold text-warning font-monospace">${ticket.ticket_number}</td>
                <td class="font-monospace text-secondary">${new Date(ticket.created_at).toLocaleString()}</td>
                <td class="fw-semibold text-light">${ticket.customer_name} <br/><small class="text-secondary">${ticket.customer_phone}</small></td>
                <td class="fw-semibold">${ticket.device_model}</td>
                <td class="text-secondary">${ticket.reported_issue}</td>
                <td class="small">${Array.isArray(ticket.parts_used) ? ticket.parts_used.join(', ') : (ticket.parts_used || '-')}</td>
                <td class="fw-bold text-success fs-6">€${(ticket.total_price || 0).toFixed(2)}</td>
                <td><span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill">${ticket.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelector('#btnNewRepairTicket').addEventListener('click', () => {
    const name = prompt('Customer Name (Spanish / English / Latin Script):', 'Carlos Mendez');
    if (!name) return;
    if (!isLatinOnly(name)) {
      showToast('⚠️ Customer name must be written in Latin script (Spanish / English). Non-Latin script is disallowed.', 'error');
      return;
    }

    const phone = prompt('Customer Phone Number:', '+34 699 112 233');
    if (!phone) return;
    const device = prompt('Device Model (e.g. Xiaomi m365 Pro / E-Bike):', 'Xiaomi m365 Pro');
    if (!device) return;
    const issue = prompt('Reported Issue / Repair Needed:', 'Rear wheel puncture repair 8.5"');
    if (!issue) return;
    const priceStr = prompt('Total Repair & Spare Part Fee (€):', '35.00');
    if (!priceStr) return;

    api.createRepairTicket({
      customer_name: name,
      customer_phone: phone,
      device_model: device,
      reported_issue: issue,
      total_price: Number(priceStr),
      parts_used: ['Cubierta maciza agujereada 8,5"']
    }).then(res => {
      if (res.error) showToast(res.error, 'error');
      else {
        showToast(`🔧 Repair Ticket ${res.ticket_number} registered!`, 'success');
        renderRepairsPage(container);
      }
    });
  });
}
