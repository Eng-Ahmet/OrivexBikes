import { api } from '../api.js';

export function renderReturnVehicleModal(container) {
  container.innerHTML = `
    <div id="returnModal" class="modal-overlay hidden">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <h3>🏁 Return Vehicle & Release Deposit</h3>
          <button class="close-modal" id="closeReturnModalBtn">&times;</button>
        </div>
        <form id="returnVehicleForm" class="modal-form">
          <input type="hidden" id="returnContractId" />

          <div class="summary-box">
            <div class="summary-line">
              <span>Contract Number:</span>
              <strong id="returnContractNum">-</strong>
            </div>
            <div class="summary-line">
              <span>Customer:</span>
              <strong id="returnCustName">-</strong>
            </div>
            <div class="summary-line">
              <span>Vehicle:</span>
              <strong id="returnVehicleName">-</strong>
            </div>
            <div class="summary-line">
              <span>Deposit Collected:</span>
              <strong id="returnDepositCollected">€0.00</strong>
            </div>
          </div>

          <div class="form-group">
            <label>Extra Charges (€)</label>
            <input type="number" id="returnExtraCharges" min="0" step="0.5" value="0" />
          </div>

          <div class="form-group">
            <label>Refundable Deposit Amount to Return (€)</label>
            <input type="number" id="returnDepositRefund" min="0" step="0.5" value="0" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelReturnModalBtn">Cancel</button>
            <button type="submit" class="btn btn-success btn-glow">Process Return & Release Deposit</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modal = container.querySelector('#returnModal');
  const form = container.querySelector('#returnVehicleForm');

  container.querySelector('#closeReturnModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
  container.querySelector('#cancelReturnModalBtn').addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number(container.querySelector('#returnContractId').value);
    const data = {
      extra_charges: Number(container.querySelector('#returnExtraCharges').value),
      deposit_refunded: Number(container.querySelector('#returnDepositRefund').value)
    };

    const res = await api.returnVehicle(id, data);
    if (res.error) alert(res.error);
    else {
      modal.classList.add('hidden');
      alert('✅ Vehicle returned and deposit released successfully!');
      window.dispatchEvent(new CustomEvent('app:refresh'));
    }
  });

  window.addEventListener('app:openReturnModal', async (e) => {
    const contractId = e.detail?.contractId;
    const contracts = await api.getRentals();
    const c = contracts.find(item => item.id === contractId);
    if (!c) return;

    container.querySelector('#returnContractId').value = c.id;
    container.querySelector('#returnContractNum').textContent = c.contract_number;
    container.querySelector('#returnCustName').textContent = c.customer_name;
    container.querySelector('#returnVehicleName').textContent = c.vehicle_name;
    container.querySelector('#returnDepositCollected').textContent = `€${c.deposit_collected.toFixed(2)}`;

    container.querySelector('#returnExtraCharges').value = 0;
    container.querySelector('#returnDepositRefund').value = c.deposit_collected;

    modal.classList.remove('hidden');
  });
}
