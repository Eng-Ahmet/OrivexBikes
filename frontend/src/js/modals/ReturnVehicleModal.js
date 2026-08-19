import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderReturnVehicleModal(container) {
  container.innerHTML = `
    <div id="returnModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-success">🏁 Return Vehicle & Release Deposit</h5>
            <button type="button" class="btn-close btn-close-white" id="closeReturnModalBtn"></button>
          </div>
          <form id="returnVehicleForm">
            <div class="modal-body">
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary mb-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Contract Number:</span><strong id="returnContractNum" class="text-info">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Customer Name:</span><strong id="returnCustName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Vehicle:</span><strong id="returnVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Original Deposit Held:</span><strong id="returnDepositCollected" class="text-warning fs-6">€0.00</strong></div>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Extra Damage / Late Charges (€)</label>
                <input type="number" id="extraCharges" class="form-control bg-dark text-light border-secondary" step="0.5" min="0" value="0.00" />
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Refundable Deposit Amount to Return (€) *</label>
                <input type="number" id="depositRefunded" class="form-control bg-dark text-light border-secondary" step="0.5" min="0" required />
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelReturnModalBtn">Cancel</button>
              <button type="submit" class="btn btn-success btn-sm fw-bold">Complete Return & Release</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = container.querySelector('#returnModal');
  const form = container.querySelector('#returnVehicleForm');
  let activeContract = null;

  const hideModal = () => {
    modalEl.style.display = 'none';
    modalEl.classList.remove('show');
  };

  container.querySelector('#closeReturnModalBtn').addEventListener('click', hideModal);
  container.querySelector('#cancelReturnModalBtn').addEventListener('click', hideModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeContract) return;

    const data = {
      extra_charges: Number(container.querySelector('#extraCharges').value || 0),
      deposit_refunded: Number(container.querySelector('#depositRefunded').value)
    };

    const res = await api.returnVehicle(activeContract.id, data);
    if (res.error) showToast(res.error, 'error');
    else {
      hideModal();
      showToast(`🏁 Vehicle returned for contract ${activeContract.contract_number}!`, 'success');
      window.dispatchEvent(new CustomEvent('app:refresh'));
    }
  });

  window.addEventListener('app:openReturnModal', async (e) => {
    const contractId = e.detail?.contractId;
    const contracts = await api.getRentals('ACTIVE');
    activeContract = contracts.find(c => c.id === contractId);

    if (!activeContract) {
      showToast('Active rental contract not found.', 'warning');
      return;
    }

    container.querySelector('#returnContractNum').textContent = activeContract.contract_number;
    container.querySelector('#returnCustName').textContent = activeContract.customer_name;
    container.querySelector('#returnVehicleName').textContent = activeContract.vehicle_name;
    container.querySelector('#returnDepositCollected').textContent = `€${activeContract.deposit_collected.toFixed(2)}`;
    container.querySelector('#depositRefunded').value = activeContract.deposit_collected.toFixed(2);

    modalEl.style.display = 'block';
    modalEl.classList.add('show');
  });
}
