import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderNewContractModal(container) {
  container.innerHTML = `
    <div id="contractModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-file-signature me-2"></i> Issue Official Rental Contract</h5>
            <button type="button" class="btn-close btn-close-white" id="closeContractModalBtn"></button>
          </div>
          <form id="newContractForm">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-user me-1"></i> Customer Full Name *</label>
                  <input type="text" id="custName" class="form-control bg-dark text-light border-secondary" placeholder="e.g. John Doe" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-id-card me-1"></i> Passport / DNI / ID *</label>
                  <input type="text" id="custPassport" class="form-control bg-dark text-light border-secondary" placeholder="e.g. X1234567A" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-phone me-1"></i> Customer Phone Number *</label>
                  <input type="tel" id="custPhone" class="form-control bg-dark text-light border-secondary" placeholder="e.g. +34 612 345 678" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-bicycle me-1"></i> Select Available Vehicle *</label>
                  <select id="contractVehicleSelect" class="form-select bg-dark text-light border-secondary" required></select>
                </div>

                <!-- CONDITIONAL BATTERY LEVEL FIELD FOR ELECTRIC VEHICLES ONLY -->
                <div id="batteryFieldCol" class="col-md-6 d-none">
                  <label class="form-label text-warning small fw-semibold"><i class="fa-solid fa-bolt me-1"></i> E-Bike / Scooter Battery Level Check (%) *</label>
                  <div class="input-group">
                    <input type="number" id="custBatteryLevel" class="form-control bg-dark text-warning border-warning" min="1" max="100" value="100" />
                    <span class="input-group-text bg-dark text-warning border-warning">%</span>
                  </div>
                  <div class="form-text text-secondary small">Required for electric scooters & VISA e-bikes.</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-clock me-1"></i> Dynamic Duration Tariff *</label>
                  <select id="tariffSelect" class="form-select bg-dark text-light border-secondary" required></select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-credit-card me-1"></i> Payment Method *</label>
                  <select id="paymentMethod" class="form-select bg-dark text-light border-secondary">
                    <option value="CARD">Credit / Debit Card (VISA)</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Pricing Calculation Card -->
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary my-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Selected Vehicle:</span><strong id="calcVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Category:</span><span id="calcCategoryBadge" class="badge bg-info-subtle text-info">-</span></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Rental Fee:</span><strong id="calcRentalFee" class="text-light">€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Refundable Deposit:</span><strong id="calcDeposit" class="text-warning">€0.00</strong></div>
                <div id="neighborDebtRow" class="d-none d-flex justify-content-between text-secondary mb-1"><span>Neighbor Debt (80% Payout):</span><strong id="calcNeighborDebt" class="text-warning">€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>Total Payable Now:</span><strong id="calcTotal" class="text-info fs-5">€0.00</strong></div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelContractModalBtn">Cancel</button>
              <button type="submit" class="btn btn-info btn-sm fw-bold"><i class="fa-solid fa-check me-1"></i> Issue Contract</button>
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
  const batteryFieldCol = container.querySelector('#batteryFieldCol');
  const batteryInput = container.querySelector('#custBatteryLevel');

  let vehiclesList = [];

  function getTariffOptionsForCategory(cat) {
    const norm = (cat || '').toLowerCase();
    if (norm.includes('xl')) {
      return [
        { code: '20m', label: '20 Minutos (€15)', fee: 15 },
        { code: '30m', label: '30 Minutos (€20)', fee: 20 },
        { code: '1h', label: '1 Hora (€30)', fee: 30 }
      ];
    }
    if (norm.includes('s cars') || norm.includes('quad')) {
      return [
        { code: '20m', label: '20 Minutos (€10)', fee: 10 },
        { code: '30m', label: '30 Minutos (€15)', fee: 15 },
        { code: '1h', label: '1 Hora (€25)', fee: 25 }
      ];
    }
    if (norm.includes('buggy')) {
      return [
        { code: '30m', label: '30 Minutos (€5)', fee: 5 },
        { code: '1h', label: '1 Hora (€25)', fee: 25 }
      ];
    }
    if (norm.includes('bike') && !norm.includes('e-bike')) {
      return [
        { code: '1h', label: '1 Hora (€5)', fee: 5 },
        { code: '5h', label: '5 Horas (€15)', fee: 15 },
        { code: '1d', label: '1 Día (€20)', fee: 20 },
        { code: '3d', label: '+3 Días (15 €/día)', fee: 45 },
        { code: '1w', label: '+1 Semana (10 €/día)', fee: 70 },
        { code: '2w', label: '+2 Semanas (8 €/día)', fee: 112 }
      ];
    }
    if (norm.includes('e-bike')) {
      return [
        { code: '1h', label: '1 Hora (€15)', fee: 15 },
        { code: '2h', label: '2 Horas (€20)', fee: 20 },
        { code: '5h', label: '5 Horas (€25)', fee: 25 },
        { code: '1d', label: '1 Día (€40)', fee: 40 },
        { code: '3d', label: '+3 Días (30 €/día)', fee: 90 },
        { code: '1w', label: '+1 Semana (25 €/día)', fee: 175 },
        { code: '2w', label: '+2 Semanas (20 €/día)', fee: 280 }
      ];
    }
    // Default Scooters
    return [
      { code: '30m', label: '30 Minutos (€10)', fee: 10 },
      { code: '1h', label: '1 Hora (€15)', fee: 15 },
      { code: '2h', label: '2 Horas (€20)', fee: 20 },
      { code: '1d', label: '1 Día (€40)', fee: 40 },
      { code: '3d', label: '+3 Días (30 €/día)', fee: 90 },
      { code: '1w', label: '+1 Semana (25 €/día)', fee: 175 },
      { code: '2w', label: '+2 Semanas (20 €/día)', fee: 280 }
    ];
  }

  function onVehicleChange() {
    const vId = Number(vehicleSelect.value);
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    // CONDITIONAL BATTERY FIELD: Only show for E-Bikes and E-Scooters!
    const isElectric = v.category.includes('E-Bike') || v.category.includes('Scooter');
    if (isElectric) {
      batteryFieldCol.classList.remove('d-none');
      batteryInput.value = v.battery_level || 100;
      batteryInput.required = true;
    } else {
      batteryFieldCol.classList.add('d-none');
      batteryInput.required = false;
    }

    const options = getTariffOptionsForCategory(v.category);
    tariffSelect.innerHTML = '';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.code;
      o.setAttribute('data-fee', opt.fee);
      o.textContent = opt.label;
      tariffSelect.appendChild(o);
    });

    updateCalc();
  }

  function updateCalc() {
    const vId = Number(vehicleSelect.value);
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    const selectedOpt = tariffSelect.options[tariffSelect.selectedIndex];
    const fee = selectedOpt ? Number(selectedOpt.getAttribute('data-fee')) : 15;
    const dep = v.deposit_amount || 30;

    container.querySelector('#calcVehicleName').textContent = v.name;
    container.querySelector('#calcCategoryBadge').textContent = v.category;
    container.querySelector('#calcRentalFee').textContent = `€${fee.toFixed(2)}`;
    container.querySelector('#calcDeposit').textContent = `€${dep.toFixed(2)}`;

    const neighborRow = container.querySelector('#neighborDebtRow');
    if (v.item_owner === 'NEIGHBOR') {
      const payout = fee * 0.8;
      neighborRow.classList.remove('d-none');
      container.querySelector('#calcNeighborDebt').textContent = `€${payout.toFixed(2)} (Owed to ${v.neighbor_name || 'Partner'})`;
    } else {
      neighborRow.classList.add('d-none');
    }

    container.querySelector('#calcTotal').textContent = `€${(fee + dep).toFixed(2)}`;
  }

  vehicleSelect.addEventListener('change', onVehicleChange);
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

    onVehicleChange();
    modalEl.style.display = 'block';
    modalEl.classList.add('show');
  });
}
