import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Actions -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-gears fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('settings') }} & Configuration</h3>
            <p class="text-secondary small mb-0">Global store centers management, tax rules, PWA digital asset links, and receipt templates</p>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-info" role="status"></div>
          <p class="text-secondary mt-2">Loading settings & store locations...</p>
        </div>
      } @else {
        <!-- Store Centers Management Section (Admin Only) -->
        <div class="card border rounded-4 p-4 shadow-sm mb-4" style="background: #161e2e !important; border-color: rgba(56,189,248,0.2) !important;">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom border-secondary border-opacity-25 pb-2">
            <div>
              <h5 class="fw-bold text-white mb-0 font-heading"><i class="fa-solid fa-store me-2 text-warning"></i> Store Centers & Locations (إدارة المراكز والافتتاح)</h5>
              <span class="text-secondary small">Each store maintains its own isolated calendar, settings, fleet, and contracts</span>
            </div>

            @if (state.activeRole() === 'ADMIN') {
              <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm text-white fw-bold" (click)="showAddStoreModal = true">
                <i class="fa-solid fa-plus me-1 text-white"></i> Add New Store Center
              </button>
            }
          </div>

          <!-- Add New Store Modal Form -->
          @if (showAddStoreModal) {
            <div class="bg-dark p-4 rounded-4 border border-info mb-4 shadow-lg">
              <h6 class="fw-bold text-info mb-3"><i class="fa-solid fa-shop me-2"></i> Register New Store Center</h6>
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="form-label text-secondary small">Store Center Name</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Torremolinos Central Hub" [(ngModel)]="newStore.name" />
                </div>
                <div class="col-12 col-md-3">
                  <label class="form-label text-secondary small">City</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Torremolinos" [(ngModel)]="newStore.city" />
                </div>
                <div class="col-12 col-md-5">
                  <label class="form-label text-secondary small">Street Address</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Calle San Miguel 18" [(ngModel)]="newStore.address" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label text-secondary small">Phone Contact</label>
                  <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="+34 952 000 000" [(ngModel)]="newStore.phone" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label text-secondary small">Initial Cash Float (€)</label>
                  <input type="number" class="form-control bg-dark text-light border-secondary" placeholder="150" [(ngModel)]="newStore.initial_cash_float" />
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showAddStoreModal = false">Cancel</button>
                <button class="btn btn-info btn-sm rounded-pill px-4 fw-bold text-white" (click)="addStoreCenter()">Create Store Center</button>
              </div>
            </div>
          }

          <!-- Store Locations Grid -->
          <div class="row g-3">
            @for (st of stores(); track st.id) {
              <div class="col-12 col-md-6">
                <div class="p-3 rounded-3 border bg-dark bg-opacity-80 d-flex flex-column gap-2" style="border-color: rgba(255,255,255,0.08) !important;">
                  <div class="d-flex align-items-center justify-content-between">
                    <strong class="text-white fs-6 font-heading"><i class="fa-solid fa-location-dot me-2 text-warning"></i> {{ st.name }}</strong>
                    <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 rounded-pill px-2 py-1 small fw-bold">Active</span>
                  </div>
                  <div class="text-secondary small">
                    <div><i class="fa-solid fa-map-pin me-1 text-info"></i> {{ st.address }}, {{ st.city }}</div>
                    <div><i class="fa-solid fa-phone me-1 text-success"></i> {{ st.phone }}</div>
                  </div>

                  @if (state.activeRole() === 'ADMIN') {
                    <div class="d-flex justify-content-end gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25">
                      <button class="btn btn-sm btn-outline-danger rounded-pill text-white px-3" (click)="deactivateStore(st.id)">
                        <i class="fa-solid fa-trash-can me-1 text-white"></i> Remove Center
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="row g-4">
          <!-- Company & Tax Info -->
          <div class="col-12 col-md-6">
            <div class="card border rounded-4 p-4 h-100 shadow-sm" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-building me-2 text-info"></i> Company Information</h5>

              <div class="mb-3">
                <label class="form-label text-secondary small">Company Legal Name</label>
                <div class="input-group">
                  <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="companyName" />
                  <button class="btn btn-outline-info text-white" (click)="saveSetting('company_name', companyName)">Save</button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small">Tax CIF / NIF</label>
                <div class="input-group">
                  <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="companyCif" />
                  <button class="btn btn-outline-info text-white" (click)="saveSetting('company_cif', companyCif)">Save</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Billing & Deposit Rules -->
          <div class="col-12 col-md-6">
            <div class="card border rounded-4 p-4 h-100 shadow-sm" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-calculator me-2 text-warning"></i> Billing & Default Deposit Rules</h5>

              <div class="mb-3">
                <label class="form-label text-secondary small">VAT Rate (% ES)</label>
                <div class="input-group">
                  <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="vatRate" />
                  <span class="input-group-text bg-dark text-light border-secondary">%</span>
                  <button class="btn btn-outline-warning text-white" (click)="saveSetting('vat_rate', vatRate)">Save</button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label text-secondary small">Default Deposit (€)</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark text-light border-secondary">€</span>
                  <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="defaultDeposit" />
                  <button class="btn btn-outline-warning text-white" (click)="saveSetting('default_deposit', defaultDeposit)">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SettingsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  companyName = 'QQBikes Málaga S.L.';
  companyCif = 'B29182736';
  vatRate = 21;
  defaultDeposit = 100;
  loading = signal<boolean>(true);

  stores = signal<any[]>([]);
  showAddStoreModal = false;

  newStore = {
    name: '',
    city: 'Málaga',
    address: '',
    phone: '',
    initial_cash_float: 150
  };

  async ngOnInit() {
    await this.loadStoresList();
    try {
      const settings = await this.api.getSettings();
      if (settings) {
        if (settings.company_name) this.companyName = settings.company_name;
        if (settings.company_cif) this.companyCif = settings.company_cif;
        if (settings.vat_rate) this.vatRate = settings.vat_rate;
        if (settings.default_deposit) this.defaultDeposit = settings.default_deposit;
      }
    } catch (err) {
      // Use defaults
    } finally {
      this.loading.set(false);
    }
  }

  async loadStoresList() {
    try {
      const res = await this.api.getStores();
      this.stores.set(res || []);
    } catch (err) {
      // Fallback
    }
  }

  async addStoreCenter() {
    try {
      await this.api.createStore(this.newStore);
      this.state.showToast('Store Created', `Registered new store center: ${this.newStore.name}`, 'success');
      this.showAddStoreModal = false;
      this.newStore = { name: '', city: 'Málaga', address: '', phone: '', initial_cash_float: 150 };
      await this.loadStoresList();
    } catch (err) {
      this.state.showToast('Error', 'Failed to create store center', 'danger');
    }
  }

  async deactivateStore(id: number) {
    try {
      await this.api.deleteStore(id);
      this.state.showToast('Store Removed', 'Store center deactivated', 'warning');
      await this.loadStoresList();
    } catch (err) {
      this.state.showToast('Error', 'Failed to remove store center', 'danger');
    }
  }

  async saveSetting(key: string, value: any) {
    try {
      await this.api.updateSetting(key, value);
      this.state.showToast('Setting Saved', `Updated ${key}`, 'success');
    } catch (err) {
      this.state.showToast('Error', 'Failed to save setting', 'danger');
    }
  }
}
