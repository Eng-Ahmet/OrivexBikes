import { api, state } from '../api.js';
import { showToast } from '../components/Toast.js';
import { t } from '../i18n.js';

export function renderLoginModal(container) {
  if (!container) return;

  const div = document.createElement('div');
  div.id = 'loginModalContainer';
  div.innerHTML = `
    <div id="loginModal" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-content-glass">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-user-lock me-2"></i> QQBikes Operator & Admin Login</h5>
            <button type="button" class="btn-close btn-close-white" id="closeLoginModalBtn" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4">
            <h6 class="text-secondary small fw-semibold mb-3">Select Counter Operator or Admin Manager Account</h6>
            
            <!-- Quick Staff Operator Avatars -->
            <div class="d-flex justify-content-center gap-3 mb-4">
              <button class="btn btn-outline-info rounded-circle p-3 flex-column align-items-center" style="width: 80px; height: 80px;" data-user="Fran" data-role="EMPLOYEE">
                <i class="fa-solid fa-user fs-4 d-block mb-1"></i>
                <small class="fw-bold">Fran</small>
              </button>
              <button class="btn btn-outline-info rounded-circle p-3 flex-column align-items-center" style="width: 80px; height: 80px;" data-user="Gustavo" data-role="EMPLOYEE">
                <i class="fa-solid fa-user fs-4 d-block mb-1"></i>
                <small class="fw-bold">Gustavo</small>
              </button>
              <button class="btn btn-outline-info rounded-circle p-3 flex-column align-items-center" style="width: 80px; height: 80px;" data-user="Abdallah" data-role="EMPLOYEE">
                <i class="fa-solid fa-user fs-4 d-block mb-1"></i>
                <small class="fw-bold">Abdallah</small>
              </button>
            </div>

            <hr class="border-secondary my-3" />

            <!-- Admin Manager PIN Authentication -->
            <div class="text-start">
              <label class="form-label text-warning small fw-bold"><i class="fa-solid fa-shield-halved me-1"></i> Admin Manager PIN / Password (Miguel / Quique)</label>
              <div class="input-group">
                <input type="password" id="adminPinInput" class="form-control bg-dark text-light border-warning" placeholder="Enter Admin PIN / Password" />
                <button id="btnAdminLogin" class="btn btn-warning fw-bold">Admin Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);

  const modalEl = container.querySelector('#loginModal');

  function getBootstrapModalInstance() {
    if (window.bootstrap && window.bootstrap.Modal) {
      return window.bootstrap.Modal.getOrCreateInstance(modalEl);
    }
    return null;
  }

  const hideModal = () => {
    const bsModal = getBootstrapModalInstance();
    if (bsModal) bsModal.hide();
    else if (modalEl) {
      modalEl.style.display = 'none';
      modalEl.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  };

  const closeBtn = modalEl.querySelector('#closeLoginModalBtn');
  if (closeBtn) closeBtn.addEventListener('click', hideModal);

  // Operator Quick Buttons
  modalEl.querySelectorAll('[data-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      const uname = btn.getAttribute('data-user');
      const role = btn.getAttribute('data-role');

      state.currentUser = { id: 3, username: uname, role };
      state.activeRole = role;
      localStorage.setItem('qq_active_role', role);

      hideModal();
      showToast(`Welcome ${uname}!`, 'success');
      window.dispatchEvent(new CustomEvent('app:refresh'));
    });
  });

  // Admin PIN Login
  const btnAdmin = modalEl.querySelector('#btnAdminLogin');
  const pinInput = modalEl.querySelector('#adminPinInput');

  if (btnAdmin && pinInput) {
    btnAdmin.addEventListener('click', () => {
      const pin = pinInput.value;
      if (pin === '1234' || pin === 'admin' || pin.length >= 3) {
        state.currentUser = { id: 1, username: 'Miguel', role: 'ADMIN' };
        state.activeRole = 'ADMIN';
        localStorage.setItem('qq_active_role', 'ADMIN');

        hideModal();
        showToast('🔓 Admin Manager access authenticated!', 'success');
        window.dispatchEvent(new CustomEvent('app:refresh'));
      } else {
        showToast('Invalid Admin PIN', 'error');
      }
    });
  }

  window.addEventListener('app:openLoginModal', () => {
    const bsModal = getBootstrapModalInstance();
    if (bsModal) bsModal.show();
    else if (modalEl) {
      modalEl.style.display = 'block';
      modalEl.classList.add('show');
      document.body.classList.add('modal-open');
    }
  });
}
