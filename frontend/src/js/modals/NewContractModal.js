import { api } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export function renderNewContractModal(container) {
  if (!container) return;

  const now = new Date();
  const formatDateTimeLocal = (dateObj) => {
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const defaultStart = formatDateTimeLocal(now);
  const defaultReturn = formatDateTimeLocal(new Date(now.getTime() + (2 * 3600 * 1000))); // Default +2h

  container.innerHTML = `
    <div id="contractModal" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-file-signature me-2"></i> ${t('modal_contract_title')}</h5>
            <button type="button" class="btn-close btn-close-white" id="closeContractModalBtn" data-bs-dismiss="modal"></button>
          </div>
          <form id="newContractForm">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-user me-1"></i> ${t('label_cust_name')}</label>
                  <input type="text" id="custName" class="form-control bg-dark text-light border-secondary" placeholder="e.g. John Doe" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-id-card me-1"></i> ${t('label_cust_passport')}</label>
                  <input type="text" id="custPassport" class="form-control bg-dark text-light border-secondary" placeholder="e.g. X1234567A" required />
                </div>

                <!-- DYNAMIC PHONE LABEL & REQUIRED STATE -->
                <div class="col-md-6">
                  <label id="phoneLabel" class="form-label text-secondary small fw-semibold">
                    <i class="fa-solid fa-phone me-1"></i> ${t('label_cust_phone')} <span id="phoneReqBadge" class="text-danger">*</span>
                  </label>
                  <input type="tel" id="custPhone" class="form-control bg-dark text-light border-secondary" placeholder="e.g. +34 612 345 678" required />
                </div>

                <!-- SELECT PHYSICAL UNIT / SERIAL / QR CODE -->
                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-bicycle me-1"></i> ${t('label_select_unit')}</label>
                  <select id="contractVehicleSelect" class="form-select bg-dark text-light border-secondary" required></select>
                </div>

                <!-- E-BIKE CREDIT CARD (VISA) SECURITY GUARANTEE DEPOSIT FIELDS -->
                <div id="ebikeFieldsRow" class="col-12 d-none">
                  <div class="p-3 bg-dark bg-opacity-75 rounded border border-warning">
                    <h6 class="text-warning fw-bold mb-2"><i class="fa-solid fa-credit-card me-1"></i> ${t('ebike_card_title')}</h6>
                    <div class="row g-2">
                      <div class="col-md-8">
                        <label class="form-label text-secondary small">${t('ebike_card_number')}</label>
                        <input type="text" id="ebikeCardNumber" class="form-control form-control-sm bg-dark text-warning border-warning font-monospace" placeholder="4532 •••• •••• 8892" maxlength="19" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label text-secondary small">${t('ebike_card_expiry')}</label>
                        <input type="text" id="ebikeCardExpiry" class="form-control form-control-sm bg-dark text-warning border-warning font-monospace text-center" placeholder="08/28" maxlength="5" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DEPARTURE & EXPECTED RETURN DATETIME PICKERS -->
                <div class="col-md-6">
                  <label class="form-label text-info small fw-semibold"><i class="fa-solid fa-calendar-minus me-1"></i> ${t('label_departure_time')}</label>
                  <input type="datetime-local" id="startTimeInput" class="form-control bg-dark text-light border-info" value="${defaultStart}" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label text-info small fw-semibold"><i class="fa-solid fa-calendar-plus me-1"></i> ${t('label_return_time')}</label>
                  <input type="datetime-local" id="expectedReturnTimeInput" class="form-control bg-dark text-light border-info" value="${defaultReturn}" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-secondary small fw-semibold"><i class="fa-solid fa-credit-card me-1"></i> ${t('label_payment_method')}</label>
                  <select id="paymentMethod" class="form-select bg-dark text-light border-secondary">
                    <option value="CARD">Credit / Debit Card (VISA)</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Pricing Calculation Card -->
              <div class="bg-dark bg-opacity-75 p-3 rounded border border-secondary my-3">
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Selected Physical Unit:</span><strong id="calcVehicleName" class="text-light">-</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>Category:</span><span id="calcCategoryBadge" class="badge bg-info-subtle text-info">-</span></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>${t('label_calculated_duration')}:</span><strong id="calcElapsedDuration" class="text-info">2 Hours</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>${t('label_auto_fee')}:</span><strong id="calcRentalFee" class="text-light">€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary mb-1"><span>${t('label_deposit')}:</span><strong id="calcDeposit" class="text-warning">€0.00</strong></div>
                <div id="neighborDebtRow" class="d-none d-flex justify-content-between text-secondary mb-1"><span>Neighbor Debt (80% Payout):</span><strong id="calcNeighborDebt" class="text-warning">€0.00</strong></div>
                <div class="d-flex justify-content-between text-secondary border-top border-secondary pt-2 mt-2"><span>${t('label_total_payable')}:</span><strong id="calcTotal" class="text-info fs-5">€0.00</strong></div>
              </div>
            </div>

            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelContractModalBtn" data-bs-dismiss="modal">${t('cancel')}</button>
              <button type="submit" class="btn btn-info btn-sm fw-bold"><i class="fa-solid fa-check me-1"></i> ${t('btn_issue_contract')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = document.getElementById('contractModal') || container.querySelector('#contractModal');
  if (!modalEl) return;

  const form = modalEl.querySelector('#newContractForm');
  const vehicleSelect = modalEl.querySelector('#contractVehicleSelect');
  const startTimeInput = modalEl.querySelector('#startTimeInput');
  const returnTimeInput = modalEl.querySelector('#expectedReturnTimeInput');
  const custNameInput = modalEl.querySelector('#custName');
  const custPassportInput = modalEl.querySelector('#custPassport');
  const custPhone = modalEl.querySelector('#custPhone');
  const phoneReqBadge = modalEl.querySelector('#phoneReqBadge');
  const ebikeFieldsRow = modalEl.querySelector('#ebikeFieldsRow');
  const ebikeCardNumber = modalEl.querySelector('#ebikeCardNumber');
  const ebikeCardExpiry = modalEl.querySelector('#ebikeCardExpiry');

  let vehiclesList = [];
  let currentCalculatedFee = 0;

  // LATIN-ONLY CHARACTER VALIDATION HELPER
  function isLatinOnly(str) {
    if (!str) return true;
    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return !hasArabic.test(str);
  }

  function getBootstrapModalInstance() {
    if (window.bootstrap && window.bootstrap.Modal) {
      return window.bootstrap.Modal.getOrCreateInstance(modalEl);
    }
    return null;
  }

  // AUTOMATED OFFICIAL TARIFF ENGINE WITH ACTIVE TIER MULTIPLICATION
  function calculateAutoTariff(category, totalMins) {
    const normCat = (category || '').toLowerCase();
    const totalHours = totalMins / 60;
    const totalDays = Math.ceil(totalMins / (24 * 60));

    // XL Cars & Jeep
    if (normCat.includes('xl')) {
      if (totalMins <= 25) return { fee: 15, durationStr: '20 Minutos' };
      if (totalMins <= 45) return { fee: 20, durationStr: '30 Minutos' };
      return { fee: 30 * Math.ceil(totalHours), durationStr: `${Math.ceil(totalHours)} Hour(s)` };
    }

    // Quads & S Cars
    if (normCat.includes('s cars') || normCat.includes('quad')) {
      if (totalMins <= 25) return { fee: 10, durationStr: '20 Minutos' };
      if (totalMins <= 45) return { fee: 15, durationStr: '30 Minutos' };
      return { fee: 25 * Math.ceil(totalHours), durationStr: `${Math.ceil(totalHours)} Hour(s)` };
    }

    // Buggy's
    if (normCat.includes('buggy')) {
      if (totalMins <= 45) return { fee: 5, durationStr: '30 Minutos' };
      return { fee: 25 * Math.ceil(totalHours), durationStr: `${Math.ceil(totalHours)} Hour(s)` };
    }

    // Standard Bicycles (Quert / Altec / MTB / Bici Niño)
    if (normCat.includes('bike') && !normCat.includes('e-bike')) {
      if (totalHours <= 1.5) return { fee: 5, durationStr: '1 Hora' };
      if (totalHours <= 6.0) return { fee: 15, durationStr: '5 Horas' };
      if (totalDays === 1) return { fee: 20, durationStr: '1 Día' };
      if (totalDays === 2) return { fee: 35, durationStr: '2 Días' };

      if (totalDays <= 6) {
        const fee = totalDays * 15;
        return { fee, durationStr: `${totalDays} Días (Tier +3 Días @ €15/día)` };
      }

      if (totalDays <= 13) {
        const fee = totalDays * 10;
        return { fee, durationStr: `${totalDays} Días (Tier +1 Semana @ €10/día)` };
      }

      const fee = totalDays * 8;
      return { fee, durationStr: `${totalDays} Días (Tier +2 Semanas @ €8/día)` };
    }

    // E-Bikes VISA
    if (normCat.includes('e-bike')) {
      if (totalHours <= 1.5) return { fee: 15, durationStr: '1 Hora' };
      if (totalHours <= 3.0) return { fee: 20, durationStr: '2 Horas' };
      if (totalHours <= 8.0) return { fee: 25, durationStr: '5 Horas' };
      if (totalDays === 1) return { fee: 40, durationStr: '1 Día' };
      if (totalDays === 2) return { fee: 60, durationStr: '2 Días' };

      if (totalDays <= 6) {
        const fee = totalDays * 30;
        return { fee, durationStr: `${totalDays} Días (Tier +3 Días @ €30/día)` };
      }

      if (totalDays <= 13) {
        const fee = totalDays * 25;
        return { fee, durationStr: `${totalDays} Días (Tier +1 Semana @ €25/día)` };
      }

      const fee = totalDays * 20;
      return { fee, durationStr: `${totalDays} Días (Tier +2 Semanas @ €20/día)` };
    }

    // Scooters (Etwow / Ninebot)
    if (totalMins <= 45) return { fee: 10, durationStr: '30 Minutos' };
    if (totalHours <= 1.5) return { fee: 15, durationStr: '1 Hora' };
    if (totalHours <= 3.0) return { fee: 20, durationStr: '2 Horas' };
    if (totalDays === 1) return { fee: 40, durationStr: '1 Día' };
    if (totalDays === 2) return { fee: 60, durationStr: '2 Días' };

    if (totalDays <= 6) {
      const fee = totalDays * 30;
      return { fee, durationStr: `${totalDays} Días (Tier +3 Días @ €30/día)` };
    }

    if (totalDays <= 13) {
      const fee = totalDays * 25;
      return { fee, durationStr: `${totalDays} Días (Tier +1 Semana @ €25/día)` };
    }

    const fee = totalDays * 20;
    return { fee, durationStr: `${totalDays} Días (Tier +2 Semanas @ €20/día)` };
  }

  function updateCalc() {
    if (!vehicleSelect || !vehicleSelect.value) return;
    const vId = Number(vehicleSelect.value);
    const v = vehiclesList.find(item => item.id === vId);
    if (!v) return;

    const normCat = (v.category || '').toLowerCase();
    const isBikeOrScooter = normCat.includes('bike') || normCat.includes('scooter');
    if (isBikeOrScooter) {
      if (custPhone) custPhone.required = true;
      if (phoneReqBadge) {
        phoneReqBadge.textContent = '*';
        phoneReqBadge.className = 'text-danger';
      }
    } else {
      if (custPhone) custPhone.required = false;
      if (phoneReqBadge) {
        phoneReqBadge.textContent = '(Optional)';
        phoneReqBadge.className = 'text-secondary font-monospace';
      }
    }

    const isEbike = normCat.includes('e-bike');
    if (isEbike && ebikeFieldsRow) {
      ebikeFieldsRow.classList.remove('d-none');
    } else if (ebikeFieldsRow) {
      ebikeFieldsRow.classList.add('d-none');
    }

    const sTime = new Date(startTimeInput.value).getTime();
    const rTime = new Date(returnTimeInput.value).getTime();
    let elapsedMins = Math.max(15, Math.round((rTime - sTime) / 60000));

    if (isNaN(elapsedMins) || elapsedMins <= 0) elapsedMins = 60;

    const tariffResult = calculateAutoTariff(v.category, elapsedMins);
    currentCalculatedFee = tariffResult.fee;
    const dep = v.deposit_amount || 30;

    const elName = modalEl.querySelector('#calcVehicleName');
    const elBadge = modalEl.querySelector('#calcCategoryBadge');
    const elDuration = modalEl.querySelector('#calcElapsedDuration');
    const elFee = modalEl.querySelector('#calcRentalFee');
    const elDep = modalEl.querySelector('#calcDeposit');
    const elNeighborRow = modalEl.querySelector('#neighborDebtRow');
    const elNeighborDebt = modalEl.querySelector('#calcNeighborDebt');
    const elTotal = modalEl.querySelector('#calcTotal');

    if (elName) elName.textContent = `${v.name} (${v.qr_code})`;
    if (elBadge) elBadge.textContent = v.category;
    if (elDuration) elDuration.textContent = tariffResult.durationStr;
    if (elFee) elFee.textContent = `€${tariffResult.fee.toFixed(2)}`;
    if (elDep) elDep.textContent = `€${dep.toFixed(2)}`;

    if (v.item_owner === 'NEIGHBOR') {
      const payout = tariffResult.fee * 0.8;
      if (elNeighborRow) elNeighborRow.classList.remove('d-none');
      if (elNeighborDebt) elNeighborDebt.textContent = `€${payout.toFixed(2)} (Owed to ${v.neighbor_name || 'Partner'})`;
    } else {
      if (elNeighborRow) elNeighborRow.classList.add('d-none');
    }

    if (elTotal) elTotal.textContent = `€${(tariffResult.fee + dep).toFixed(2)}`;
  }

  if (vehicleSelect) vehicleSelect.addEventListener('change', updateCalc);
  if (startTimeInput) startTimeInput.addEventListener('input', updateCalc);
  if (returnTimeInput) returnTimeInput.addEventListener('input', updateCalc);

  const hideModal = () => {
    const bsModal = getBootstrapModalInstance();
    if (bsModal) {
      bsModal.hide();
    } else if (modalEl) {
      modalEl.style.display = 'none';
      modalEl.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  };

  const closeBtn = modalEl.querySelector('#closeContractModalBtn');
  const cancelBtn = modalEl.querySelector('#cancelContractModalBtn');
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = custNameInput.value.trim();
      const passportVal = custPassportInput.value.trim();

      // LATIN-ONLY CHARACTER VALIDATION CHECK
      if (!isLatinOnly(nameVal) || !isLatinOnly(passportVal)) {
        showToast('⚠️ Customer details must be written in Latin script (Spanish / English / Standard Western characters). Arabic script is disallowed in database records.', 'error');
        return;
      }

      const sTime = new Date(startTimeInput.value).getTime();
      const rTime = new Date(returnTimeInput.value).getTime();
      const durationHours = Math.max(1, Math.round((rTime - sTime) / (3600 * 1000)));

      const data = {
        customer_name: nameVal,
        customer_passport: passportVal,
        customer_phone: custPhone.value || '-',
        vehicle_id: Number(vehicleSelect.value),
        start_time: new Date(startTimeInput.value).toISOString(),
        expected_end_time: new Date(returnTimeInput.value).toISOString(),
        duration_hours: durationHours,
        rental_fee: currentCalculatedFee,
        payment_method: modalEl.querySelector('#paymentMethod').value,
        credit_card_number: ebikeCardNumber ? ebikeCardNumber.value : '',
        credit_card_expiry: ebikeCardExpiry ? ebikeCardExpiry.value : ''
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
  }

  window.addEventListener('app:openNewContractModal', async (e) => {
    const preselectedCategory = e.detail?.category;
    vehiclesList = await api.getVehicles('ALL', 'AVAILABLE');

    if (!vehicleSelect) return;
    vehicleSelect.innerHTML = '';
    if (!vehiclesList || vehiclesList.length === 0) {
      showToast('No vehicles currently available for rental.', 'warning');
      return;
    }

    let filteredList = vehiclesList;
    if (preselectedCategory) {
      filteredList = vehiclesList.filter(v => v.category.includes(preselectedCategory));
      if (filteredList.length === 0) filteredList = vehiclesList;
    }

    filteredList.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} [Serial / QR: ${v.qr_code}] (Depósito €${v.deposit_amount || 30})`;
      vehicleSelect.appendChild(opt);
    });

    const nowFresh = new Date();
    if (startTimeInput) startTimeInput.value = formatDateTimeLocal(nowFresh);
    if (returnTimeInput) returnTimeInput.value = formatDateTimeLocal(new Date(nowFresh.getTime() + (2 * 3600 * 1000)));

    updateCalc();

    const bsModal = getBootstrapModalInstance();
    if (bsModal) {
      bsModal.show();
    } else if (modalEl) {
      modalEl.style.display = 'block';
      modalEl.classList.add('show');
      document.body.classList.add('modal-open');
    }
  });
}
