import { api } from '../api.js';

export function renderNewContractModal(container) {
  container.innerHTML = `
    <div id="contractModal" class="modal-overlay hidden">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <h3>✨ Create New Rental Contract</h3>
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
              <label>Rental Duration (Hours) *</label>
              <input type="number" id="rentalHours" min="1" max="72" value="2" required />
            </div>
            <div class="form-group">
              <label>Payment Method *</label>
              <select id="paymentMethod" class="styled-select">
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-line">
              <span>Rental Fee:</span>
              <strong id="calcRentalFee">€16.00</strong>
            </div>
            <div class="summary-line">
              <span>Refundable Deposit:</span>
              <strong id="calcDeposit">€50.00</strong>
            </div>
            <div class="summary-line total-line">
              <span>Total Payable Now:</span>
              <strong id="calcTotal">€66.00</strong>
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
  const hoursInput = container.querySelector('#rentalHours');

  let vehiclesList = [];

  function updateCalc() {
    const vId = Number(vehicleSelect.value);
    const h = Number(hoursInput.value) || 1;
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    const fee = v.hourly_rate * h;
    const dep = v.deposit_amount;
    container.querySelector('#calcRentalFee').textContent = `€${fee.toFixed(2)}`;
    container.querySelector('#calcDeposit').textContent = `€${dep.toFixed(2)}`;
    container.querySelector('#calcTotal').textContent = `€${(fee + dep).toFixed(2)}`;
  }

  vehicleSelect.addEventListener('change', updateCalc);
  hoursInput.addEventListener('input', updateCalc);

  container.querySelector('#closeContractModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
  container.querySelector('#cancelContractModalBtn').addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      customer_name: container.querySelector('#custName').value,
      customer_passport: container.querySelector('#custPassport').value,
      customer_phone: container.querySelector('#custPhone').value,
      vehicle_id: Number(vehicleSelect.value),
      duration_hours: Number(hoursInput.value),
      payment_method: container.querySelector('#paymentMethod').value
    };

    const res = await api.createRental(data);
    if (res.error) alert(res.error);
    else {
      modal.classList.add('hidden');
      form.reset();
      alert(`✅ Contract ${res.contract_number} issued!`);
      window.dispatchEvent(new CustomEvent('app:refresh'));
    }
  });

  window.addEventListener('app:openNewContractModal', async (e) => {
    const preselectedId = e.detail?.vehicleId;
    vehiclesList = await api.getVehicles('ALL', 'AVAILABLE');

    vehicleSelect.innerHTML = '';
    if (!vehiclesList || vehiclesList.length === 0) {
      alert('No vehicles currently available for rental.');
      return;
    }

    vehiclesList.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (€${v.hourly_rate}/h • Deposit €${v.deposit_amount})`;
      if (preselectedId && v.id === preselectedId) opt.selected = true;
      vehicleSelect.appendChild(opt);
    });

    updateCalc();
    modal.classList.remove('hidden');
  });
}
