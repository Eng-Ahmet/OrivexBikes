import { api } from '../api.js';

export async function renderShiftsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Counter Shift & Cash Drawer</h2>
        <p class="page-desc">Daily opening/closing cash count and shift reconciliation</p>
      </div>
    </div>

    <div class="shift-grid">
      <div class="card glass-panel shift-card">
        <div class="card-header">
          <h3>Current Shift Status</h3>
          <span id="shiftBadgeLarge" class="badge">OPEN</span>
        </div>
        <div class="card-body">
          <div class="metric-row">
            <div class="metric">
              <span class="metric-label">Employee</span>
              <span id="shiftEmployeeName" class="metric-value">-</span>
            </div>
            <div class="metric">
              <span class="metric-label">Started At</span>
              <span id="shiftStartTime" class="metric-value">-</span>
            </div>
          </div>

          <div class="metric-row">
            <div class="metric">
              <span class="metric-label">Opening Cash</span>
              <span id="shiftOpeningCash" class="metric-value">€0.00</span>
            </div>
            <div class="metric">
              <span class="metric-label">Expected Cash in Drawer</span>
              <span id="shiftExpectedCash" class="metric-value text-accent">€0.00</span>
            </div>
          </div>

          <div class="shift-actions">
            <button id="btnOpenShift" class="btn btn-secondary">Open New Shift</button>
            <button id="btnCloseShift" class="btn btn-danger">Close Shift & Count Cash</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const shiftBadgeLarge = container.querySelector('#shiftBadgeLarge');
  const shiftEmployeeName = container.querySelector('#shiftEmployeeName');
  const shiftStartTime = container.querySelector('#shiftStartTime');
  const shiftOpeningCash = container.querySelector('#shiftOpeningCash');
  const shiftExpectedCash = container.querySelector('#shiftExpectedCash');
  const btnOpenShift = container.querySelector('#btnOpenShift');
  const btnCloseShift = container.querySelector('#btnCloseShift');

  async function loadShift() {
    const shift = await api.getCurrentShift();
    if (shift) {
      shiftBadgeLarge.className = 'badge badge-success';
      shiftBadgeLarge.textContent = 'OPEN';
      shiftEmployeeName.textContent = shift.employee_name;
      shiftStartTime.textContent = new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      shiftOpeningCash.textContent = `€${shift.opening_cash.toFixed(2)}`;

      const rep = await api.getDashboardReport();
      const expected = shift.opening_cash + (rep.cashSales || 0);
      shiftExpectedCash.textContent = `€${expected.toFixed(2)}`;

      btnOpenShift.disabled = true;
      btnCloseShift.disabled = false;
    } else {
      shiftBadgeLarge.className = 'badge badge-rose';
      shiftBadgeLarge.textContent = 'CLOSED';
      shiftEmployeeName.textContent = '-';
      shiftStartTime.textContent = '-';
      shiftOpeningCash.textContent = '€0.00';
      shiftExpectedCash.textContent = '€0.00';

      btnOpenShift.disabled = false;
      btnCloseShift.disabled = true;
    }
  }

  btnOpenShift.addEventListener('click', async () => {
    const amount = prompt('Enter Opening Cash Drawer Balance (€):', '150');
    if (amount === null) return;
    const res = await api.openShift(Number(amount));
    if (res.error) alert(res.error);
    else alert('Shift opened successfully!');
    await loadShift();
  });

  btnCloseShift.addEventListener('click', async () => {
    const amount = prompt('Enter Final Counted Cash Drawer Balance (€):');
    if (amount === null) return;
    const res = await api.closeShift(Number(amount));
    if (res.error) alert(res.error);
    else alert(`Shift closed successfully! Discrepancy: €${res.shift.discrepancy.toFixed(2)}`);
    await loadShift();
  });

  await loadShift();
}
