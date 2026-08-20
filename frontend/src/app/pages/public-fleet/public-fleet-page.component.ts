import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface AggregatedVehicleModel {
  key: string;
  name: string;
  category: string;
  store_name: string;
  store_id?: number;
  hourly_rate: number;
  daily_rate: number;
  deposit_amount: number;
  available_count: number;
  total_count: number;
  representative_id: number;
  is_scooter: boolean;
  status: string;
}

@Component({
  selector: 'app-public-fleet-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid px-3 px-md-4 py-4 w-100">
      <!-- Header Banner -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle" style="background: #0f172a !important;">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="fa-solid fa-bolt me-1"></i> Quality Verified Fleet
            </span>
            <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Bikes & E-Scooters Catalog</h1>
            <p class="text-secondary lead mb-0">Browse our available vehicle models in Málaga & Mijas by Orivex Technology. Transparent rates & zero hidden fees.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a routerLink="/book" class="btn btn-primary btn-lg rounded-pill px-4 shadow">
              <i class="fa-solid fa-calendar-check me-2"></i> Book Online Now
            </a>
          </div>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card bg-dark border-secondary-subtle rounded-4 p-3 mb-4 shadow-sm" style="background: #111827 !important;">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-secondary small mb-1 fw-bold"><i class="fa-solid fa-store me-1 text-primary"></i> Pickup Location</label>
            <select class="form-select bg-dark text-white border-secondary rounded-3" [(ngModel)]="selectedStore" (change)="loadFleet()">
              <option value="">All Locations (Málaga & Mijas)</option>
              <option *ngFor="let s of stores()" [value]="s.id">{{ s.name }} ({{ s.city }})</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-secondary small mb-1 fw-bold"><i class="fa-solid fa-layer-group me-1 text-info"></i> Vehicle Category</label>
            <select class="form-select bg-dark text-white border-secondary rounded-3" [(ngModel)]="selectedCategory" (change)="loadFleet()">
              <option value="">All Categories</option>
              <option value="scooter">Electric Scooters (Patinetes)</option>
              <option value="ebike">E-Bikes / Electric Bikes</option>
              <option value="bike">Comfort City Bikes</option>
              <option value="quad">Quads / XL Cars</option>
            </select>
          </div>

          <div class="col-12 col-md-4 text-md-end">
            <button class="btn btn-outline-secondary btn-sm rounded-pill mt-md-4" (click)="resetFilters()">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading fleet...</span>
          </div>
          <p class="text-secondary mt-3">Loading live fleet inventory...</p>
        </div>
      } @else if (aggregatedFleet().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-5 bg-dark rounded-4 border border-secondary-subtle">
          <i class="fa-solid fa-bicycle fa-3x text-secondary mb-3"></i>
          <h4 class="text-white">No vehicle models found matching filters</h4>
          <p class="text-secondary mb-3">Try clearing your filters or selecting a different location.</p>
          <button class="btn btn-outline-primary rounded-pill px-4" (click)="resetFilters()">View All Vehicles</button>
        </div>
      } @else {
        <!-- Aggregated Fleet Models Grid -->
        <div class="row g-4">
          @for (model of aggregatedFleet(); track model.key) {
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card bg-dark border-secondary-subtle rounded-4 h-100 shadow-sm hover-shadow transition overflow-hidden" style="background: #111827 !important;">
                <div class="position-relative bg-secondary bg-opacity-10 text-center p-4">
                  <!-- Stock & Available Badge -->
                  <span class="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm" *ngIf="model.available_count > 0">
                    <i class="fa-solid fa-circle-check me-1"></i> {{ model.available_count }} Units Available
                  </span>
                  <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm" *ngIf="model.available_count === 0">
                    <i class="fa-solid fa-clock me-1"></i> Reserved
                  </span>
                  <span class="badge bg-dark border border-secondary position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white shadow-sm">
                    €{{ model.daily_rate }}/day
                  </span>

                  <!-- Vehicle Icon Rendering (Kick Scooter SVG for Patinete/Scooter vs Bicycle for Bikes) -->
                  <div class="d-flex align-items-center justify-content-center py-3">
                    <ng-container *ngIf="model.is_scooter; else bikeIcon">
                      <div class="p-3 bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="6" cy="18" r="2"/>
                          <circle cx="18" cy="18" r="2"/>
                          <path d="M8 18h8"/>
                          <path d="M18 16l-3-10H9"/>
                          <path d="M8 6h4"/>
                          <path d="M14 6l-1-3"/>
                        </svg>
                      </div>
                    </ng-container>
                    <ng-template #bikeIcon>
                      <div class="p-3 bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center">
                        <i class="fa-solid fa-bicycle fa-4x text-primary"></i>
                      </div>
                    </ng-template>
                  </div>
                </div>

                <div class="card-body p-4 d-flex flex-column">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-primary small fw-bold text-uppercase tracking-wider">{{ model.category }}</span>
                    <span class="text-secondary small"><i class="fa-solid fa-store me-1"></i> {{ model.store_name }}</span>
                  </div>

                  <h4 class="card-title fw-bold text-white mb-3">{{ model.name }}</h4>

                  <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4">
                    <div class="d-flex justify-content-between text-secondary small mb-1">
                      <span>Hourly Rate:</span>
                      <strong class="text-white">€{{ model.hourly_rate }}/hr</strong>
                    </div>
                    <div class="d-flex justify-content-between text-secondary small mb-1">
                      <span>Daily Rate:</span>
                      <strong class="text-white">€{{ model.daily_rate }}/day</strong>
                    </div>
                    <div class="d-flex justify-content-between text-secondary small">
                      <span>Security Deposit:</span>
                      <strong class="text-warning">€{{ model.deposit_amount }}</strong>
                    </div>
                  </div>

                  <div class="mt-auto d-flex gap-2">
                    <a [routerLink]="['/bikes', model.representative_id]" class="btn btn-outline-light btn-sm rounded-pill flex-grow-1">
                      <i class="fa-solid fa-circle-info me-1"></i> Details
                    </a>
                    <a [routerLink]="['/book']" [queryParams]="{vehicleId: model.representative_id}" class="btn btn-primary btn-sm rounded-pill flex-grow-1 fw-bold">
                      <i class="fa-solid fa-calendar-check me-1"></i> Book Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PublicFleetPageComponent implements OnInit {
  private http = inject(HttpClient);
  
  fleet = signal<any[]>([]);
  aggregatedFleet = signal<AggregatedVehicleModel[]>([]);
  stores = signal<any[]>([]);
  loading = signal<boolean>(true);

  selectedStore = '';
  selectedCategory = '';

  ngOnInit() {
    this.loadStores();
    this.loadFleet();
  }

  loadStores() {
    this.http.get<any[]>('/api/v1/public/stores').subscribe({
      next: (data) => {
        try {
          this.stores.set((Array.isArray(data) && data.length > 0) ? data : this.getFallbackStores());
        } catch {
          this.stores.set(this.getFallbackStores());
        }
      },
      error: () => this.stores.set(this.getFallbackStores())
    });
  }

  loadFleet() {
    this.loading.set(true);
    let url = '/api/v1/public/fleet?';
    if (this.selectedStore) url += `store_id=${this.selectedStore}&`;
    if (this.selectedCategory) url += `category=${this.selectedCategory}&`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        try {
          const raw = (Array.isArray(data) && data.length > 0) ? data : this.getFallbackFleet();
          this.fleet.set(raw);
          this.aggregatedFleet.set(this.aggregateFleetModels(raw));
        } catch (err) {
          console.error('Error handling fleet data:', err);
          const fallback = this.getFallbackFleet();
          this.fleet.set(fallback);
          this.aggregatedFleet.set(this.aggregateFleetModels(fallback));
        } finally {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.warn('Backend fleet HTTP request failed, loading fallback fleet items:', err);
        const fallback = this.getFallbackFleet();
        this.fleet.set(fallback);
        this.aggregatedFleet.set(this.aggregateFleetModels(fallback));
        this.loading.set(false);
      }
    });
  }

  /**
   * Groups individual physical vehicle items (e.g., Patinete Etwow #1, #2, #3...) into single Model cards with stock counts.
   */
  private aggregateFleetModels(rawFleet: any[]): AggregatedVehicleModel[] {
    const map = new Map<string, AggregatedVehicleModel>();

    for (const v of rawFleet) {
      const cleanName = (v.name || 'Vehicle').replace(/\s*#\d+$/i, '').trim();
      const cat = (v.category || 'General').trim();
      const storeName = v.store_name || 'Málaga Store';
      const key = `${cleanName}_${v.store_id || 0}_${cat}`;

      const catLower = cat.toLowerCase();
      const nameLower = cleanName.toLowerCase();
      const isScooter = catLower.includes('scooter') || catLower.includes('patinete') || nameLower.includes('patinete') || nameLower.includes('scooter');

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: cleanName,
          category: cat,
          store_name: storeName,
          store_id: v.store_id,
          hourly_rate: v.hourly_rate || 8,
          daily_rate: v.daily_rate || 25,
          deposit_amount: v.deposit_amount || 50,
          available_count: v.status === 'AVAILABLE' ? 1 : 0,
          total_count: 1,
          representative_id: v.id,
          is_scooter: isScooter,
          status: v.status || 'AVAILABLE'
        });
      } else {
        const existing = map.get(key)!;
        existing.total_count += 1;
        if (v.status === 'AVAILABLE') {
          existing.available_count += 1;
        }
      }
    }

    return Array.from(map.values());
  }

  resetFilters() {
    this.selectedStore = '';
    this.selectedCategory = '';
    this.loadFleet();
  }

  private getFallbackStores() {
    return [
      { id: 1, name: 'Málaga Beach Campsite Store', city: 'Málaga' },
      { id: 2, name: 'Mijas Coastal Resort Store', city: 'Mijas' }
    ];
  }

  private getFallbackFleet() {
    const list = [
      { id: 101, name: 'Patinete Etwow #1', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 50, status: 'AVAILABLE' },
      { id: 102, name: 'Patinete Etwow #2', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 50, status: 'AVAILABLE' },
      { id: 103, name: 'Patinete Etwow #3', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 50, status: 'AVAILABLE' },
      { id: 104, name: 'Patinete Ninebot #1', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 50, status: 'AVAILABLE' },
      { id: 105, name: 'Patinete Ninebot #2', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 50, status: 'AVAILABLE' },
      { id: 106, name: 'E-Bike City Cruiser #1', category: 'E-Bikes', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 100, status: 'AVAILABLE' },
      { id: 107, name: 'E-Bike City Cruiser #2', category: 'E-Bikes', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, deposit_amount: 100, status: 'AVAILABLE' },
      { id: 108, name: 'Xiaomi Pro 2 E-Scooter', category: 'Scooters', store_name: 'Mijas Coastal Hub', hourly_rate: 10, daily_rate: 28, deposit_amount: 80, status: 'AVAILABLE' }
    ];

    if (!this.selectedCategory) return list;

    const sel = this.selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
    return list.filter(v => {
      const vCat = v.category.toLowerCase().replace(/[^a-z0-9]/g, '');
      return vCat.includes(sel) || sel.includes(vCat);
    });
  }
}
