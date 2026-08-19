import { api } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export function renderReturnVehicleModal(container) {
  container.innerHTML = `
    <div id="returnModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-success"><i class="fa-solid fa-flag-checkered me-2"></i> Return Vehicle & Release Deposit</h5>
            <button type="button" class="btn-close btn-close-white" id="closeReturnModalBtn" data-bs-dismiss="modal"></button>
          </div>
          <form id="returnVehicleForm">
            <div class="modal-body">
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary mb-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Contract Number:</span><strong id="returnContractNum" class="text-info">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Customer Name:</span><strong id="returnCustName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Vehicle Rented:</span><strong id="returnVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Original Deposit Collected:</span><strong id="returnOriginalDeposit" class="text-warning fs-6">€0.00</strong></div>
              </div>

              <!-- ITEMIZED EXTRA CHARGES & DAMAGE / INCIDENT ADD-ONS -->
              <div class="bg-dark bg-opacity-50 p-3 rounded border border-secondary mb-3">
                <h6 class="text-light fw-bold mb-2"><i class="fa-solid fa-screwdriver-wrench me-1"></i> Extra Charges, Incidents, & Part Add-ons (رسوم الأضرار والمشتريات الإضافية)</h6>
                <div class="row g-2 mb-2">
                  <div class="col-md-6">
                    <label class="form-label text-secondary small">Charge Reason / Description</label>
                    <select id="extraReasonSelect" class="form-select form-select-sm bg-dark text-light border-secondary">
                      <option value="No Extra Charges">None (No Damage / Clean Return)</option>
                      <option value="Vehicle Damage Repair">Vehicle Damage Repair (صيانة وتصليح ضرر)</option>
                      <option value="Helmet / Accessory Purchase">Helmet / Accessory Purchase (شراء خوذة أو ملحق)</option>
                      <option value="Charger Replacement">Charger Replacement (استبدال شاحن)</option>
                      <option value="Late Return Penalty">Late Return Overdue Fee (غرامة تأخير)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-secondary small">Extra Charge Amount (€)</label>
                    <input type="number" id="extraChargesInput" class="form-control form-control-sm bg-dark text-warning border-secondary" step="0.5" min="0" value="0.00" />
                  </div>
                </div>
              </div>

              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Extra Charges Deducted:</span><strong id="calcDeduction" class="text-danger">-€0.00</strong></div>
                <div class="d-flex justify-content-between text-light fw-bold fs-5 border-top border-secondary pt-2 mt-2"><span>Net Deposit Refundable to Customer:</span><strong id="calcRefundNet" class="text-success">€0.00</strong></div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelReturnModalBtn" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-success btn-sm fw-bold"><i class="fa-solid fa-check me-1"></i> Confirm Vehicle Return & Deposit Release</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = container.querySelector('#returnModal');
  const form = container.querySelector('#returnVehicleForm');
  const extraReasonSelect = container.querySelector('#extraReasonSelect');
  const extraChargesInput = container.querySelector('#extraChargesInput');
  const calcDeductionEl = container.querySelector('#calcDeduction');
  const calcRefundNetEl = container.querySelector('#calcRefundNet');

  let activeContract = null;

  function getBootstrapModalInstance() {
    if (window.bootstrap && window.bootstrap.Modal) {
      return window.bootstrap.Modal.getOrCreateInstance(modalEl);
    }
    return null;
  }

  function updateReturnCalc() {
    if (!activeContract) return;
    const origDep = activeContract.deposit_collected || 0;
    const extraVal = Number(extraChargesInput.value || 0);
    const netRefund = Math.max(0, origDep - extraVal);

    calcDeductionEl.textContent = `-€${extraVal.toFixed(2)}`;
    calcRefundNetEl.textContent = `€${netRefund.toFixed(2)}`;
  }

  extraReasonSelect.addEventListener('change', () => {
    const val = extraReasonSelect.value;
    if (val.includes('Damage')) extraChargesInput.value = '25.00';
    else if (val.includes('Helmet')) extraChargesInput.value = '15.00';
    else if (val.includes('Charger')) extraChargesInput.value = '35.00';
    else if (val.includes('Late')) extraChargesInput.value = '15.00';
    else extraChargesInput.value = '0.00';
    updateReturnCalc();
  });

  extraChargesInput.addEventListener('input', updateReturnCalc);

  const hideModal = () => {
    const bsModal = getBootstrapModalInstance();
    if (bsModal) bsModal.hide();
    else {
      modalEl.style.display = 'none';
      modalEl.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  };

  container.querySelector('#closeReturnModalBtn').addEventListener('click', hideModal);
  container.querySelector('#cancelReturnModalBtn').addEventListener('click', hideModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeContract) return;

    const extraVal = Number(extraChargesInput.value || 0);
    const origDep = activeContract.deposit_collected || 0;
    const netRefund = Math.max(0, origDep - extraVal);

    const data = {
      extra_charges: extraVal,
      deposit_refunded: netRefund
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
      showToast('Active contract not found.', 'warning');
      return;
    }

    container.querySelector('#returnContractNum').textContent = activeContract.contract_number;
    container.querySelector('#returnCustName').textContent = activeContract.customer_name;
    container.querySelector('#returnVehicleName').textContent = activeContract.vehicle_name;
    container.querySelector('#returnOriginalDeposit').textContent = `€${(activeContract.deposit_collected || 0).toFixed(2)}`;

    extraChargesInput.value = '0.00';
    extraReasonSelect.value = 'No Extra Charges';
    updateReturnCalc();

    const bsModal = getBootstrapModalInstance();
    if (bsModal) bsModal.show();
    else {
      modalEl.style.display = 'block';
      modalEl.classList.add('show');
      document.body.classList.add('modal-open');
    }
  });
}
