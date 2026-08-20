import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStateService, BookingMode } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-2 shadow-sm mb-4">
      <div class="row g-2 text-center">
        <div class="col-6">
          <button class="btn w-100 py-3 rounded-3 transition d-flex align-items-center justify-content-center gap-2"
                  [class.btn-primary]="state.bookingMode() === 'TOUR'"
                  [class.btn-outline-secondary]="state.bookingMode() !== 'TOUR'"
                  (click)="state.bookingMode.set('TOUR')">
            <i class="fa-solid fa-person-biking fa-lg"></i>
            <div class="text-start">
              <div class="fw-bold">Tours & Experiences</div>
              <div class="small opacity-75 d-none d-sm-block">Guided city & coastal rides</div>
            </div>
          </button>
        </div>
        <div class="col-6">
          <button class="btn w-100 py-3 rounded-3 transition d-flex align-items-center justify-content-center gap-2"
                  [class.btn-primary]="state.bookingMode() === 'FLEET'"
                  [class.btn-outline-secondary]="state.bookingMode() !== 'FLEET'"
                  (click)="state.bookingMode.set('FLEET')">
            <i class="fa-solid fa-bolt fa-lg"></i>
            <div class="text-start">
              <div class="fw-bold">Bikes & Scooters</div>
              <div class="small opacity-75 d-none d-sm-block">Self-guided vehicle rentals</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModeSelectorComponent {
  state = inject(BookingStateService);
  i18n = inject(I18nService);
}
