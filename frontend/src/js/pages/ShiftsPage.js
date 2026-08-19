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
        <span class="badge ${isShiftOpen ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'} rounded-pill px-3 py-2">
          ${isShiftOpen ? `<i class="fa-solid fa-circle text-success me-1 font-monospace" style="font-size: 0.55rem;"></i> ${t('shift_active')}` : 'No Active Shift'}
        </span>
      </div>

      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3 mb-3">
        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1">${t('starting_float')}</div>
            <div class="fs-4 fw-bold text-light">€${((currentShift && currentShift.opening_cash) || 150).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1">${t('cash_rentals')}</div>
            <div class="fs-4 fw-bold text-success">+€${((currentShift && currentShift.cash_sales) || 0).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
            <div class="text-secondary small mb-1">${t('cash_withdrawals')}</div>
            <div class="fs-4 fw-bold text-danger">-€${((currentShift && currentShift.total_withdrawals) || 0).toFixed(2)}</div>
          </div>
        </div>

        <div class="col">
          <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-info">
            <div class="text-info small mb-1">${t('expected_drawer_cash')}</div>
            <div class="fs-4 fw-bold text-info">€${((currentShift && currentShift.expected_cash) || 150).toFixed(2)}</div>
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
              <th scope="col">${t('th_withdrawals')}</th>
              <th scope="col">${t('th_expected')}</th>
              <th scope="col">${t('th_closing')}</th>
              <th scope="col">${t('th_discrepancy')}</th>
              <th scope="col">${t('th_notes')}</th>
            </tr>
          </thead>
          <tbody id="shiftHistoryBody">
            ${(!historyLogs || historyLogs.length === 0) ? `
              <tr><td colspan="9" class="text-center text-secondary py-4">No closed shift audit logs recorded yet.</td></tr>
            ` : historyLogs.map(log => {
              const disc = Number(log.discrepancy || 0);
              let discBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">€0.00 (Exact)</span>`;
              if (disc > 0) discBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">+€${disc.toFixed(2)} (Over)</span>`;
              if (disc < 0) discBadge = `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">-€${Math.abs(disc).toFixed(2)} (Short)</span>`;

              return `
                <tr>
                  <td class="font-monospace text-secondary">${new Date(log.closed_at || log.created_at).toLocaleString()}</td>
                  <td class="fw-bold text-info"><i class="fa-solid fa-user me-1"></i> ${log.employee_name}</td>
                  <td>€${(log.opening_cash || 0).toFixed(2)}</td>
                  <td class="text-success">+€${(log.cash_sales || 0).toFixed(2)}</td>
                  <td class="text-danger">-€${(log.total_withdrawals || 0).toFixed(2)}</td>
                  <td class="fw-bold">€${(log.expected_cash || 0).toFixed(2)}</td>
                  <td class="fw-bold text-light">€${(log.closing_cash || 0).toFixed(2)}</td>
                  <td>${discBadge}</td>
                  <td class="text-secondary small">${log.notes || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

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
}
