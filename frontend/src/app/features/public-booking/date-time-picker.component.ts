import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingApiService } from './services/booking-api.service';
import { BookingStateService } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm">
      <!-- Back Button & Selected Item Summary Header -->
      <div class="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary">
        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" (click)="state.currentStep.set('SELECT_ITEM')">
          <i class="fa-solid fa-arrow-left me-1"></i> Back to selection
        </button>

        <div class="text-end">
          <span class="badge bg-primary rounded-pill px-3 py-1 mb-1">
            {{ state.bookingMode() === 'TOUR' ? 'Guided Tour' : 'Vehicle Rental' }}
          </span>
          <h5 class="fw-bold text-white mb-0">
            {{ state.bookingMode() === 'TOUR' ? state.selectedTour()?.title : state.selectedFleet()?.display_name }}
          </h5>
        </div>
      </div>

      <div class="row g-4">
        <!-- Date Selection -->
        <div class="col-12 col-md-6">
          <label class="form-label text-light fw-bold mb-2"><i class="fa-solid fa-calendar me-2 text-primary"></i> Select Date</label>
          <input type="date" class="form-control form-control-lg bg-dark text-light border-secondary rounded-3"
                 [ngModel]="state.selectedDate()"
                 (ngModelChange)="onDateChange($event)"
                 [min]="minDate" />
        </div>

        <!-- Duration Picker (Only for FLEET mode) -->
        @if (state.bookingMode() === 'FLEET') {
          <div class="col-12 col-md-6">
            <label class="form-label text-light fw-bold mb-2"><i class="fa-solid fa-clock me-2 text-warning"></i> Rental Duration (Days)</label>
            <div class="input-group input-group-lg">
              <button class="btn btn-outline-secondary" (click)="decreaseDays()"><i class="fa-solid fa-minus"></i></button>
              <input type="number" class="form-control bg-dark text-light border-secondary text-center fw-bold" [ngModel]="state.durationDays()" readonly />
              <button class="btn btn-outline-secondary" (click)="increaseDays()"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        }

        <!-- Available Times / Slots -->
        <div class="col-12">
          <label class="form-label text-light fw-bold mb-2"><i class="fa-solid fa-business-time me-2 text-info"></i> Available Times</label>
          <div class="d-flex flex-wrap gap-2">
            @for (slot of timeSlots(); track slot.time) {
              <button class="btn btn-lg rounded-3 px-4 py-2 transition"
                      [class.btn-primary]="state.selectedTimeSlot() === slot.time"
                      [class.btn-outline-secondary]="state.selectedTimeSlot() !== slot.time"
                      (click)="state.selectedTimeSlot.set(slot.time)">
                <div class="fw-bold">{{ slot.time }}</div>
                <div class="small opacity-75" style="font-size: 0.75rem;">{{ slot.spots }} spots left</div>
              </button>
            }
          </div>
        </div>

        <!-- Participants / Quantity Counter -->
        <div class="col-12 col-md-6">
          <label class="form-label text-light fw-bold mb-2">
            <i class="fa-solid me-2 text-success" [class.fa-users]="state.bookingMode() === 'TOUR'" [class.fa-bicycle]="state.bookingMode() === 'FLEET'"></i>
            {{ state.bookingMode() === 'TOUR' ? 'Number of Participants' : 'Quantity of Vehicles' }}
          </label>
          <div class="input-group input-group-lg" style="max-width: 250px;">
            <button class="btn btn-outline-secondary" (click)="decreaseQty()"><i class="fa-solid fa-minus"></i></button>
            <input type="number" class="form-control bg-dark text-light border-secondary text-center fw-bold" [ngModel]="state.quantityOrParticipants()" readonly />
            <button class="btn btn-outline-secondary" (click)="increaseQty()"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <!-- Total Price Summary Box & Continue Button -->
        <div class="col-12 mt-4">
          <div class="card bg-secondary bg-opacity-10 border-secondary rounded-4 p-4 d-flex flex-row align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <span class="text-secondary small d-block">Estimated Total</span>
              <h2 class="fw-bold text-success mb-0">€{{ state.calculatedTotalPrice() }}</h2>
            </div>

            <button class="btn btn-primary btn-lg rounded-pill px-5 shadow-sm" (click)="continueToCustomerForm()">
              Continue Booking <i class="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DateTimePickerComponent implements OnInit {
  api = inject(BookingApiService);
  state = inject(BookingStateService);
  i18n = inject(I18nService);

  minDate = new Date().toISOString().split('T')[0];
  timeSlots = signal<any[]>([]);

  async ngOnInit() {
    await this.loadAvailability();
  }

  async onDateChange(newDate: string) {
    this.state.selectedDate.set(newDate);
    await this.loadAvailability();
  }

  async loadAvailability() {
    try {
      const itemId = this.state.bookingMode() === 'TOUR' ? this.state.selectedTour()?.id || 1 : 1;
      const data = await this.api.checkAvailability(this.state.selectedDate(), this.state.bookingMode(), itemId);
      this.timeSlots.set(data.time_slots || []);
    } catch (err) {
      console.error(err);
    }
  }

  decreaseQty() {
    if (this.state.quantityOrParticipants() > 1) {
      this.state.quantityOrParticipants.update(q => q - 1);
    }
  }

  increaseQty() {
    this.state.quantityOrParticipants.update(q => q + 1);
  }

  decreaseDays() {
    if (this.state.durationDays() > 1) {
      this.state.durationDays.update(d => d - 1);
    }
  }

  increaseDays() {
    this.state.durationDays.update(d => d + 1);
  }

  continueToCustomerForm() {
    this.state.currentStep.set('CUSTOMER_INFO');
  }
}
