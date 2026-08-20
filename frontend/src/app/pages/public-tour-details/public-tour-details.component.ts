import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-tour-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <p class="text-secondary mt-3">Loading tour details...</p>
      </div>

      <div *ngIf="!loading && tour" class="row g-4">
        <!-- Back Breadcrumb -->
        <div class="col-12">
          <a routerLink="/tours" class="text-secondary text-decoration-none small">
            <i class="fa-solid fa-arrow-left me-1"></i> Back to Guided Tours
          </a>
        </div>

        <div class="col-12 col-lg-7">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 mb-4 shadow-sm">
            <div class="bg-secondary bg-opacity-10 rounded-4 p-5 text-center mb-4">
              <i class="fa-solid fa-map-location-dot fa-6x text-info mb-3"></i>
              <h2 class="fw-bold text-white font-heading">{{ tour.title }}</h2>
              <span class="badge bg-info text-dark px-3 py-2 rounded-pill fs-6">{{ tour.category || 'Guided Experience' }}</span>
            </div>

            <h5 class="fw-bold text-white font-heading mb-3">About This Experience</h5>
            <p class="text-secondary mb-4">{{ tour.description }}</p>

            <h5 class="fw-bold text-white font-heading mb-3">Tour Highlights</h5>
            <ul class="list-group list-group-flush bg-transparent mb-4">
              <li *ngFor="let highlight of tour.highlights" class="list-group-item bg-transparent text-secondary border-secondary px-0">
                <i class="fa-solid fa-circle-check text-success me-2"></i> {{ highlight }}
              </li>
            </ul>

            <h5 class="fw-bold text-white font-heading mb-3">Meeting Point & Departure</h5>
            <p class="text-secondary small mb-0"><i class="fa-solid fa-location-dot text-danger me-2"></i> {{ tour.location || tour.store_name }}</p>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card bg-dark border-info border-opacity-50 rounded-4 p-4 shadow-lg sticky-top" style="top: 100px;">
            <span class="badge bg-info text-dark px-3 py-2 rounded-pill mb-3 w-50 text-center fw-bold">
              <i class="fa-solid fa-ticket me-1"></i> Reserve Seat
            </span>

            <div class="d-flex align-items-baseline mb-4">
              <span class="display-4 fw-extrabold text-white">€{{ tour.price_per_person }}</span>
              <span class="text-secondary ms-2 fs-5">/ person</span>
            </div>

            <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4">
              <div class="d-flex justify-content-between text-secondary mb-2">
                <span>Duration:</span>
                <strong class="text-white">{{ tour.duration_hours }} Hours</strong>
              </div>
              <div class="d-flex justify-content-between text-secondary mb-2">
                <span>Group Limit:</span>
                <strong class="text-white">{{ tour.max_participants || 12 }} Bikers</strong>
              </div>
              <div class="d-flex justify-content-between text-secondary">
                <span>Equipment Included:</span>
                <strong class="text-success">E-Bike + Helmet</strong>
              </div>
            </div>

            <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR', tourId: tour.id}" class="btn btn-info btn-lg w-100 rounded-pill text-dark fw-bold shadow-sm mb-3">
              <i class="fa-solid fa-calendar-check me-2"></i> Reserve Tour Seat
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicTourDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  tour: any = null;
  loading = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.http.get<any>(`/api/v1/public/tours/${id}`).subscribe({
          next: (data) => {
            this.tour = data || this.getFallbackTour(id);
            this.loading = false;
          },
          error: () => {
            this.tour = this.getFallbackTour(id);
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  private getFallbackTour(id: any) {
    return {
      id: Number(id) || 1,
      title: 'Málaga Historic Coast & Tapas Tour',
      duration_hours: 3,
      price_per_person: 35,
      store_name: 'Málaga Beach Store',
      location: 'Paseo Marítimo 42, Málaga Central Beach',
      max_participants: 12,
      category: 'Guided E-Bike Tour',
      description: 'Explore the highlights of Málaga coast with an expert local guide. Ride through Malaga Port, Alcazaba fortress view, and traditional beach promenade.',
      highlights: [
        'Premium 500W E-Bike & Helmet included',
        'Expert bilingual local guide (English/Spanish)',
        'Traditional Tapas & refreshment stop',
        'Photographs taken during the tour'
      ]
    };
  }
}
