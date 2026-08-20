import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingApiService, PublicFleetCategory } from './services/booking-api.service';
import { BookingStateService } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-fleet-browser',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-secondary mt-2">Checking available fleet...</p>
      </div>
    } @else {
      <div class="row g-4">
        @for (item of fleet(); track item.category) {
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-secondary bg-opacity-10 border-secondary-subtle rounded-4 h-100 p-4 shadow-sm hover-shadow transition d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 56px; height: 56px;">
                  <i class="fa-solid fa-xl text-white" [ngClass]="item.icon"></i>
                </div>

                <span class="badge rounded-pill px-3 py-2" [class.bg-success]="item.available_count > 0" [class.bg-warning]="item.available_count === 0">
                  <i class="fa-solid fa-circle-check me-1"></i> Available: {{ item.available_count }}
                </span>
              </div>

              <h4 class="fw-bold text-white mb-2">{{ item.display_name }}</h4>
              <p class="text-secondary small mb-3">High-performance rental vehicle, fully inspected and charged.</p>

              <div class="row g-2 mb-4 bg-dark bg-opacity-50 p-3 rounded-3 text-center">
                <div class="col-6">
                  <span class="text-muted d-block small">Daily Rate</span>
                  <strong class="text-success fs-5">€{{ item.daily_rate }}</strong>
                  <span class="text-muted d-block" style="font-size: 0.7rem;">/ 24 hours</span>
                </div>
                <div class="col-6">
                  <span class="text-muted d-block small">Deposit</span>
                  <strong class="text-primary fs-5">€{{ item.deposit_amount }}</strong>
                  <span class="text-muted d-block" style="font-size: 0.7rem;">Refundable</span>
                </div>
              </div>

              <button class="btn btn-primary btn-lg w-100 rounded-pill mt-auto shadow-sm"
                      [disabled]="item.available_count === 0"
                      (click)="selectFleet(item)">
                <i class="fa-solid fa-calendar-days me-2"></i> Rent {{ item.display_name }}
              </button>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class FleetBrowserComponent implements OnInit {
  api = inject(BookingApiService);
  state = inject(BookingStateService);
  i18n = inject(I18nService);

  fleet = signal<PublicFleetCategory[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const data = await this.api.getFleetCategories();
      this.fleet.set(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  selectFleet(item: PublicFleetCategory) {
    this.state.selectItemAndContinue('FLEET', item);
  }
}
