import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-return-vehicle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="returnVehicleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-light border-secondary shadow-lg rounded-4">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-warning">
              <i class="fa-solid fa-rotate-left me-2"></i> Procesar Devolución de Vehículo
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <form (ngSubmit)="submitReturn()">
              <div class="mb-3">
                <label class="form-label text-secondary small">ID del Contrato / Código *</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" required placeholder="Ej. 1" [(ngModel)]="form.contract_id" name="contract_id" />
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small">Costo por Daños o Desgaste Extra (€)</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.damage_fee" name="damage_fee" />
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small">Horas Adicionales / Exceso de Tiempo (€)</label>
                <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.late_fee" name="late_fee" />
              </div>

              <div class="mb-4">
                <label class="form-label text-secondary small">Observaciones de Inspección</label>
                <textarea class="form-control bg-dark text-light border-secondary" rows="2" placeholder="Estado del vehículo al ser entregado..." [(ngModel)]="form.notes" name="notes"></textarea>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-warning rounded-pill px-4 shadow-sm" [disabled]="submitting()">
                  <i class="fa-solid fa-check me-2"></i> Procesar Devolución
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReturnVehicleModalComponent {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  submitting = signal<boolean>(false);

  form = {
    contract_id: null as number | null,
    damage_fee: 0,
    late_fee: 0,
    notes: ''
  };

  async submitReturn() {
    if (!this.form.contract_id) {
      this.state.showToast('Atención', 'Por favor indique el ID de contrato', 'warning');
      return;
    }

    this.submitting.set(true);
    try {
      await this.api.returnVehicle(this.form.contract_id, this.form);
      this.state.showToast('Devolución Completada', `El contrato #${this.form.contract_id} ha sido cerrado correctamente`, 'success');

      const modalEl = document.getElementById('returnVehicleModal');
      if (modalEl && (window as any).bootstrap) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      window.dispatchEvent(new CustomEvent('app:refresh'));
    } catch (err) {
      this.state.showToast('Error', 'No se pudo procesar la devolución', 'danger');
    } finally {
      this.submitting.set(false);
    }
  }
}
