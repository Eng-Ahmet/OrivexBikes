import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderExtendContractModal(container) {
  container.innerHTML = `
    <div id="extendModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info">🔄 Extend Rental Contract Duration</h5>
            <button type="button" class="btn-close btn-close-white" id="closeExtendModalBtn"></button>
          </div>
          <form id="extendContractForm">
            <div class="modal-body">
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary mb-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Contract Number:</span><strong id="extendContractNum" class="text-info">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Customer Name:</span><strong id="extendCustName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Vehicle:</span><strong id="extendVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Current Total Fee:</span><strong id="extendCurrentFee" class="text-light fs-6">€0.00</strong></div>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Select Additional Extension Duration *</label>
                <select id="extendDurationSelect" class="form-select bg-dark text-light border-secondary" required>
                  <option value="1" data-fee="15" selected>+1 Hora (+€15.00)</option>
                  <option value="2" data-fee="20">+2 Horas (+€20.00)</option>
                  <option value="5" data-fee="25">+5 Horas (+€25.00)</option>
                  <option value="24" data-fee="40">+1 Día (24h) (+€40.00)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small fw-semibold">Additional Fee Amount (€) *</label>
                <input type="number" id="extendFeeInput" class="form-control bg-dark text-light border-secondary" step="0.5" min="0" value="15.00" required />
              </div>

              <div class="bg-dark bg-opacity-50 p-2 rounded border border-secondary text-center">
                <div class="text-secondary small">New Total Contract Rental Fee</div>
                <div id="extendNewTotalFee" class="fs-4 fw-bold text-success">€0.00</div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelExtendModalBtn">Cancel</button>
              <button type="submit" class="btn btn-info btn-sm fw-bold">Confirm & Extend Contract</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = container.querySelector('#extendModal');
  const form = container.querySelector('#extendContractForm');
  const durationSelect = container.querySelector('#extendDurationSelect');
  const feeInput = container.querySelector('#extendFeeInput');
  const newTotalEl = container.querySelector('#extendNewTotalFee');

  let activeContract = null;

  function updateNewTotal() {
    if (!activeContract) return;
    const addFee = Number(feeInput.value || 0);
    const newTotal = (activeContract.rental_fee || 0) + addFee;
    newTotalEl.textContent = `€${newTotal.toFixed(2)}`;
  }

  durationSelect.addEventListener('change', () => {
    const selectedOpt = durationSelect.options[durationSelect.selectedIndex];
    const autoFee = selectedOpt ? Number(selectedOpt.getAttribute('data-fee')) : 15;
    feeInput.value = autoFee.toFixed(2);
    updateNewTotal();
  });

  feeInput.addEventListener('input', updateNewTotal);

  const hideModal = () => {
    modalEl.style.display = 'none';
    modalEl.classList.remove('show');
  };

  container.querySelector('#closeExtendModalBtn').addEventListener('click', hideModal);
  container.querySelector('#cancelExtendModalBtn').addEventListener('click', hideModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeContract) return;

    const data = {
      additional_hours: Number(durationSelect.value),
      additional_fee: Number(feeInput.value)
    };

    const res = await api.extendRental(activeContract.id, data);
    if (res.error) showToast(res.error, 'error');
    else {
      hideModal();
      showToast(`🔄 Contract ${activeContract.contract_number} extended successfully!`, 'success');
      window.dispatchEvent(new CustomEvent('app:refresh'));
    }
  });

  window.addEventListener('app:openExtendModal', async (e) => {
    const contractId = e.detail?.contractId;
    const contracts = await api.getRentals('ACTIVE');
    activeContract = contracts.find(c => c.id === contractId);

    if (!activeContract) {
      showToast('Active rental contract not found.', 'warning');
      return;
    }

    container.querySelector('#extendContractNum').textContent = activeContract.contract_number;
    container.querySelector('#extendCustName').textContent = activeContract.customer_name;
    container.querySelector('#extendVehicleName').textContent = activeContract.vehicle_name;
    container.querySelector('#extendCurrentFee').textContent = `€${activeContract.rental_fee.toFixed(2)}`;

    feeInput.value = '15.00';
    updateNewTotal();

    modalEl.style.display = 'block';
    modalEl.classList.add('show');
  });
}
