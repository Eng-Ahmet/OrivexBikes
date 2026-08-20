import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

export interface AdminFleetCategoryGroup {
  id: string;
  title: string;
  subcategory: string;
  total_count: number;
  available_count: number;
  rate_20m?: string;
  rate_30m?: string;
  rate_1h?: string;
  rate_2h?: string;
  rate_5h?: string;
  rate_1d: string;
  rate_3d_plus?: string;
  deposit: string;
  serials: string[];
}

@Component({
  selector: 'app-fleet-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Action Bar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-layer-group fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('fleet') }} Inventory Management</h3>
            <p class="text-secondary small mb-0">
              Official physical inventory units for <strong class="text-info">{{ getStoreName(state.activeStoreId()) }}</strong> grouped by category cards
            </p>
          </div>
        </div>

        <!-- Top Right Filter Action Controls -->
        <div class="d-flex align-items-center flex-wrap gap-2">
          <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
            <i class="fa-solid fa-store me-1 text-warning"></i> Store: {{ getStoreName(state.activeStoreId()) }}
          </div>

          <button class="btn btn-outline-info btn-sm rounded-pill px-3 shadow-sm text-white" (click)="openTariffMatrix()">
            <i class="fa-solid fa-tags me-1 text-white"></i> View Tariff Matrix
          </button>

          <select class="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3" style="width: auto;" [(ngModel)]="selectedCategory" (change)="filterCategories()">
            <option value="ALL">All Categories</option>
            <option value="Scooters">Scooters</option>
            <option value="E-Bikes">E-Bikes</option>
            <option value="Bikes">Bicycles</option>
            <option value="Cars">XL Cars & Buggies</option>
          </select>
        </div>
      </div>

      <!-- 3-Column Fleet Category Cards Grid -->
      <div class="row g-4">
        @for (group of filteredGroups(); track group.id) {
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card border rounded-4 p-4 h-100 shadow-sm transition d-flex flex-column" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <!-- Card Header -->
              <div class="d-flex align-items-start justify-content-between mb-1">
                <div>
                  <h4 class="fw-bold text-white mb-0 font-heading">{{ group.title }}</h4>
                  <span class="text-secondary small d-block mb-2">{{ group.subcategory }}</span>
                </div>
                <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 rounded-pill px-3 py-2 fw-bold">
                  {{ group.available_count }}/{{ group.total_count }} Available
                </span>
              </div>

              <!-- Rates Box (Dark Inset Container) -->
              <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 mb-3">
                @if (group.rate_20m) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">20 Min Rate:</span>
                    <strong class="text-info">€{{ group.rate_20m }}</strong>
                  </div>
                }
                @if (group.rate_30m) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">30 Min Rate:</span>
                    <strong class="text-info">€{{ group.rate_30m }}</strong>
                  </div>
                }
                @if (group.rate_1h) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">1 Hour Rate:</span>
                    <strong class="text-success">€{{ group.rate_1h }}</strong>
                  </div>
                }
                @if (group.rate_2h) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">2 Hours Rate:</span>
                    <strong class="text-white">€{{ group.rate_2h }}</strong>
                  </div>
                }
                @if (group.rate_5h) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">5 Hours Rate:</span>
                    <strong class="text-white">€{{ group.rate_5h }}</strong>
                  </div>
                }
                @if (group.rate_1d !== '—') {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">1 Day Rate:</span>
                    <strong class="text-primary">€{{ group.rate_1d }}</strong>
                  </div>
                }
                @if (group.rate_3d_plus) {
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">+3 Days Rate:</span>
                    <strong class="text-light">{{ group.rate_3d_plus }}</strong>
                  </div>
                }
                <div class="d-flex justify-content-between small border-top border-secondary border-opacity-25 pt-1 mt-1">
                  <span class="text-secondary">deposit (Fianza)</span>
                  <strong class="text-warning">€{{ group.deposit }}</strong>
                </div>
              </div>

              <!-- Frame / Serial Unit Tag Pills (Green Tags) -->
              <div class="d-flex flex-wrap gap-1 mb-4">
                @for (ser of group.serials; track ser) {
                  <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 font-mono py-1 px-2" style="font-size: 0.7rem; font-weight: 600;">
                    {{ ser }}
                  </span>
                }
              </div>

              <!-- Primary Rent Action Button -->
              <button class="btn btn-primary btn-lg w-100 rounded-pill mt-auto shadow-sm fw-bold py-2 text-white" (click)="openNewContractModal(group)">
                <i class="fa-solid fa-key me-2 text-white"></i> Rent Vehicle ({{ group.available_count }} Available)
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class FleetPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  selectedCategory = 'ALL';

  malagaGroups: AdminFleetCategoryGroup[] = [
    { id: 'etwow', title: 'Patinetes Etwow (4 Units)', subcategory: 'Scooters', total_count: 4, available_count: 4, rate_30m: '10.00', rate_1h: '15.00', rate_2h: '20.00', rate_1d: '40.00', rate_3d_plus: '30.00 €/día', deposit: '50.00', serials: ['QQ-ETW-01', 'QQ-ETW-02', 'QQ-ETW-03', 'QQ-ETW-04'] },
    { id: 'ninebot', title: 'Patinetes Ninebot (4 Units)', subcategory: 'Scooters', total_count: 4, available_count: 4, rate_30m: '10.00', rate_1h: '15.00', rate_2h: '20.00', rate_1d: '40.00', rate_3d_plus: '30.00 €/día', deposit: '50.00', serials: ['QQ-NIN-01', 'QQ-NIN-02', 'QQ-NIN-03', 'QQ-NIN-04'] },
    { id: 'ebikes_visa', title: 'E-Bikes VISA (8 Units)', subcategory: 'E-Bikes (VISA)', total_count: 8, available_count: 8, rate_1h: '15.00', rate_2h: '20.00', rate_5h: '25.00', rate_1d: '40.00', rate_3d_plus: '30.00 €/día', deposit: '100.00', serials: ['QQ-EB-01', 'QQ-EB-02', 'QQ-EB-03', 'QQ-EB-04', 'QQ-EB-05', 'QQ-EB-06', 'QQ-EB-07', 'QQ-EB-08'] },
    { id: 'quads', title: 'Quads / S-Cars (4 Units)', subcategory: 'S cars/Quads', total_count: 4, available_count: 4, rate_20m: '10.00', rate_30m: '15.00', rate_1h: '25.00', rate_1d: '50.00', deposit: '20.00', serials: ['QQ-QD-01', 'QQ-QD-02', 'QQ-QD-03', 'QQ-QD-04'] },
    { id: 'xl_cars', title: 'XL Cars & Jeep (6 Units)', subcategory: 'XL Cars', total_count: 6, available_count: 6, rate_20m: '15.00', rate_30m: '20.00', rate_1h: '30.00', rate_1d: '60.00', deposit: '20.00', serials: ['QQ-XL-01', 'QQ-XL-02', 'QQ-XL-03', 'QQ-XL-04', 'QQ-XL-05', 'QQ-JEP-01'] },
    { id: 'buggys', title: "Buggy's Azul & Rojo (4 Units)", subcategory: "Buggy's", total_count: 4, available_count: 4, rate_30m: '5.00', rate_1h: '25.00', rate_1d: '50.00', deposit: '20.00', serials: ['QQ-BUG-AZ1', 'QQ-BUG-AZ2', 'QQ-BUG-RJ1', 'QQ-BUG-RJ2'] },
    { id: 'bicis_nino', title: 'Bicis Niño (2 Units)', subcategory: 'Bikes', total_count: 2, available_count: 2, rate_1h: '5.00', rate_5h: '15.00', rate_1d: '20.00', rate_3d_plus: '15.00 €/día', deposit: '30.00', serials: ['QQ-BCN-01', 'QQ-BCN-02'] },
    { id: 'quert_bikes', title: 'Quert Bicycles (10 Units)', subcategory: 'Bikes', total_count: 10, available_count: 10, rate_1h: '5.00', rate_5h: '15.00', rate_1d: '20.00', rate_3d_plus: '15.00 €/día', deposit: '30.00', serials: ['QQ-QRT-01', 'QQ-QRT-02', 'QQ-QRT-03', 'QQ-QRT-04', 'QQ-QRT-05', 'QQ-QRT-06', 'QQ-QRT-07', 'QQ-QRT-08', 'QQ-QRT-09', 'QQ-QRT-10'] },
    { id: 'altec_bikes', title: 'Altec Bicycles (8 Units)', subcategory: 'Bikes', total_count: 8, available_count: 8, rate_1h: '5.00', rate_5h: '15.00', rate_1d: '20.00', rate_3d_plus: '15.00 €/día', deposit: '30.00', serials: ['QQ-ALT-01', 'QQ-ALT-02', 'QQ-ALT-03', 'QQ-ALT-04', 'QQ-ALT-05', 'QQ-ALT-06', 'QQ-ALT-07', 'QQ-ALT-08'] }
  ];

  mijasGroups: AdminFleetCategoryGroup[] = [
    { id: 'mijas_ebikes', title: 'E-Bikes Trekking (6 Units)', subcategory: 'E-Bikes (Trekking)', total_count: 6, available_count: 6, rate_1h: '15.00', rate_2h: '25.00', rate_5h: '30.00', rate_1d: '40.00', rate_3d_plus: '30.00 €/día', deposit: '100.00', serials: ['MJ-EBT-01', 'MJ-EBT-02', 'MJ-EBT-03', 'MJ-EBT-04', 'MJ-EBT-05', 'MJ-EBT-06'] },
    { id: 'mijas_mtb', title: 'MTB Mountain Bikes (5 Units)', subcategory: 'Bikes (MTB)', total_count: 5, available_count: 5, rate_1h: '7.00', rate_5h: '15.00', rate_1d: '25.00', rate_3d_plus: '20.00 €/día', deposit: '50.00', serials: ['MJ-MTB-01', 'MJ-MTB-02', 'MJ-MTB-03', 'MJ-MTB-04', 'MJ-MTB-05'] },
    { id: 'mijas_scooters', title: 'Offroad E-Scooters (4 Units)', subcategory: 'Scooters (Offroad)', total_count: 4, available_count: 4, rate_30m: '12.00', rate_1h: '18.00', rate_2h: '25.00', rate_1d: '45.00', rate_3d_plus: '35.00 €/día', deposit: '50.00', serials: ['MJ-OFF-01', 'MJ-OFF-02', 'MJ-OFF-03', 'MJ-OFF-04'] }
  ];

  activeGroups = signal<AdminFleetCategoryGroup[]>(this.malagaGroups);
  filteredGroups = signal<AdminFleetCategoryGroup[]>(this.malagaGroups);

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      const groups = storeId === 2 ? this.mijasGroups : this.malagaGroups;
      this.activeGroups.set(groups);
      this.filterCategories();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.filterCategories();
  }

  getStoreName(id: number): string {
    return id === 2 ? 'Camping Mijas Resort' : 'Málaga Central Beach';
  }

  filterCategories() {
    const current = this.activeGroups();
    if (this.selectedCategory === 'ALL') {
      this.filteredGroups.set(current);
    } else {
      const filtered = current.filter(g => g.subcategory.toLowerCase().includes(this.selectedCategory.toLowerCase()));
      this.filteredGroups.set(filtered.length ? filtered : current);
    }
  }

  openTariffMatrix() {
    window.location.hash = '#/tariffs';
  }

  openNewContractModal(group?: AdminFleetCategoryGroup) {
    const modalEl = document.getElementById('newContractModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}
