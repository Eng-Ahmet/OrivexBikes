import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export async function renderShiftsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>💵 Daily Shift & Cash Drawer Audit</h2>
        <p class="page-desc">Manage daily shift opening, cash withdrawals, expenses, & cash discrepancy audit log</p>
      </div>
      <div id="shiftActionHeader"></div>
    </div>

    <!-- Active Shift Summary Banner -->
    <div id="activeShiftCard" class="glass-panel" style="padding: 1.75rem; margin-bottom: 2rem;"></div>

    <!-- Daily Shift History Audit Log Table -->
    <div class="glass-panel" style="padding: 1.5rem;">
      <h3 style="margin-bottom: 1rem; color: var(--accent-cyan);">📜 Daily Shift Audit History (سجل الشفتات والفرق النقدي)</h3>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Employee</th>
              <th>Opening Cash</th>
              <th>Cash Rentals</th>
              <th>Withdrawals / Expenses</th>
              <th>Expected Cash</th>
              <th>Closing Cash</th>
              <th>Discrepancy (الفرق)</th>
              <th>Notes / Explanation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="shiftHistoryTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Record Cash Withdrawal / Expense -->
    <div id="withdrawalModal" class="modal-overlay hidden">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <h3>💸 Record Cash Withdrawal / Expense (سحب نقدي / مصاريف)</h3>
          <button class="close-modal" id="closeWithdrawalModalBtn">&times;</button>
        </div>
        <form id="withdrawalForm" class="modal-form">
          <div class="form-group">
            <label>Cash Amount (€) *</label>
            <input type="number" id="withdrawalAmount" step="0.5" min="1" placeholder="e.g. 20.00" required />
          </div>
          <div class="form-group">
            <label>Reason / Explanation (Mandatory) *</label>
            <textarea id="withdrawalReason" rows="3" placeholder="e.g. Employee advance / Petty cash for store cleaning..." required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelWithdrawalBtn">Cancel</button>
            <button type="submit" class="btn btn-warning">Record Cash Payout</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Close Shift Audit -->
    <div id="closeShiftModal" class="modal-overlay hidden">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <h3>🔒 Close Shift & Audit Cash Drawer</h3>
          <button class="close-modal" id="closeShiftModalBtn">&times;</button>
        </div>
        <form id="closeShiftForm" class="modal-form">
          <div class="summary-box">
            <div class="summary-line"><span>Opening Float Cash:</span><strong id="auditOpening">€0.00</strong></div>
            <div class="summary-line"><span>(+) Cash Rentals Collected:</span><strong id="auditCashRentals" style="color: var(--accent-emerald);">+€0.00</strong></div>
            <div class="summary-line"><span>(-) Cash Withdrawals / Expenses:</span><strong id="auditWithdrawals" style="color: var(--accent-rose);">-€0.00</strong></div>
            <div class="summary-line total-line"><span>Expected Cash in Drawer:</span><strong id="auditExpected">€0.00</strong></div>
          </div>

          <div class="form-group">
            <label>Actual Cash Counted in Drawer (€) *</label>
            <input type="number" id="enteredClosingCash" step="0.5" placeholder="e.g. 165.00" required />
          </div>

          <div class="summary-box" id="discrepancyBox" style="display: none;">
            <div class="summary-line">
              <span>Cash Discrepancy (الفرق النقدي):</span>
              <strong id="auditDiscrepancy">€0.00</strong>
            </div>
          </div>

          <div class="form-group">
            <label>Shift Closing Notes & Explanation *</label>
            <textarea id="closeShiftNotes" rows="2" placeholder="e.g. Cash drawer counted cleanly / 5€ shortage explained by..." required></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelCloseShiftBtn">Cancel</button>
            <button type="submit" class="btn btn-danger">Confirm & Close Shift</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const activeCard = container.querySelector('#activeShiftCard');
  const actionHeader = container.querySelector('#shiftActionHeader');
  const historyTable = container.querySelector('#shiftHistoryTableBody');

  const withdrawalModal = container.querySelector('#withdrawalModal');
  const closeShiftModal = container.querySelector('#closeShiftModal');

  async function loadShiftData() {
    const shift = await api.getCurrentShift();
    const history = await api.getShiftHistory();

    actionHeader.innerHTML = '';
    
    if (!shift) {
      activeCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="color: var(--accent-amber);">⚠️ No Active Shift Open for Málaga Store</h3>
            <p style="color: var(--text-muted); margin-top: 4px;">Open a daily shift to start processing cash rentals and mid-shift withdrawals.</p>
          </div>
          <button id="btnOpenShift" class="btn btn-success btn-glow">
            🚀 Open Daily Shift
          </button>
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
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="status-badge status-AVAILABLE">🟢 SHIFT ACTIVE</span>
              <span style="font-weight: 700; font-size: 1.1rem; color: #FFFFFF;">Operator: ${shift.employee_name}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
              Opened at: ${new Date(shift.start_time).toLocaleString()}
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btnRecordWithdrawal" class="btn btn-warning">
              💸 Record Cash Payout / Expense
            </button>
            <button id="btnCloseShiftModalTrigger" class="btn btn-danger">
              🔒 Close Shift & Audit Cash
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <div style="background: rgba(15, 23, 42, 0.7); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-blue);">
            <div style="font-size: 0.8rem; color: var(--text-dim);">Starting Float Cash</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #FFFFFF;">€${opening.toFixed(2)}</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-emerald);">
            <div style="font-size: 0.8rem; color: var(--text-dim);">(+) Cash Rentals</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald);">+€${rentals.toFixed(2)}</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-rose);">
            <div style="font-size: 0.8rem; color: var(--text-dim);">(-) Cash Withdrawals / Expenses</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-rose);">-€${withdrawals.toFixed(2)}</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan);">
            <div style="font-size: 0.8rem; color: var(--text-dim);">Expected Drawer Cash</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-cyan);">€${expected.toFixed(2)}</div>
          </div>
        </div>

        ${shift.cash_movements && shift.cash_movements.length > 0 ? `
          <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <h4 style="font-size: 0.9rem; color: var(--accent-amber); margin-bottom: 0.5rem;">💸 Cash Payouts Recorded During Shift:</h4>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${shift.cash_movements.map(m => `
                <div style="font-size: 0.85rem; color: var(--text-muted); background: rgba(30,41,59,0.5); padding: 6px 12px; border-radius: 6px; display: flex; justify-content: space-between;">
                  <span><strong>€${m.amount.toFixed(2)}</strong> - ${m.reason} <small>(${m.performed_by})</small></span>
                  <span>${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;

      container.querySelector('#btnRecordWithdrawal')?.addEventListener('click', () => {
        withdrawalModal.classList.remove('hidden');
      });

      container.querySelector('#btnCloseShiftModalTrigger')?.addEventListener('click', () => {
        container.querySelector('#auditOpening').textContent = `€${opening.toFixed(2)}`;
        container.querySelector('#auditCashRentals').textContent = `+€${rentals.toFixed(2)}`;
        container.querySelector('#auditWithdrawals').textContent = `-€${withdrawals.toFixed(2)}`;
        container.querySelector('#auditExpected').textContent = `€${expected.toFixed(2)}`;
        container.querySelector('#enteredClosingCash').value = expected.toFixed(2);
        closeShiftModal.classList.remove('hidden');
      });
    }

    // Load History Table
    historyTable.innerHTML = '';
    if (!history || history.length === 0) {
      historyTable.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No historical shift records found.</td></tr>`;
      return;
    }

    history.forEach(s => {
      const tr = document.createElement('tr');
      const disc = s.discrepancy || 0;
      let discHtml = `<span style="color: var(--accent-emerald); font-weight: 700;">€0.00</span>`;
      if (disc > 0) discHtml = `<span style="color: var(--accent-cyan); font-weight: 700;">+€${disc.toFixed(2)} (Over)</span>`;
      if (disc < 0) discHtml = `<span style="color: var(--accent-rose); font-weight: 700;">-€${Math.abs(disc).toFixed(2)} (Short)</span>`;

      tr.innerHTML = `
        <td>${new Date(s.start_time).toLocaleDateString()} ${new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td><strong>${s.employee_name}</strong></td>
        <td>€${(s.opening_cash || 0).toFixed(2)}</td>
        <td style="color: var(--accent-emerald);">+€${(s.total_cash_rentals || 0).toFixed(2)}</td>
        <td style="color: var(--accent-rose);">-€${(s.total_withdrawals || 0).toFixed(2)}</td>
        <td>€${(s.expected_cash || 0).toFixed(2)}</td>
        <td><strong>€${(s.closing_cash || 0).toFixed(2)}</strong></td>
        <td>${discHtml}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 200px;">${s.notes || '-'}</td>
        <td><span class="status-badge status-${s.status === 'OPEN' ? 'AVAILABLE' : 'RENTED'}">${s.status}</span></td>
      `;
      historyTable.appendChild(tr);
    });
  }

  // Event Listeners for Modals
  container.querySelector('#closeWithdrawalModalBtn')?.addEventListener('click', () => withdrawalModal.classList.add('hidden'));
  container.querySelector('#cancelWithdrawalBtn')?.addEventListener('click', () => withdrawalModal.classList.add('hidden'));

  container.querySelector('#withdrawalForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number(container.querySelector('#withdrawalAmount').value);
    const reason = container.querySelector('#withdrawalReason').value;

    const res = await api.recordCashWithdrawal(amount, reason);
    if (res.error) showToast(res.error, 'error');
    else {
      withdrawalModal.classList.add('hidden');
      container.querySelector('#withdrawalForm').reset();
      showToast('✅ Cash payout recorded successfully!', 'success');
      await loadShiftData();
    }
  });

  container.querySelector('#closeShiftModalBtn')?.addEventListener('click', () => closeShiftModal.classList.add('hidden'));
  container.querySelector('#cancelCloseShiftBtn')?.addEventListener('click', () => closeShiftModal.classList.add('hidden'));

  container.querySelector('#closeShiftForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const closing_cash = Number(container.querySelector('#enteredClosingCash').value);
    const notes = container.querySelector('#closeShiftNotes').value;

    const res = await api.closeShift(closing_cash, notes);
    if (res.error) showToast(res.error, 'error');
    else {
      closeShiftModal.classList.add('hidden');
      showToast('🏁 Shift closed & audited successfully!', 'success');
      await loadShiftData();
    }
  });

  await loadShiftData();
}
