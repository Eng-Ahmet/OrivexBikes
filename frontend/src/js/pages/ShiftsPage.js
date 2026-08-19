import { api, state } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export async function renderShiftsPage(container) {
  const isAdmin = state.activeRole === 'ADMIN';
  const currentShift = await api.getCurrentShift();
  const historyLogs = await api.getShiftHistory();

  const isShiftOpen = currentShift && currentShift.id;

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-cash-register text-info me-2"></i> ${t('shifts_title')}</h2>
        <p class="text-secondary small mb-0">${t('shifts_subtitle')}</p>
      </div>

      ${isAdmin ? `
        <div class="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fs-6 fw-semibold">
          <i class="fa-solid fa-user-shield me-1"></i> Admin Audit Dashboard (Miguel & Quique)
        </div>
      ` : ''}
    </div>

    <!-- Active Shift Financial Status Card -->
    <div class="card-glass p-4 mb-4 shadow-sm">
      <div class="d-flex flex-wrap align-items-center justify-content-between border-bottom border-secondary border-opacity-25 pb-3 mb-3 gap-2">
        <div>
          <h5 class="fw-bold text-light mb-1"><i class="fa-solid fa-store text-info me-2"></i> Active Counter Shift Summary</h5>
          <span class="text-secondary small">${t('shift_active_operator')} <strong class="text-info">${(currentShift && currentShift.employee_name) || state.currentUser?.username}</strong></span>
        </div>
        <span class="badge ${isShiftOpen ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'} rounded-pill px-3 py-2 d-inline-flex align-items-center">
          ${isShiftOpen ? `<span class="status-dot-active me-2"></span> ${t('shift_active')}` : 'No Active Shift'}
        </span>
      </div>

      <!-- Itemized Financial Breakdown Grid -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3 mb-3">
        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1">${t('starting_float')}</div>
            <div class="fs-5 fw-bold text-light">€${((currentShift && currentShift.opening_cash) || 150).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1"><i class="fa-solid fa-bicycle text-success me-1"></i> ${t('cash_rentals')}</div>
            <div class="fs-5 fw-bold text-success">+€${((currentShift && currentShift.total_cash_rentals) || 0).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-warning">
            <div class="text-warning small mb-1"><i class="fa-solid fa-screwdriver-wrench me-1"></i> Workshop Repairs Income</div>
            <div class="fs-5 fw-bold text-warning">+€${((currentShift && currentShift.total_workshop_income) || 0).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1"><i class="fa-solid fa-arrow-up-from-bracket text-danger me-1"></i> ${t('cash_withdrawals')}</div>
            <div class="fs-5 fw-bold text-danger">-€${((currentShift && currentShift.total_withdrawals) || 0).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-info">
            <div class="text-info small mb-1"><i class="fa-solid fa-vault me-1"></i> ${t('expected_drawer_cash')}</div>
            <div class="fs-5 fw-bold text-info">€${((currentShift && currentShift.expected_cash) || 150).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 justify-content-end">
        <button id="btnWithdrawal" class="btn btn-outline-warning btn-sm fw-semibold">
          <i class="fa-solid fa-money-bill-transfer me-1"></i> ${t('btn_record_payout')}
        </button>
        <button id="btnCloseShift" class="btn btn-danger btn-sm fw-semibold">
          <i class="fa-solid fa-lock me-1"></i> ${t('btn_close_shift')}
        </button>
      </div>
    </div>

    <!-- Admin Shift Closure & Discrepancy History Table -->
    <div class="card-glass p-3 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-light mb-0"><i class="fa-solid fa-clock-rotate-left text-info me-2"></i> ${t('shift_history_title')}</h5>
        <span class="text-secondary small">Comprehensive Admin Shift Closure Ledger</span>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">${t('th_date_time')}</th>
              <th scope="col">${t('th_employee')}</th>
              <th scope="col">${t('th_opening_cash')}</th>
              <th scope="col">${t('th_cash_rentals')}</th>
              <th scope="col">Workshop Income</th>
              <th scope="col">Deposits Net</th>
              <th scope="col">${t('th_withdrawals')}</th>
              <th scope="col">${t('th_expected')}</th>
              <th scope="col">${t('th_closing')}</th>
              <th scope="col">${t('th_discrepancy')}</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="shiftHistoryBody">
            ${(!historyLogs || historyLogs.length === 0) ? `
              <tr><td colspan="11" class="text-center text-secondary py-4">No closed shift audit logs recorded yet.</td></tr>
            ` : historyLogs.map(log => {
              const disc = Number(log.discrepancy || 0);
              let discBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">€0.00 (Exact)</span>`;
              if (disc > 0) discBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">+€${disc.toFixed(2)} (Over)</span>`;
              if (disc < 0) discBadge = `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">-€${Math.abs(disc).toFixed(2)} (Short)</span>`;

              const depCollected = log.deposits_collected || 0;
              const depRefunded = log.deposits_refunded || 0;

              return `
                <tr>
                  <td class="font-monospace text-secondary">${new Date(log.closed_at || log.created_at).toLocaleString()}</td>
                  <td class="fw-bold text-info"><i class="fa-solid fa-user me-1"></i> ${log.employee_name}</td>
                  <td>€${(log.opening_cash || 0).toFixed(2)}</td>
                  <td class="text-success">+€${(log.total_cash_rentals || log.cash_sales || 0).toFixed(2)}</td>
                  <td class="text-warning">+€${(log.total_workshop_income || 0).toFixed(2)}</td>
                  <td class="small"><span class="text-success">+€${depCollected.toFixed(2)}</span> / <span class="text-danger">-€${depRefunded.toFixed(2)}</span></td>
                  <td class="text-danger">-€${(log.total_withdrawals || 0).toFixed(2)}</td>
                  <td class="fw-bold">€${(log.expected_cash || 0).toFixed(2)}</td>
                  <td class="fw-bold text-light">€${(log.closing_cash || 0).toFixed(2)}</td>
                  <td>${discBadge}</td>
                  <td class="text-end">
                    <button class="btn btn-outline-info btn-sm btn-inspect-shift fw-semibold" data-id="${log.id}">
                      <i class="fa-solid fa-eye me-1"></i> Detallar Turno
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SHIFT INSPECTOR MODAL CONTAINER -->
    <div id="shiftInspectorModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-receipt me-2"></i> Detalle de Turno y Operaciones del Día</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="shiftInspectorBody">
            <!-- Dynamic Shift Details populated via JavaScript -->
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Payout Button
  container.querySelector('#btnWithdrawal').addEventListener('click', () => {
    const amountStr = prompt('Enter cash withdrawal / payout amount (€):', '20.00');
    if (!amountStr) return;
    const reasonStr = prompt('Enter reason for cash withdrawal (e.g. Spare Parts, Water, Fuel):', 'Parts Purchase');
    if (!reasonStr) return;

    api.recordCashWithdrawal(Number(amountStr), reasonStr).then(res => {
      if (res.error) showToast(res.error, 'error');
      else {
        showToast('💸 Cash withdrawal recorded successfully!', 'success');
        window.dispatchEvent(new CustomEvent('app:refresh'));
      }
    });
  });

  // Bind Close Shift Button
  container.querySelector('#btnCloseShift').addEventListener('click', () => {
    const closingCashStr = prompt('Enter actual counted cash in drawer (€):', String(currentShift ? currentShift.expected_cash : 150));
    if (!closingCashStr) return;
    const notesStr = prompt('Enter shift audit notes / explanation for discrepancy:', 'End of day shift closure');

    api.closeShift(Number(closingCashStr), notesStr || 'Shift Closed').then(res => {
      if (res.error) showToast(res.error, 'error');
      else {
        showToast('🔒 Shift closed and cash drawer audited successfully!', 'success');
        window.dispatchEvent(new CustomEvent('app:refresh'));
      }
    });
  });

  // Bind Shift Details Inspector Modal
  const modalEl = container.querySelector('#shiftInspectorModal');
  const modalBody = container.querySelector('#shiftInspectorBody');

  container.querySelectorAll('.btn-inspect-shift').forEach(btn => {
    btn.addEventListener('click', () => {
      const shiftId = Number(btn.getAttribute('data-id'));
      const targetShift = (historyLogs || []).find(s => s.id === shiftId);

      if (!targetShift) return;

      const contracts = targetShift.contracts_details || [];
      const repairs = targetShift.repairs_details || [];

      modalBody.innerHTML = `
        <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary mb-3">
          <div class="row g-2 text-secondary small">
            <div class="col-md-6"><strong>Empleado:</strong> <span class="text-info fw-bold">${targetShift.employee_name}</span></div>
            <div class="col-md-6"><strong>Fecha / Hora:</strong> <span class="text-light">${new Date(targetShift.closed_at || targetShift.created_at).toLocaleString()}</span></div>
            <div class="col-md-6"><strong>Fondo Inicial:</strong> <span class="text-light">€${(targetShift.opening_cash || 0).toFixed(2)}</span></div>
            <div class="col-md-6"><strong>Efectivo Contado:</strong> <span class="text-success fw-bold">€${(targetShift.closing_cash || 0).toFixed(2)}</span></div>
            <div class="col-12"><strong>Notas Auditoría:</strong> <span class="text-warning">${targetShift.notes || 'Ninguna'}</span></div>
          </div>
        </div>

        <h6 class="fw-bold text-info fs-6 mb-2"><i class="fa-solid fa-bicycle me-1"></i> Contratos de Alquiler del Turno (${contracts.length})</h6>
        <div class="table-responsive mb-3">
          <table class="table table-dark table-sm table-bordered border-secondary align-middle mb-0" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Tarifa (€)</th>
                <th>Fianza Cobrada</th>
                <th>Fianza Devuelta</th>
              </tr>
            </thead>
            <tbody>
              ${contracts.length === 0 ? `<tr><td colspan="6" class="text-center text-secondary">Sin alquileres en este turno.</td></tr>` : contracts.map(c => `
                <tr>
                  <td class="fw-bold text-info">${c.contract_number}</td>
                  <td>${c.customer_name}</td>
                  <td>${c.vehicle_name}</td>
                  <td class="text-success fw-bold">€${(c.rental_fee || 0).toFixed(2)}</td>
                  <td class="text-warning">€${(c.deposit_collected || 0).toFixed(2)}</td>
                  <td class="text-danger">€${(c.deposit_refunded || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <h6 class="fw-bold text-warning fs-6 mb-2"><i class="fa-solid fa-screwdriver-wrench me-1"></i> Reparaciones de Taller del Turno (${repairs.length})</h6>
        <div class="table-responsive">
          <table class="table table-dark table-sm table-bordered border-secondary align-middle mb-0" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Cliente</th>
                <th>Dispositivo</th>
                <th>Avería</th>
                <th>Cobrado (€)</th>
              </tr>
            </thead>
            <tbody>
              ${repairs.length === 0 ? `<tr><td colspan="5" class="text-center text-secondary">Sin reparaciones en este turno.</td></tr>` : repairs.map(r => `
                <tr>
                  <td class="fw-bold text-warning">${r.ticket_number}</td>
                  <td>${r.customer_name}</td>
                  <td>${r.device_model}</td>
                  <td>${r.reported_issue}</td>
                  <td class="text-success fw-bold">€${(r.total_price || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
      } else {
        modalEl.style.display = 'block';
        modalEl.classList.add('show');
      }
    });
  });
}
