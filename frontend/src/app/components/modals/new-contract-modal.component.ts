import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-new-contract-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="newContractModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-light border-secondary shadow-lg rounded-4">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-primary">
              <i class="fa-solid fa-file-signature me-2"></i> Nuevo Contrato de Alquiler
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <form (ngSubmit)="submitContract()">
              <!-- Customer Section -->
              <h6 class="text-info fw-bold mb-3"><i class="fa-solid fa-user me-2"></i> Datos del Cliente</h6>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small">Nombre Completo *</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" required placeholder="Ej. Juan Pérez" [(ngModel)]="form.customer_name" name="customer_name" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small">DNI / Pasaporte *</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" required placeholder="Ej. 12345678X" [(ngModel)]="form.customer_doc" name="customer_doc" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small">Teléfono / WhatsApp *</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" required placeholder="Ej. +34 600 000 000" [(ngModel)]="form.customer_phone" name="customer_phone" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small">Email (Opcional)</label>
                  <input type="email" class="form-control bg-dark text-light border-secondary" placeholder="ejemplo@email.com" [(ngModel)]="form.customer_email" name="customer_email" />
                </div>
              </div>

              <!-- Vehicle & Duration Section -->
              <h6 class="text-success fw-bold mb-3"><i class="fa-solid fa-bicycle me-2"></i> Selección de Vehículo y Duración</h6>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small">Vehículo Disponibles *</label>
                  <select class="form-select bg-dark text-light border-secondary" required [(ngModel)]="form.vehicle_id" (change)="onVehicleSelect()" name="vehicle_id">
                    <option [value]="null" disabled>Seleccione un vehículo...</option>
                    @for (v of availableVehicles(); track v.id) {
                      <option [value]="v.id">#{{ v.code || v.frame_number }} - {{ v.model_name || v.brand }} (€{{ v.daily_rate || 20 }}/día)</option>
                    }
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label text-secondary small">Duración (Días) *</label>
                  <input type="number" class="form-control bg-dark text-light border-secondary" min="1" [(ngModel)]="form.duration_days" (change)="calculateTotal()" name="duration_days" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label text-secondary small">Fianza (€) *</label>
                  <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.deposit_amount" name="deposit_amount" />
                </div>
              </div>

              <!-- Total & Payment Method -->
              <div class="card bg-secondary bg-opacity-10 border-secondary rounded-3 p-3 mb-4">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="text-secondary d-block small">Método de Pago</span>
                    <div class="btn-group mt-1">
                      <button type="button" class="btn btn-sm" [class.btn-success]="form.payment_method === 'CASH'" [class.btn-outline-secondary]="form.payment_method !== 'CASH'" (click)="form.payment_method = 'CASH'">
                        <i class="fa-solid fa-money-bill me-1"></i> Efectivo
                      </button>
                      <button type="button" class="btn btn-sm" [class.btn-primary]="form.payment_method === 'CARD'" [class.btn-outline-secondary]="form.payment_method !== 'CARD'" (click)="form.payment_method = 'CARD'">
                        <i class="fa-solid fa-credit-card me-1"></i> Tarjeta
                      </button>
                    </div>
                  </div>
                  <div class="text-end">
                    <span class="text-secondary small d-block">Precio Total Alquiler</span>
                    <h3 class="fw-bold text-success mb-0">€{{ calculatedTotal() }}</h3>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm" [disabled]="submitting()">
                  <i class="fa-solid fa-check me-2"></i> Confirmar y Crear Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NewContractModalComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  availableVehicles = signal<any[]>([]);
  calculatedTotal = signal<number>(20);
  submitting = signal<boolean>(false);

  form = {
    customer_name: '',
    customer_doc: '',
    customer_phone: '',
    customer_email: '',
    vehicle_id: null as number | null,
    duration_days: 1,
    deposit_amount: 100,
    payment_method: 'CASH'
  };

  async ngOnInit() {
    try {
      const vehicles = await this.api.getVehicles('ALL', 'AVAILABLE');
      this.availableVehicles.set(vehicles || []);
    } catch (err) {}
  }

  onVehicleSelect() {
    this.calculateTotal();
  }

  calculateTotal() {
    const selected = this.availableVehicles().find(v => v.id == this.form.vehicle_id);
    const dailyRate = selected?.daily_rate || 20;
    this.calculatedTotal.set(dailyRate * (this.form.duration_days || 1));
  }

  async submitContract() {
    if (!this.form.customer_name || !this.form.vehicle_id) {
      this.state.showToast('Atención', 'Por favor complete el nombre del cliente y el vehículo', 'warning');
      return;
    }

    this.submitting.set(true);
    try {
      await this.api.createRental({
        ...this.form,
        total_price: this.calculatedTotal(),
        store_id: this.state.activeStoreId()
      });
      this.state.showToast('Contrato Creado', 'El contrato de alquiler ha sido registrado exitosamente', 'success');

      // Close modal
      const modalEl = document.getElementById('newContractModal');
      if (modalEl && (window as any).bootstrap) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      window.dispatchEvent(new CustomEvent('app:refresh'));
    } catch (err) {
      this.state.showToast('Error', 'No se pudo crear el contrato', 'danger');
    } finally {
      this.submitting.set(false);
    }
  }
}
