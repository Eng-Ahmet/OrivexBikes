import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-rentals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Actions -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-clock-rotate-left fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('rentals') }} Contracts Ledger</h3>
            <p class="text-secondary small mb-0">
              Active contracts & customer audit ledger for <strong class="text-info">{{ getStoreName(state.activeStoreId()) }}</strong>
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
            <i class="fa-solid fa-store me-1 text-warning"></i> Store: {{ getStoreName(state.activeStoreId()) }}
          </div>

          <button class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold text-white" (click)="openNewContractModal()">
            <i class="fa-solid fa-plus me-2 text-white"></i> New Contract
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <select class="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3" [(ngModel)]="statusFilter" (change)="loadRentals()">
            <option value="ALL">All Contracts</option>
            <option value="ACTIVE">Active Rentals</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div class="col-12 col-md-8">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control bg-dark text-light border-secondary rounded-start-pill px-3"
                   placeholder="Search contract #, customer name, or phone..."
                   [(ngModel)]="searchQuery"
                   (keyup.enter)="loadRentals()" />
            <button class="btn btn-outline-info rounded-end-pill px-4 text-white" (click)="loadRentals()">
              <i class="fa-solid fa-magnifying-glass me-1 text-white"></i> Search
            </button>
          </div>
        </div>
      </div>

      <!-- Contracts Grid -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-info" role="status"></div>
          <p class="text-secondary mt-2">Loading contracts ledger...</p>
        </div>
      } @else if (rentals().length === 0) {
        <div class="text-center py-5 border border-secondary border-dashed rounded-4">
          <i class="fa-solid fa-folder-open fa-3x text-secondary mb-3 opacity-50"></i>
          <h5 class="text-secondary">No contracts found for {{ getStoreName(state.activeStoreId()) }}</h5>
        </div>
      } @else {
        <div class="row g-4">
          @for (r of rentals(); track r.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border rounded-4 p-4 h-100 shadow-sm transition d-flex flex-column" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold text-info font-mono fs-5">#{{ r.contract_number || r.id }}</span>
                  <span class="badge rounded-pill px-3 py-2 text-white"
                        [class.bg-success]="r.status === 'ACTIVE'"
                        [class.bg-opacity-20]="r.status === 'ACTIVE'"
                        [class.border]="r.status === 'ACTIVE'"
                        [class.border-success]="r.status === 'ACTIVE'"
                        [class.bg-secondary]="r.status !== 'ACTIVE'">
                    {{ r.status }}
                  </span>
                </div>

                <h5 class="fw-bold text-white mb-1">{{ r.customer_name }}</h5>
                <p class="text-secondary small mb-2"><i class="fa-solid fa-phone me-1 text-success"></i> {{ r.customer_phone || '+34 600 000 000' }}</p>

                <!-- Inset Details Box -->
                <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 mb-3">
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">Vehicle:</span>
                    <strong class="text-white">{{ r.vehicle_name || 'E-Bike #01' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">Start:</span>
                    <span class="text-white">{{ formatDate(r.start_date || r.start_time) }}</span>
                  </div>
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">End:</span>
                    <span class="text-white">{{ formatDate(r.end_date || r.end_time) }}</span>
                  </div>
                  <div class="d-flex justify-content-between small border-top border-secondary border-opacity-25 pt-1 mt-1">
                    <span class="text-secondary">Total Amount:</span>
                    <strong class="text-success fs-6">€{{ r.total_price || r.total_amount || 40 }}</strong>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-auto">
                  @if (r.status === 'ACTIVE') {
                    <button class="btn btn-sm btn-outline-warning rounded-pill flex-grow-1 text-white" (click)="openReturnModal(r)">
                      <i class="fa-solid fa-rotate-left me-1 text-white"></i> Return Vehicle
                    </button>
                    <button class="btn btn-sm btn-outline-info rounded-pill flex-grow-1 text-white" (click)="openExtendModal(r)">
                      <i class="fa-solid fa-clock me-1 text-white"></i> Extend Rental
                    </button>
                  } @else {
                    <button class="btn btn-sm btn-outline-secondary rounded-pill w-100 text-white" (click)="openReturnModal(r)">
                      <i class="fa-solid fa-file-invoice me-1 text-white"></i> View Receipt
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RentalsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  rentals = signal<any[]>([]);
  loading = signal<boolean>(true);
  statusFilter = 'ALL';
  searchQuery = '';

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      this.loadRentals();
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    await this.loadRentals();
  }

  getStoreName(id: number): string {
    return id === 2 ? 'Camping Mijas Resort' : 'Málaga Central Beach';
  }

  async loadRentals() {
    this.loading.set(true);
    try {
      const data = await this.api.getRentals(this.statusFilter, this.searchQuery);
      this.rentals.set(data || []);
    } catch (err) {
      this.state.showToast('Error', 'Could not load rentals ledger', 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(dtStr: string): string {
    if (!dtStr) return '-';
    const d = new Date(dtStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openNewContractModal() {
    const modalEl = document.getElementById('newContractModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openReturnModal(rental: any) {
    const modalEl = document.getElementById('returnVehicleModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openExtendModal(rental: any) {
    const modalEl = document.getElementById('extendContractModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}
