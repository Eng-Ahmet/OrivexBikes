import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderNewContractModal(container) {
  container.innerHTML = `
    <div id="contractModal" class="modal-overlay hidden">
      <div class="modal-content glass-panel" style="max-width: 580px;">
        <div class="modal-header">
          <h3>✨ Create Official Rental Contract</h3>
          <button class="close-modal" id="closeContractModalBtn">&times;</button>
        </div>
        <form id="newContractForm" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Customer Full Name *</label>
              <input type="text" id="custName" placeholder="e.g. John Doe" required />
            </div>
            <div class="form-group">
              <label>Passport / DNI / ID *</label>
              <input type="text" id="custPassport" placeholder="e.g. X1234567A" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Customer Phone Number *</label>
              <input type="tel" id="custPhone" placeholder="e.g. +34 612 345 678" required />
            </div>
            <div class="form-group">
              <label>Select Available Vehicle *</label>
              <select id="contractVehicleSelect" class="styled-select" required></select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Rental Tariff Duration *</label>
              <select id="tariffSelect" class="styled-select" required>
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
            <div class="form-group">
              <label>Payment Method *</label>
              <select id="paymentMethod" class="styled-select">
                <option value="CARD">Credit / Debit Card (VISA)</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-line">
              <span>Selected Vehicle:</span>
              <strong id="calcVehicleName">-</strong>
            </div>
            <div class="summary-line">
              <span>Rental Fee:</span>
              <strong id="calcRentalFee">€15.00</strong>
            </div>
            <div class="summary-line">
              <span>Refundable Deposit:</span>
              <strong id="calcDeposit">€50.00</strong>
            </div>
            <div class="summary-line total-line">
              <span>Total Payable Now:</span>
              <strong id="calcTotal">€65.00</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelContractModalBtn">Cancel</button>
            <button type="submit" class="btn btn-primary btn-glow">Confirm & Issue Contract</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modal = container.querySelector('#contractModal');
  const form = container.querySelector('#newContractForm');
  const vehicleSelect = container.querySelector('#contractVehicleSelect');
  const tariffSelect = container.querySelector('#tariffSelect');

  let vehiclesList = [];

  function updateCalc() {
    const vId = Number(vehicleSelect.value);
    const tariff = tariffSelect.value;
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    let fee = v.rate_1h;
    if (tariff === '20m') fee = v.rate_20m || v.rate_1h;
    else if (tariff === '30m') fee = v.rate_30m || v.rate_1h;
    else if (tariff === '1h') fee = v.rate_1h;
    else if (tariff === '2h') fee = v.rate_2h || (v.rate_1h * 2);
    else if (tariff === '5h') fee = v.rate_5h || (v.rate_1h * 3.5);
    else if (tariff === '1d') fee = v.rate_1d;
    else if (tariff === '3d') fee = (v.rate_3d || (v.rate_1d * 0.8)) * 3;
    else if (tariff === '1w') fee = (v.rate_1w || (v.rate_1d * 0.6)) * 7;
    else if (tariff === '2w') fee = (v.rate_2w || (v.rate_1d * 0.5)) * 14;

    const dep = v.deposit_amount;
    container.querySelector('#calcVehicleName').textContent = v.name;
    container.querySelector('#calcRentalFee').textContent = `€${fee.toFixed(2)}`;
    container.querySelector('#calcDeposit').textContent = `€${dep.toFixed(2)}`;
    container.querySelector('#calcTotal').textContent = `€${(fee + dep).toFixed(2)}`;
  }

  vehicleSelect.addEventListener('change', updateCalc);
  tariffSelect.addEventListener('change', updateCalc);

  container.querySelector('#closeContractModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
  container.querySelector('#cancelContractModalBtn').addEventListener('click', () => modal.classList.add('hidden'));

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
      modal.classList.add('hidden');
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
      opt.textContent = `${v.name} (${v.category} • Depósito €${v.deposit_amount})`;
      if (preselectedId && v.id === preselectedId) opt.selected = true;
      vehicleSelect.appendChild(opt);
    });

    updateCalc();
    modal.classList.remove('hidden');
  });
}
