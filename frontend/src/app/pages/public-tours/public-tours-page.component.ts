import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-tours-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <!-- Header Banner -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <span class="badge bg-info text-dark fw-bold px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-compass me-1"></i> Guided Experiences
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Guided Coastal & Cultural Tours</h1>
        <p class="text-secondary lead mb-0">Explore Málaga, Torremolinos, and Mijas with expert local guides. E-bikes & helmets included.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <p class="text-secondary mt-3">Loading available guided tours...</p>
      </div>

      <!-- Tours Grid -->
      <div *ngIf="!loading" class="row g-4">
        <div *ngFor="let tour of tours" class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-secondary-subtle rounded-4 h-100 shadow-sm hover-shadow transition overflow-hidden">
            <div class="position-relative bg-secondary bg-opacity-10 text-center p-4">
              <span class="badge bg-primary position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                <i class="fa-solid fa-clock me-1"></i> {{ tour.duration_hours }} Hours
              </span>
              <span class="badge bg-success position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">
                €{{ tour.price_per_person }}/person
              </span>
              <i class="fa-solid fa-person-biking fa-5x text-info my-3"></i>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <h4 class="card-title fw-bold text-white mb-2">{{ tour.title }}</h4>
              <p class="text-secondary small mb-4 flex-grow-1">{{ tour.description }}</p>

              <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4 text-secondary small">
                <div class="d-flex justify-content-between mb-1">
                  <span>Departure Store:</span>
                  <strong class="text-white">{{ tour.store_name }}</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Max Group Size:</span>
                  <strong class="text-white">{{ tour.max_participants || 10 }} Bikers</strong>
                </div>
              </div>

              <a [routerLink]="['/tours', tour.id]" class="btn btn-info text-dark fw-bold rounded-pill w-100 shadow-sm">
                <i class="fa-solid fa-calendar-check me-1"></i> Book Tour Experience
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicToursPageComponent implements OnInit {
  private http = inject(HttpClient);
  tours: any[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<any[]>('/api/v1/public/tours').subscribe({
      next: (data) => {
        this.tours = (Array.isArray(data) && data.length > 0) ? data : this.getFallbackTours();
        this.loading = false;
      },
      error: () => {
        this.tours = this.getFallbackTours();
        this.loading = false;
      }
    });
  }

  private getFallbackTours() {
    return [
      { id: 1, title: 'Málaga Historic Coast & Tapas Tour', duration_hours: 3, price_per_person: 35, store_name: 'Málaga Beach Store', max_participants: 12, description: 'Guided E-bike ride through Port of Málaga, Alcazaba, and beach promenade with authentic local tapas stop.' },
      { id: 2, title: 'Mijas Village & Mountain Panorama', duration_hours: 4, price_per_person: 45, store_name: 'Mijas Coastal Resort', max_participants: 8, description: 'Scenic mountain climb tour on powerful E-Bikes featuring Mediterranean panoramic views.' },
      { id: 3, title: 'Sunset Promenade & Beach Ride', duration_hours: 2, price_per_person: 25, store_name: 'Málaga Beach Store', max_participants: 15, description: 'Relaxed golden hour coastal ride along Málaga beaches with complimentary refreshment.' }
    ];
  }
}
