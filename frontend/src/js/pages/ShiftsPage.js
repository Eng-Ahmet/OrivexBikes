import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export async function renderShiftsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">💵 Daily Shift & Cash Drawer Audit</h2>
        <p class="text-secondary small mb-0">Manage daily shift opening, cash withdrawals, expenses, & cash discrepancy audit log</p>
      </div>
    </div>

    <!-- Active Shift Summary Banner -->
    <div id="activeShiftCard" class="mb-4"></div>

    <!-- Daily Shift History Audit Log Table -->
    <div class="card-glass p-3 shadow-sm">
      <h4 class="fw-bold text-info fs-6 mb-3">📜 Daily Shift Audit History (سجل الشفتات والفرق النقدي)</h4>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Date / Time</th>
              <th scope="col">Employee</th>
              <th scope="col">Opening Cash</th>
              <th scope="col">Cash Rentals</th>
              <th scope="col">Withdrawals / Expenses</th>
              <th scope="col">Expected Cash</th>
              <th scope="col">Closing Cash</th>
              <th scope="col">Discrepancy (الفرق)</th>
              <th scope="col">Notes / Explanation</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody id="shiftHistoryTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Record Cash Withdrawal / Expense -->
    <div id="withdrawalModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-warning">💸 Record Cash Payout / Expense (سحب نقدي / مصاريف)</h5>
            <button type="button" class="btn-close btn-close-white" id="closeWithdrawalModalBtn"></button>
          </div>
          <form id="withdrawalForm">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Cash Amount (€) *</label>
                <input type="number" id="withdrawalAmount" class="form-control bg-dark text-light border-secondary" step="0.5" min="1" placeholder="e.g. 20.00" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Reason / Explanation (Mandatory) *</label>
                <textarea id="withdrawalReason" class="form-control bg-dark text-light border-secondary" rows="3" placeholder="e.g. Employee advance / Petty cash for store cleaning..." required></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelWithdrawalBtn">Cancel</button>
              <button type="submit" class="btn btn-warning btn-sm fw-semibold">Record Cash Payout</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Close Shift Audit -->
    <div id="closeShiftModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-danger">🔒 Close Shift & Audit Cash Drawer</h5>
            <button type="button" class="btn-close btn-close-white" id="closeShiftModalBtn"></button>
          </div>
          <form id="closeShiftForm">
            <div class="modal-body">
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary mb-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Opening Float Cash:</span><strong id="auditOpening" class="text-light">€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>(+) Cash Rentals Collected:</span><strong id="auditCashRentals" class="text-success">+€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>(-) Cash Withdrawals / Expenses:</span><strong id="auditWithdrawals" class="text-danger">-€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Expected Cash in Drawer:</span><strong id="auditExpected" class="text-info fs-6">€0.00</strong></div>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Actual Cash Counted in Drawer (€) *</label>
                <input type="number" id="enteredClosingCash" class="form-control bg-dark text-light border-secondary" step="0.5" placeholder="e.g. 165.00" required />
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Shift Closing Notes & Explanation *</label>
                <textarea id="closeShiftNotes" class="form-control bg-dark text-light border-secondary" rows="2" placeholder="e.g. Cash drawer counted cleanly / 5€ shortage explained by..." required></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelCloseShiftBtn">Cancel</button>
              <button type="submit" class="btn btn-danger btn-sm fw-semibold">Confirm & Close Shift</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const activeCard = container.querySelector('#activeShiftCard');
  const historyTable = container.querySelector('#shiftHistoryTableBody');

  const withdrawalModalEl = container.querySelector('#withdrawalModal');
  const closeShiftModalEl = container.querySelector('#closeShiftModal');

  async function loadShiftData() {
    const shift = await api.getCurrentShift();
    const history = await api.getShiftHistory();
    
    if (!shift) {
      activeCard.innerHTML = `
        <div class="card-glass p-4 border border-warning border-opacity-50">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h4 class="text-warning fw-bold mb-1">⚠️ No Active Shift Open for Málaga Store</h4>
              <p class="text-secondary small mb-0">Open a daily shift to start processing cash rentals and mid-shift withdrawals.</p>
            </div>
            <button id="btnOpenShift" class="btn btn-success fw-bold px-4">
              🚀 Open Daily Shift
            </button>
          </div>
        </div>
      `;

      container.querySelector('#btnOpenShift')?.addEventListener('click', async () => {
        const amount = prompt('Enter Starting Opening Float Cash (€):', '150');
        if (amount !== null) {
          const res = await api.openShift(Number(amount));
          if (res.error) showToast(res.error, 'error');
          else {
            showToast('✅ Daily shift opened successfully!', 'success');
            await loadShiftData();
          }
        }
      });
    } else {
      const opening = shift.opening_cash || 0;
      const rentals = shift.total_cash_rentals || 0;
      const withdrawals = shift.total_withdrawals || 0;
      const expected = opening + rentals - withdrawals;

      activeCard.innerHTML = `
        <div class="card-glass p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">🟢 SHIFT ACTIVE</span>
                <span class="fw-bold text-light fs-5">Operator: ${shift.employee_name}</span>
              </div>
              <p class="text-secondary small mb-0 mt-1">Opened at: ${new Date(shift.start_time).toLocaleString()}</p>
            </div>
            <div class="d-flex gap-2">
              <button id="btnRecordWithdrawal" class="btn btn-warning btn-sm fw-semibold">
                💸 Record Cash Payout / Expense
              </button>
              <button id="btnCloseShiftModalTrigger" class="btn btn-danger btn-sm fw-semibold">
                🔒 Close Shift & Audit Cash
              </button>
            </div>
          </div>

          <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
            <div class="col">
              <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25 border-start border-3 border-info">
                <div class="text-secondary small">Starting Float Cash</div>
                <div class="fs-4 fw-bold text-light">€${opening.toFixed(2)}</div>
              </div>
            </div>
            <div class="col">
              <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25 border-start border-3 border-success">
                <div class="text-secondary small">(+) Cash Rentals</div>
                <div class="fs-4 fw-bold text-success">+€${rentals.toFixed(2)}</div>
              </div>
            </div>
            <div class="col">
              <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25 border-start border-3 border-danger">
                <div class="text-secondary small">(-) Cash Withdrawals</div>
                <div class="fs-4 fw-bold text-danger">-€${withdrawals.toFixed(2)}</div>
              </div>
            </div>
            <div class="col">
              <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-25 border-start border-3 border-cyan">
                <div class="text-secondary small">Expected Drawer Cash</div>
                <div class="fs-4 fw-bold text-info">€${expected.toFixed(2)}</div>
              </div>
            </div>
          </div>

          ${shift.cash_movements && shift.cash_movements.length > 0 ? `
            <div class="mt-3 border-top border-secondary pt-3">
              <h6 class="text-warning fw-semibold mb-2">💸 Cash Payouts Recorded During Shift:</h6>
              <div class="d-flex flex-column gap-2">
                ${shift.cash_movements.map(m => `
                  <div class="small text-secondary bg-dark p-2 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
                    <span><strong class="text-light">€${m.amount.toFixed(2)}</strong> - ${m.reason} <small class="text-muted">(${m.performed_by})</small></span>
                    <span>${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      container.querySelector('#btnRecordWithdrawal')?.addEventListener('click', () => {
        withdrawalModalEl.style.display = 'block';
        withdrawalModalEl.classList.add('show');
      });

      container.querySelector('#btnCloseShiftModalTrigger')?.addEventListener('click', () => {
        container.querySelector('#auditOpening').textContent = `€${opening.toFixed(2)}`;
        container.querySelector('#auditCashRentals').textContent = `+€${rentals.toFixed(2)}`;
        container.querySelector('#auditWithdrawals').textContent = `-€${withdrawals.toFixed(2)}`;
        container.querySelector('#auditExpected').textContent = `€${expected.toFixed(2)}`;
        container.querySelector('#enteredClosingCash').value = expected.toFixed(2);
        closeShiftModalEl.style.display = 'block';
        closeShiftModalEl.classList.add('show');
      });
    }

    // Load History Table
    historyTable.innerHTML = '';
    if (!history || history.length === 0) {
      historyTable.innerHTML = `<tr><td colspan="10" class="text-center text-secondary py-4">No historical shift audit records found.</td></tr>`;
      return;
    }

    history.forEach(s => {
      const tr = document.createElement('tr');
      const disc = s.discrepancy || 0;
      let discHtml = `<span class="text-success fw-semibold">€0.00</span>`;
      if (disc > 0) discHtml = `<span class="text-info fw-semibold">+€${disc.toFixed(2)} (Over)</span>`;
      if (disc < 0) discHtml = `<span class="text-danger fw-semibold">-€${Math.abs(disc).toFixed(2)} (Short)</span>`;

      tr.innerHTML = `
        <td>${new Date(s.start_time).toLocaleDateString()} ${new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td class="fw-bold text-light">${s.employee_name}</td>
        <td>€${(s.opening_cash || 0).toFixed(2)}</td>
        <td class="text-success">+€${(s.total_cash_rentals || 0).toFixed(2)}</td>
        <td class="text-danger">-€${(s.total_withdrawals || 0).toFixed(2)}</td>
        <td>€${(s.expected_cash || 0).toFixed(2)}</td>
        <td class="fw-bold">€${(s.closing_cash || 0).toFixed(2)}</td>
        <td>${discHtml}</td>
        <td class="text-secondary small">${s.notes || '-'}</td>
        <td><span class="badge ${s.status === 'OPEN' ? 'badge-available' : 'badge-rented'} rounded-pill">${s.status}</span></td>
      `;
      historyTable.appendChild(tr);
    });
  }

  const hideModal = (el) => {
    el.style.display = 'none';
    el.classList.remove('show');
  };

  container.querySelector('#closeWithdrawalModalBtn')?.addEventListener('click', () => hideModal(withdrawalModalEl));
  container.querySelector('#cancelWithdrawalBtn')?.addEventListener('click', () => hideModal(withdrawalModalEl));

  container.querySelector('#withdrawalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number(container.querySelector('#withdrawalAmount').value);
    const reason = container.querySelector('#withdrawalReason').value;

    const res = await api.recordCashWithdrawal(amount, reason);
    if (res.error) showToast(res.error, 'error');
    else {
      hideModal(withdrawalModalEl);
      container.querySelector('#withdrawalForm').reset();
      showToast('✅ Cash payout recorded successfully!', 'success');
      await loadShiftData();
    }
  });

  container.querySelector('#closeShiftModalBtn')?.addEventListener('click', () => hideModal(closeShiftModalEl));
  container.querySelector('#cancelCloseShiftBtn')?.addEventListener('click', () => hideModal(closeShiftModalEl));

  container.querySelector('#closeShiftForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const closing_cash = Number(container.querySelector('#enteredClosingCash').value);
    const notes = container.querySelector('#closeShiftNotes').value;

    const res = await api.closeShift(closing_cash, notes);
    if (res.error) showToast(res.error, 'error');
    else {
      hideModal(closeShiftModalEl);
      showToast('🏁 Shift closed & audited successfully!', 'success');
      await loadShiftData();
    }
  });

  await loadShiftData();
}
