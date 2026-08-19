import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderNewContractModal(container) {
  container.innerHTML = `
    <div id="contractModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info">✨ Create Official Rental Contract</h5>
            <button type="button" class="btn-close btn-close-white" id="closeContractModalBtn"></button>
          </div>
          <form id="newContractForm">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Customer Full Name *</label>
                  <input type="text" id="custName" class="form-control bg-dark text-light border-secondary" placeholder="e.g. John Doe" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Passport / DNI / ID *</label>
                  <input type="text" id="custPassport" class="form-control bg-dark text-light border-secondary" placeholder="e.g. X1234567A" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Customer Phone Number *</label>
                  <input type="tel" id="custPhone" class="form-control bg-dark text-light border-secondary" placeholder="e.g. +34 612 345 678" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Select Available Vehicle *</label>
                  <select id="contractVehicleSelect" class="form-select bg-dark text-light border-secondary" required></select>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Rental Tariff Duration *</label>
                  <select id="tariffSelect" class="form-select bg-dark text-light border-secondary" required>
                    <option value="20m">20 Minutos</option>
                    <option value="30m">30 Minutos</option>
                    <option value="1h" selected>1 Hora</option>
                    <option value="2h">2 Horas</option>
                    <option value="5h">5 Horas</option>
                    <option value="1d">1 Día (24h)</option>
                    <option value="3d">3+ Días</option>
                    <option value="1w">1 Semana</option>
                    <option value="2w">2 Semanas</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold">Payment Method *</label>
                  <select id="paymentMethod" class="form-select bg-dark text-light border-secondary">
                    <option value="CARD">Credit / Debit Card (VISA)</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary my-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Selected Vehicle:</span><strong id="calcVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Rental Fee:</span><strong id="calcRentalFee" class="text-light">€15.00</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Refundable Deposit:</span><strong id="calcDeposit" class="text-warning">€50.00</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Total Payable Now:</span><strong id="calcTotal" class="text-info fs-5">€65.00</strong></div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelContractModalBtn">Cancel</button>
              <button type="submit" class="btn btn-info btn-sm fw-bold">Confirm & Issue Contract</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = container.querySelector('#contractModal');
  const form = container.querySelector('#newContractForm');
  const vehicleSelect = container.querySelector('#contractVehicleSelect');
  const tariffSelect = container.querySelector('#tariffSelect');

  let vehiclesList = [];

  function updateCalc() {
    const vId = Number(vehicleSelect.value);
    const tariff = tariffSelect.value;
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    let fee = v.rate_1h || 15;
    if (tariff === '20m') fee = v.rate_20m || v.rate_1h || 15;
    else if (tariff === '30m') fee = v.rate_30m || v.rate_1h || 15;
    else if (tariff === '1h') fee = v.rate_1h || 15;
    else if (tariff === '2h') fee = v.rate_2h || ((v.rate_1h || 15) * 2);
    else if (tariff === '5h') fee = v.rate_5h || ((v.rate_1h || 15) * 3.5);
    else if (tariff === '1d') fee = v.rate_1d || 40;
    else if (tariff === '3d') fee = (v.rate_3d || ((v.rate_1d || 40) * 0.8)) * 3;
    else if (tariff === '1w') fee = (v.rate_1w || ((v.rate_1d || 40) * 0.6)) * 7;
    else if (tariff === '2w') fee = (v.rate_2w || ((v.rate_1d || 40) * 0.5)) * 14;

    const dep = v.deposit_amount || 30;
    container.querySelector('#calcVehicleName').textContent = v.name;
    container.querySelector('#calcRentalFee').textContent = `€${fee.toFixed(2)}`;
    container.querySelector('#calcDeposit').textContent = `€${dep.toFixed(2)}`;
    container.querySelector('#calcTotal').textContent = `€${(fee + dep).toFixed(2)}`;
  }

  vehicleSelect.addEventListener('change', updateCalc);
  tariffSelect.addEventListener('change', updateCalc);

  const hideModal = () => {
    modalEl.style.display = 'none';
    modalEl.classList.remove('show');
  };

  container.querySelector('#closeContractModalBtn').addEventListener('click', hideModal);
  container.querySelector('#cancelContractModalBtn').addEventListener('click', hideModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      customer_name: container.querySelector('#custName').value,
      customer_passport: container.querySelector('#custPassport').value,
      customer_phone: container.querySelector('#custPhone').value,
      vehicle_id: Number(vehicleSelect.value),
      duration_hours: tariffSelect.value.includes('d') ? 24 : tariffSelect.value.includes('w') ? 168 : 2,
      payment_method: container.querySelector('#paymentMethod').value
    };

    const res = await api.createRental(data);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      hideModal();
      form.reset();
      showToast(`✅ Contract ${res.contract_number} issued!`, 'success');
      window.dispatchEvent(new CustomEvent('app:refresh'));
    }
  });

  window.addEventListener('app:openNewContractModal', async (e) => {
    const preselectedId = e.detail?.vehicleId;
    vehiclesList = await api.getVehicles('ALL', 'AVAILABLE');

    vehicleSelect.innerHTML = '';
    if (!vehiclesList || vehiclesList.length === 0) {
      showToast('No vehicles currently available for rental.', 'warning');
      return;
    }

    vehiclesList.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.category} • Depósito €${v.deposit_amount || 30})`;
      if (preselectedId && v.id === preselectedId) opt.selected = true;
      vehicleSelect.appendChild(opt);
    });

    updateCalc();
    modalEl.style.display = 'block';
    modalEl.classList.add('show');
  });
}
