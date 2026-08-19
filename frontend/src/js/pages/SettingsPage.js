import { api, state } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export async function renderSettingsPage(container) {
  const settings = await api.getSettings();
  const historicalLogs = await api.getHistoricalEntries();

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-sliders text-info me-2"></i> ${t('settings_tab')}</h2>
        <p class="text-secondary small mb-0">System configuration, initial cash drawer float, and historical balance adjustments.</p>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- Initial Cash Drawer Float Setup -->
      <div class="col-md-6">
        <div class="card-glass p-4 h-100 shadow-sm">
          <h5 class="fw-bold text-info fs-6 mb-3"><i class="fa-solid fa-cash-register me-2"></i> Initial Cash Drawer Reserve Setup</h5>
          <form id="formFloatSetup">
            <div class="mb-3">
              <label class="form-label text-secondary small fw-semibold">Default Counter Float (€)</label>
              <input type="number" id="inputInitialFloat" class="form-control bg-dark text-light border-secondary" step="5" value="${settings.initial_cash_float || 150}" required />
              <div class="form-text text-secondary small">Base cash reserve placed in physical register drawer every morning.</div>
            </div>
            <button type="submit" class="btn btn-info btn-sm fw-bold"><i class="fa-solid fa-save me-1"></i> Save Base Float Reserve</button>
          </form>
        </div>
      </div>

      <!-- Register Historical Entry -->
      <div class="col-md-6">
        <div class="card-glass p-4 h-100 shadow-sm">
          <h5 class="fw-bold text-warning fs-6 mb-3"><i class="fa-solid fa-clock-rotate-left me-2"></i> Register Historical Cash Entry</h5>
          <form id="formHistoricalEntry">
            <div class="mb-2">
              <label class="form-label text-secondary small fw-semibold">Historical Amount (€)</label>
              <input type="number" id="histAmount" class="form-control form-control-sm bg-dark text-light border-secondary" step="0.5" required placeholder="e.g. 150.00" />
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary small fw-semibold">Reason / Context</label>
              <input type="text" id="histReason" class="form-control form-control-sm bg-dark text-light border-secondary" required placeholder="e.g. Prior Shift Balance Adjustment" />
            </div>
            <button type="submit" class="btn btn-warning btn-sm fw-bold"><i class="fa-solid fa-plus me-1"></i> Record Historical Adjustment</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Historical Entries Audit Trail -->
    <div class="card-glass p-3 shadow-sm">
      <h5 class="fw-bold text-light fs-6 mb-3"><i class="fa-solid fa-list-check me-2"></i> Historical Cash Entries Audit Trail</h5>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Date / Time</th>
              <th scope="col">Registered By</th>
              <th scope="col">Context / Reason</th>
              <th scope="col">Amount (€)</th>
            </tr>
          </thead>
          <tbody>
            ${(!historicalLogs || historicalLogs.length === 0) ? `
              <tr><td colspan="4" class="text-center text-secondary py-4">No historical cash entries recorded.</td></tr>
            ` : historicalLogs.map(log => `
              <tr>
                <td class="font-monospace text-secondary">${new Date(log.created_at).toLocaleString()}</td>
                <td class="fw-bold text-info"><i class="fa-solid fa-user me-1"></i> ${log.user_name || 'Admin'}</td>
                <td class="text-light">${log.reason}</td>
                <td class="fw-bold text-success">€${(log.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const formFloat = container.querySelector('#formFloatSetup');
  formFloat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = Number(container.querySelector('#inputInitialFloat').value);
    const res = await api.updateSettings({ initial_cash_float: val });
    if (res.error) showToast(res.error, 'error');
    else showToast('✅ Initial cash float setting updated!', 'success');
  });

  const formHist = container.querySelector('#formHistoricalEntry');
  formHist.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amt = Number(container.querySelector('#histAmount').value);
    const reason = container.querySelector('#histReason').value;

    const res = await api.addHistoricalEntry(amt, reason);
    if (res.error) showToast(res.error, 'error');
    else {
      showToast('📜 Historical cash entry recorded successfully!', 'success');
      renderSettingsPage(container);
    }
  });
}
