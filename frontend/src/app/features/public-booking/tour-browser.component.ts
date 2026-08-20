import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingApiService, PublicTour } from './services/booking-api.service';
import { BookingStateService } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-tour-browser',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-secondary mt-2">Loading available tours...</p>
      </div>
    } @else {
      <div class="row g-4">
        @for (tour of tours(); track tour.id) {
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-secondary bg-opacity-10 border-secondary-subtle rounded-4 h-100 p-0 overflow-hidden shadow-sm hover-shadow transition">
              <!-- Tour Badge & Price Header -->
              <div class="position-relative bg-dark bg-gradient p-4 border-bottom border-secondary">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-info text-dark fw-bold px-3 py-1 rounded-pill shadow-sm">
                    <i class="fa-solid fa-clock me-1 text-dark"></i> {{ tour.duration_hours }} Hours
                  </span>
                  <span class="text-warning fw-bold small">
                    <i class="fa-solid fa-star me-1"></i> {{ tour.rating }} ({{ tour.review_count }})
                  </span>
                </div>

                <h4 class="fw-bold text-white mb-2">{{ tour.title }}</h4>
                <p class="text-secondary small mb-3"><i class="fa-solid fa-location-dot me-1 text-danger"></i> {{ tour.location }}</p>

                <div class="d-flex align-items-baseline gap-1">
                  <span class="fs-2 fw-bold text-success">€{{ tour.price_per_person }}</span>
                  <span class="text-secondary small">/ person</span>
                </div>
              </div>

              <!-- Tour Description & Highlights -->
              <div class="card-body p-4 d-flex flex-column">
                <p class="text-secondary small mb-3" style="min-height: 48px;">{{ tour.description }}</p>

                <h6 class="fw-bold text-light small mb-2"><i class="fa-solid fa-check-double text-info me-1"></i> Highlights</h6>
                <ul class="list-unstyled text-secondary small mb-4">
                  @for (h of tour.highlights; track h) {
                    <li class="mb-1 d-flex align-items-center gap-2">
                      <i class="fa-solid fa-circle-check text-success" style="font-size: 0.75rem;"></i> {{ h }}
                    </li>
                  }
                </ul>

                <button class="btn btn-primary btn-lg w-100 rounded-pill mt-auto shadow-sm" (click)="selectTour(tour)">
                  <i class="fa-solid fa-calendar-check me-2"></i> Book This Tour
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class TourBrowserComponent implements OnInit {
  api = inject(BookingApiService);
  state = inject(BookingStateService);
  i18n = inject(I18nService);

  tours = signal<PublicTour[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const data = await this.api.getTours();
      this.tours.set(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  selectTour(tour: PublicTour) {
    this.state.selectItemAndContinue('TOUR', tour);
  }
}
