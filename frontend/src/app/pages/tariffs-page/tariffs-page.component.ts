import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';

export interface OfficialTariffRow {
  vehicle: string;
  icon: string;
  deposit: string;
  min20: string;
  min30: string;
  h1: string;
  h2: string;
  h5: string;
  d1: string;
  d3_plus: string;
  w1_plus: string;
  w2_plus: string;
}

@Component({
  selector: 'app-tariffs-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-tags fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('tariffs') }} Matrix & Rate Sheet</h3>
            <p class="text-secondary small mb-0">Official Store Tariff Matrix fetched dynamically for <strong class="text-info">{{ getStoreName(selectedStoreId()) }}</strong></p>
          </div>
        </div>

        <div class="d-flex align-items-center flex-wrap gap-2">
          <!-- Dynamic Store Selector (ADMIN ONLY) -->
          @if (state.activeRole() === 'ADMIN') {
            <div class="btn-group btn-group-sm rounded-pill p-1 bg-dark border border-secondary">
              @for (st of stores(); track st.id) {
                <button class="btn btn-sm rounded-pill px-3 text-white"
                        [class.btn-info]="selectedStoreId() === st.id"
                        [class.btn-dark]="selectedStoreId() !== st.id"
                        (click)="setStoreView(st.id)">
                  <i class="fa-solid fa-store me-1 text-white"></i> {{ st.name }}
                </button>
              }
            </div>
          } @else {
            <!-- Locked Store Badge for Employee -->
            <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
              <i class="fa-solid fa-lock text-warning me-1"></i> Assigned Store: {{ getStoreName(selectedStoreId()) }}
            </div>
          }
        </div>
      </div>

      <!-- Store Tariff Matrix Table Card -->
      <div class="card border rounded-4 p-4 shadow-sm mb-4" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
          <h5 class="fw-bold text-white mb-0 font-heading">
            <i class="fa-solid fa-table me-2 text-info"></i> {{ getStoreName(selectedStoreId()) }} Rate Matrix
          </h5>
          <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 rounded-pill px-3 py-1 fw-bold">
            Active Store Tariff
          </span>
        </div>

        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 text-center border-secondary">
            <thead>
              <tr class="text-secondary text-uppercase small" style="font-size: 0.75rem;">
                <th class="text-start">Vehicle Category</th>
                <th>Depósito</th>
                <th>20 min</th>
                <th>30 min</th>
                <th>1 hora</th>
                <th>2 horas</th>
                <th>5 horas</th>
                <th>1 día</th>
                <th>+3 días</th>
                <th>+1 semana</th>
                <th>+2 semanas</th>
              </tr>
            </thead>
            <tbody>
              @for (row of activeMatrix(); track row.vehicle) {
                <tr>
                  <td class="text-start fw-bold text-white">
                    <i [class]="row.icon + ' me-2'"></i> {{ row.vehicle }}
                  </td>
                  <td class="fw-bold text-warning">{{ row.deposit }}</td>
                  <td [class.text-muted]="row.min20 === '—'" [class.fw-bold]="row.min20 !== '—'" [class.text-info]="row.min20 !== '—'">{{ row.min20 }}</td>
                  <td [class.text-muted]="row.min30 === '—'" [class.fw-bold]="row.min30 !== '—'" [class.text-info]="row.min30 !== '—'">{{ row.min30 }}</td>
                  <td [class.text-muted]="row.h1 === '—'" [class.fw-bold]="row.h1 !== '—'" [class.text-success]="row.h1 !== '—'">{{ row.h1 }}</td>
                  <td [class.text-muted]="row.h2 === '—'" [class.fw-bold]="row.h2 !== '—'" [class.text-white]="row.h2 !== '—'">{{ row.h2 }}</td>
                  <td [class.text-muted]="row.h5 === '—'" [class.fw-bold]="row.h5 !== '—'" [class.text-white]="row.h5 !== '—'">{{ row.h5 }}</td>
                  <td [class.text-muted]="row.d1 === '—'" [class.fw-bold]="row.d1 !== '—'" [class.text-primary]="row.d1 !== '—'">{{ row.d1 }}</td>
                  <td [class.text-muted]="row.d3_plus === '—'" [class.small]="row.d3_plus !== '—'" [class.text-light]="row.d3_plus !== '—'">{{ row.d3_plus }}</td>
                  <td [class.text-muted]="row.w1_plus === '—'" [class.small]="row.w1_plus !== '—'" [class.text-light]="row.w1_plus !== '—'">{{ row.w1_plus }}</td>
                  <td [class.text-muted]="row.w2_plus === '—'" [class.small]="row.w2_plus !== '—'" [class.text-light]="row.w2_plus !== '—'">{{ row.w2_plus }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TariffsPageComponent implements OnInit {
  i18n = inject(I18nService);
  state = inject(StateService);
  api = inject(ApiService);

  malagaDefault: OfficialTariffRow[] = [
    { vehicle: 'Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '30 €', min20: '—', min30: '—', h1: '5 €', h2: '—', h5: '15 €', d1: '20 €', d3_plus: '15 €/día', w1_plus: '10 €/día', w2_plus: '8 €/día' },
    { vehicle: 'E-Bikes (VISA)', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '20 €', h5: '25 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '10 €', h1: '15 €', h2: '20 €', h5: '—', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'XL Cars', icon: 'fa-solid fa-truck text-danger', deposit: '20 €', min20: '15 €', min30: '20 €', h1: '30 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'S cars/Quads', icon: 'fa-solid fa-car text-info', deposit: '20 €', min20: '10 €', min30: '15 €', h1: '25 €', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' },
    { vehicle: 'Buggy\'s', icon: 'fa-solid fa-motorcycle text-warning', deposit: '20 €', min20: '—', min30: '5 €', h1: '—', h2: '—', h5: '—', d1: '—', d3_plus: '—', w1_plus: '—', w2_plus: '—' }
  ];

  mijasDefault: OfficialTariffRow[] = [
    { vehicle: 'E-Bike Trekking', icon: 'fa-solid fa-bolt text-warning', deposit: '100 €', min20: '—', min30: '—', h1: '15 €', h2: '25 €', h5: '30 €', d1: '40 €', d3_plus: '30 €/día', w1_plus: '25 €/día', w2_plus: '20 €/día' },
    { vehicle: 'MTB Mountain Bikes', icon: 'fa-solid fa-bicycle text-primary', deposit: '50 €', min20: '—', min30: '—', h1: '7 €', h2: '—', h5: '15 €', d1: '25 €', d3_plus: '20 €/día', w1_plus: '15 €/día', w2_plus: '12 €/día' },
    { vehicle: 'Offroad E-Scooters', icon: 'fa-solid fa-bolt-lightning text-success', deposit: '50 €', min20: '—', min30: '12 €', h1: '18 €', h2: '25 €', h5: '—', d1: '45 €', d3_plus: '35 €/día', w1_plus: '28 €/día', w2_plus: '22 €/día' }
  ];

  stores = signal<any[]>([]);
  selectedStoreId = signal<number | null>(1);
  activeMatrix = signal<OfficialTariffRow[]>(this.malagaDefault);

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      this.selectedStoreId.set(storeId);
      untracked(() => {
        this.loadStores();
        this.loadTariffs();
      });
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    await this.loadStores();
    await this.loadTariffs();
  }

  async loadStores() {
    try {
      const res = await this.api.getStores();
      if (res && res.length) {
        this.stores.set(res);
        this.state.stores.set(res);
      }
    } catch (err) {
      // Fallback
    }
  }

  async loadTariffs() {
    try {
      const storeId = this.selectedStoreId() || 1;
      const res: any = await this.api.getTariffs(storeId);
      if (res && res.matrix && res.matrix.length) {
        this.activeMatrix.set(res.matrix);
      } else {
        this.activeMatrix.set(this.selectedStoreId() === 2 ? this.mijasDefault : this.malagaDefault);
      }
    } catch (err) {
      this.activeMatrix.set(this.selectedStoreId() === 2 ? this.mijasDefault : this.malagaDefault);
    }
  }

  getStoreName(id: number | null): string {
    return this.state.getStoreName(id);
  }

  setStoreView(id: number | null) {
    if (this.state.activeRole() === 'EMPLOYEE') return;
    this.state.setActiveStore(id);
  }
}
