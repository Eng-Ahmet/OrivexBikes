import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-locations-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <span class="badge bg-success px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-store me-1"></i> Málaga Coast Store Hubs
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Our Store Locations</h1>
        <p class="text-secondary lead mb-0">Visit our rental hubs in Málaga Central Beach Promenade and Mijas Coastal Resort by Orivex Technology.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-secondary mt-3">Loading store locations...</p>
      </div>

      <!-- Stores List -->
      <div *ngIf="!loading" class="row g-4">
        <div *ngFor="let store of stores" class="col-12 col-md-6">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 h-100 shadow-sm hover-shadow transition">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                  <i class="fa-solid fa-store fa-xl"></i>
                </div>
                <div>
                  <h4 class="fw-bold text-white mb-0">{{ store.name }}</h4>
                  <span class="text-secondary small">{{ store.city }}</span>
                </div>
              </div>
              <span class="badge bg-success rounded-pill px-3 py-2">Open Daily</span>
            </div>

            <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4">
              <div class="d-flex align-items-center text-secondary small mb-2">
                <i class="fa-solid fa-location-dot me-2 text-danger"></i> {{ store.address }}
              </div>
              <div class="d-flex align-items-center text-secondary small mb-2">
                <i class="fa-solid fa-phone me-2 text-success"></i> {{ store.phone || '+34 952 000 111' }}
              </div>
              <div class="d-flex align-items-center text-secondary small mb-2">
                <i class="fa-solid fa-envelope me-2 text-primary"></i> {{ store.email || 'info@orivexbike.com' }}
              </div>
              <div class="d-flex align-items-center text-secondary small">
                <i class="fa-solid fa-clock me-2 text-warning"></i> {{ store.operating_hours || 'Mon-Sun: 09:00 - 21:00' }}
              </div>
            </div>

            <div class="mt-auto">
              <a [routerLink]="['/bikes']" [queryParams]="{store_id: store.id}" class="btn btn-primary w-100 rounded-pill shadow-sm fw-bold">
                <i class="fa-solid fa-bicycle me-2"></i> View Fleet & Book at {{ store.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicLocationsPageComponent implements OnInit {
  private http = inject(HttpClient);
  stores: any[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<any[]>('/api/v1/public/stores').subscribe({
      next: (data) => {
        this.stores = (Array.isArray(data) && data.length > 0) ? data : this.getFallbackStores();
        this.loading = false;
      },
      error: () => {
        this.stores = this.getFallbackStores();
        this.loading = false;
      }
    });
  }

  private getFallbackStores() {
    return [
      { id: 1, name: 'Málaga Beach Campsite Store', city: 'Málaga', address: 'Paseo Marítimo 42, 29016 Málaga', phone: '+34 952 000 111', email: 'malaga@orivexbike.com', operating_hours: '09:00 - 21:00 Daily' },
      { id: 2, name: 'Mijas Coastal Resort Store', city: 'Mijas', address: 'Calle Mar 15, 29649 Mijas Costa', phone: '+34 951 222 333', email: 'mijas@orivexbike.com', operating_hours: '09:00 - 20:00 Daily' }
    ];
  }
}
