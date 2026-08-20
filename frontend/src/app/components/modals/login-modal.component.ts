import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-light border-secondary shadow-lg rounded-4">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-primary">
              <i class="fa-solid fa-user-shield me-2"></i> Selección de Perfil y Tienda
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <form (ngSubmit)="submitLogin()">
              <div class="mb-3">
                <label class="form-label text-secondary small">Rol de Usuario</label>
                <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="role" name="role">
                  <option value="ADMIN">ADMINISTRADOR</option>
                  <option value="EMPLOYEE">EMPLEADO</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="form-label text-secondary small">Local / Tienda</label>
                <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="storeId" name="storeId">
                  <option [value]="1">Tienda Central Málaga (Store #1)</option>
                  <option [value]="2">Camping Mijas (Campsite #2)</option>
                </select>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm">
                  <i class="fa-solid fa-right-to-bracket me-2"></i> Acceder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginModalComponent {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  role: 'ADMIN' | 'EMPLOYEE' = 'ADMIN';
  storeId = 1;

  async submitLogin() {
    this.state.setActiveRole(this.role);
    this.state.setActiveStore(this.storeId);
    this.state.showToast('Sesión Actualizada', `Perfil: ${this.role} en Tienda #${this.storeId}`, 'info');

    const modalEl = document.getElementById('loginModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    window.dispatchEvent(new CustomEvent('app:refresh'));
  }
}
