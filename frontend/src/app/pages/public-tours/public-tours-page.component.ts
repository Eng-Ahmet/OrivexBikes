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
      <!-- Banner -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-info text-dark fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="fa-solid fa-person-biking me-1"></i> Expert Local Guides
            </span>
            <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Guided Tours & E-Bike Safaris</h1>
            <p class="text-secondary lead mb-0">Discover Málaga's coastline, historic Alcazaba, and mountain trails with expert guides.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-info text-dark fw-bold btn-lg rounded-pill px-4 shadow">
              <i class="fa-solid fa-calendar-check me-2"></i> Reserve Tour Seat
            </a>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <p class="text-secondary mt-3">Loading tour experiences...</p>
      </div>

      <!-- Tours Grid -->
      <div *ngIf="!loading && tours.length > 0" class="row g-4">
        <div *ngFor="let tour of tours" class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-secondary-subtle rounded-4 h-100 shadow-sm hover-shadow transition overflow-hidden">
            <div class="position-relative bg-secondary bg-opacity-10 text-center p-4">
              <span class="badge bg-primary position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                {{ tour.duration_hours }} Hours Guided
              </span>
              <span class="badge bg-dark border border-secondary position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white">
                €{{ tour.price_per_person }}/person
              </span>
              <i class="fa-solid fa-map-location-dot fa-4x text-info my-4"></i>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-info small fw-bold text-uppercase">{{ tour.category }}</span>
                <span class="text-warning small"><i class="fa-solid fa-star me-1"></i> {{ tour.rating }} ({{ tour.review_count }})</span>
              </div>

              <h4 class="card-title fw-bold text-white mb-2">{{ tour.title }}</h4>
              <p class="text-secondary small mb-3">{{ tour.description }}</p>

              <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4 mt-auto">
                <div class="d-flex align-items-center text-secondary small mb-2">
                  <i class="fa-solid fa-location-dot me-2 text-danger"></i> {{ tour.location }}
                </div>
                <div class="d-flex align-items-center text-secondary small">
                  <i class="fa-solid fa-users me-2 text-success"></i> Max {{ tour.max_capacity }} participants per group
                </div>
              </div>

              <div class="d-flex gap-2">
                <a [routerLink]="['/tours', tour.id]" class="btn btn-outline-light btn-sm rounded-pill flex-grow-1">
                  <i class="fa-solid fa-circle-info me-1"></i> Itinerary
                </a>
                <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR', tourId: tour.id}" class="btn btn-info btn-sm rounded-pill text-dark fw-bold flex-grow-1">
                  <i class="fa-solid fa-calendar-check me-1"></i> Book Tour
                </a>
              </div>
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
        this.tours = data;
        this.loading = false;
      },
      error: () => {
        this.tours = [];
        this.loading = false;
      }
    });
  }
}
