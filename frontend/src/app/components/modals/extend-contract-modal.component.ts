import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-extend-contract-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="extendContractModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-light border-secondary shadow-lg rounded-4">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-info">
              <i class="fa-solid fa-clock me-2"></i> Ampliar Duración de Contrato
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <form (ngSubmit)="submitExtension()">
              <div class="mb-3">
                <label class="form-label text-secondary small">ID del Contrato *</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" required placeholder="Ej. 1" [(ngModel)]="form.contract_id" name="contract_id" />
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small">Días Adicionales *</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" min="1" [(ngModel)]="form.extra_days" name="extra_days" />
              </div>

              <div class="mb-4">
                <label class="form-label text-secondary small">Monto Adicional a Cobrar (€)</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.extra_price" name="extra_price" />
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-info rounded-pill px-4 shadow-sm" [disabled]="submitting()">
                  <i class="fa-solid fa-check me-2"></i> Guardar Ampliación
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExtendContractModalComponent {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  submitting = signal<boolean>(false);

  form = {
    contract_id: null as number | null,
    extra_days: 1,
    extra_price: 20
  };

  async submitExtension() {
    if (!this.form.contract_id) {
      this.state.showToast('Atención', 'Indique el ID del contrato', 'warning');
      return;
    }

    this.submitting.set(true);
    try {
      await this.api.extendRental(this.form.contract_id, this.form);
      this.state.showToast('Contrato Ampliado', `Se ha ampliado la duración del contrato #${this.form.contract_id}`, 'success');

      const modalEl = document.getElementById('extendContractModal');
      if (modalEl && (window as any).bootstrap) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      window.dispatchEvent(new CustomEvent('app:refresh'));
    } catch (err) {
      this.state.showToast('Error', 'No se pudo ampliar el contrato', 'danger');
    } finally {
      this.submitting.set(false);
    }
  }
}
