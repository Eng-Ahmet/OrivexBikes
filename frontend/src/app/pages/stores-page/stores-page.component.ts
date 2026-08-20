import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-stores-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Page Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="h3 fw-bold text-white mb-1">
            <i class="fa-solid fa-store me-2 text-primary"></i>Stores & Branches Management
          </h2>
          <p class="text-secondary mb-0">Manage store locations, operating hours, currency, initial floats, and real-time Store P&L financial metrics.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadStores()">
            <i class="fa-solid fa-rotate me-1"></i>Refresh
          </button>
          <button class="btn btn-primary btn-sm px-3 fw-bold" (click)="openCreateModal()">
            <i class="fa-solid fa-plus me-1"></i>New Store Branch
          </button>
        </div>
      </div>

      <!-- Date-Ranged Store P&L Filter Bar -->
      <div class="card bg-dark border-secondary mb-4 shadow-sm">
        <div class="card-body py-3">
          <div class="row g-3 align-items-center">
            <div class="col-md-3">
              <label class="form-label text-secondary small mb-1 fw-bold">From Date</label>
              <input type="date" class="form-control form-control-sm bg-dark text-white border-secondary" [(ngModel)]="fromDate" (change)="loadPnl()">
            </div>
            <div class="col-md-3">
              <label class="form-label text-secondary small mb-1 fw-bold">To Date</label>
              <input type="date" class="form-control form-control-sm bg-dark text-white border-secondary" [(ngModel)]="toDate" (change)="loadPnl()">
            </div>
            <div class="col-md-6 d-flex align-items-center justify-content-end gap-3 mt-4">
              <div class="text-end">
                <span class="text-secondary small d-block">Company-Wide Consolidated P&L</span>
                <span class="h4 fw-bold mb-0" [ngClass]="companyPnl?.net_operating_profit >= 0 ? 'text-success' : 'text-danger'">
                  €{{ (companyPnl?.net_operating_profit || 0).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stores Grid -->
      <div class="row g-4 mb-4">
        @for (st of stores; track st.id) {
          <div class="col-xl-4 col-md-6">
            <div class="card bg-dark border-secondary h-100 shadow-sm position-relative overflow-hidden">
              <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between py-3">
                <div class="d-flex align-items-center gap-2">
                  <div class="icon-box-circle bg-primary bg-opacity-20 text-info p-2" style="width: 38px; height: 38px;">
                    <i class="fa-solid fa-store fs-6"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold text-white mb-0 fs-6">{{ st.name }}</h5>
                    <span class="badge bg-secondary font-mono" style="font-size: 0.7rem;">{{ st.code }}</span>
                  </div>
                </div>
                <span class="badge" [ngClass]="st.is_active ? 'bg-success' : 'bg-danger'">
                  {{ st.is_active ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </div>
              <div class="card-body py-3">
                <div class="row g-2 mb-3 text-secondary small">
                  <div class="col-6"><i class="fa-solid fa-location-dot me-1 text-info"></i> {{ st.city }}</div>
                  <div class="col-6"><i class="fa-solid fa-clock me-1 text-info"></i> {{ st.operating_hours || '09:00 - 21:00' }}</div>
                  <div class="col-12"><i class="fa-solid fa-map-pin me-1 text-info"></i> {{ st.address }}</div>
                  <div class="col-6"><i class="fa-solid fa-phone me-1 text-info"></i> {{ st.phone }}</div>
                  <div class="col-6"><i class="fa-solid fa-money-bill-wave me-1 text-info"></i> Float: €{{ st.initial_cash_float }}</div>
                </div>

                <!-- Mini P&L Financial Widget -->
                @if (storePnls[st.id]) {
                  <div class="bg-black bg-opacity-50 rounded-3 p-3 border border-secondary mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="text-secondary small fw-bold"><i class="fa-solid fa-chart-line me-1 text-warning"></i> Store P&L Performance</span>
                      <span class="badge bg-dark border border-secondary text-info" style="font-size: 0.68rem;">{{ fromDate }} &rarr; {{ toDate }}</span>
                    </div>
                    <div class="row g-2 text-center">
                      <div class="col-4">
                        <div class="text-secondary" style="font-size: 0.7rem;">Revenue</div>
                        <div class="fw-bold text-success small">€{{ storePnls[st.id].total_revenue.toFixed(2) }}</div>
                      </div>
                      <div class="col-4">
                        <div class="text-secondary" style="font-size: 0.7rem;">Expenses</div>
                        <div class="fw-bold text-danger small">€{{ storePnls[st.id].total_costs.toFixed(2) }}</div>
                      </div>
                      <div class="col-4">
                        <div class="text-secondary" style="font-size: 0.7rem;">Net Profit</div>
                        <div class="fw-bold small" [ngClass]="storePnls[st.id].net_operating_profit >= 0 ? 'text-success' : 'text-danger'">
                          €{{ storePnls[st.id].net_operating_profit.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div class="card-footer bg-dark border-secondary d-flex align-items-center justify-content-between py-2">
                <button class="btn btn-outline-info btn-sm rounded-pill" (click)="openEditModal(st)">
                  <i class="fa-solid fa-pen me-1"></i>Edit Profile
                </button>
                <button class="btn btn-sm rounded-pill" [ngClass]="st.is_active ? 'btn-outline-danger' : 'btn-outline-success'" (click)="toggleStoreStatus(st)">
                  <i class="fa-solid" [ngClass]="st.is_active ? 'fa-power-off' : 'fa-check'"></i>
                  {{ st.is_active ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Create / Edit Store Modal -->
      @if (showModal) {
        <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-secondary shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold">
                  <i class="fa-solid fa-store text-primary me-2"></i>{{ isEdit ? 'Edit Store Branch Profile' : 'Create New Store Branch' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="saveStore()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold">Store Name *</label>
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.name" name="name" required placeholder="e.g. Marbella Port Hub">
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Store Code *</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.code" name="code" required placeholder="e.g. MAR-01">
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">City *</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.city" name="city" required placeholder="e.g. Marbella">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold">Full Address</label>
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.address" name="address" placeholder="Paseo Marítimo Local 5">
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Phone Number</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.phone" name="phone" placeholder="+34 952 777 888">
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Operating Hours</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.operating_hours" name="operating_hours" placeholder="09:00 - 22:00">
                    </div>
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Initial Cash Float (€)</label>
                      <input type="number" step="0.01" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.initial_cash_float" name="initial_cash_float">
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Currency</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="form.currency" name="currency" readonly>
                    </div>
                  </div>
                  <div class="modal-footer border-secondary px-0 pb-0 pt-3">
                    <button type="button" class="btn btn-outline-secondary" (click)="showModal = false">Cancel</button>
                    <button type="submit" class="btn btn-primary px-4 fw-bold">
                      <i class="fa-solid fa-save me-1"></i>Save Store Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class StoresPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  stores: any[] = [];
  companyPnl: any = null;
  storePnls: Record<number, any> = {};

  fromDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  toDate: string = new Date().toISOString().split('T')[0];

  showModal = false;
  isEdit = false;
  form: any = {
    id: 0,
    name: '',
    code: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    operating_hours: '09:00 - 21:00',
    currency: 'EUR',
    initial_cash_float: 150
  };

  async ngOnInit() {
    await this.loadStores();
  }

  async loadStores() {
    try {
      this.stores = await this.api.getStores();
      this.state.stores.set(this.stores);
      await this.loadPnl();
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to load stores', 'danger');
    }
  }

  async loadPnl() {
    try {
      this.companyPnl = await this.api.getStorePnl(null, this.fromDate, this.toDate);
      for (const st of this.stores) {
        this.storePnls[st.id] = await this.api.getStorePnl(st.id, this.fromDate, this.toDate);
      }
    } catch (e) {}
  }

  openCreateModal() {
    this.isEdit = false;
    this.form = {
      id: 0,
      name: '',
      code: `STR-${Math.floor(100 + Math.random() * 900)}`,
      city: 'Málaga',
      address: '',
      phone: '',
      email: '',
      operating_hours: '09:00 - 21:00',
      currency: 'EUR',
      initial_cash_float: 150
    };
    this.showModal = true;
  }

  openEditModal(st: any) {
    this.isEdit = true;
    this.form = { ...st };
    this.showModal = true;
  }

  async saveStore() {
    try {
      if (this.isEdit) {
        await this.api.updateStore(this.form.id, this.form);
        this.state.showToast('Success', 'Store branch updated successfully', 'success');
      } else {
        await this.api.createStore(this.form);
        this.state.showToast('Success', 'New store branch created successfully', 'success');
      }
      this.showModal = false;
      await this.loadStores();
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to save store profile', 'danger');
    }
  }

  async toggleStoreStatus(st: any) {
    try {
      await this.api.setStoreStatus(st.id, !st.is_active);
      this.state.showToast('Success', `Store ${st.name} is now ${!st.is_active ? 'ACTIVE' : 'INACTIVE'}`, 'info');
      await this.loadStores();
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to update status', 'danger');
    }
  }
}
