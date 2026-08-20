import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingApiService } from './services/booking-api.service';
import { BookingStateService } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary">
        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" (click)="state.currentStep.set('SELECT_DATE_TIME')">
          <i class="fa-solid fa-arrow-left me-1"></i> Back to date & time
        </button>
        <h5 class="fw-bold text-white mb-0"><i class="fa-solid fa-user-pen me-2 text-info"></i> Customer Information</h5>
      </div>

      <div class="row g-4">
        <!-- Customer Details Form -->
        <div class="col-12 col-lg-7">
          <form (ngSubmit)="submitBooking()">
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label text-secondary small">First Name *</label>
                <input type="text" class="form-control bg-dark text-light border-secondary" required placeholder="John" [(ngModel)]="firstName" name="firstName" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-secondary small">Last Name *</label>
                <input type="text" class="form-control bg-dark text-light border-secondary" required placeholder="Doe" [(ngModel)]="lastName" name="lastName" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-secondary small">Email Address *</label>
                <input type="email" class="form-control bg-dark text-light border-secondary" required placeholder="john.doe@example.com" [(ngModel)]="email" name="email" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-secondary small">Phone Number (WhatsApp) *</label>
                <input type="tel" class="form-control bg-dark text-light border-secondary" required placeholder="+34 600 000 000" [(ngModel)]="phone" name="phone" />
              </div>
              <div class="col-12">
                <label class="form-label text-secondary small">Special Requests or Notes (Optional)</label>
                <textarea class="form-control bg-dark text-light border-secondary" rows="2" placeholder="Helmet size, child seat requirements, experience level..." [(ngModel)]="notes" name="notes"></textarea>
              </div>
            </div>

            <!-- Payment Method Selection -->
            <label class="form-label text-secondary small fw-bold mb-2">Select Payment Method</label>
            <div class="row g-3 mb-4">
              <!-- Option 1: Stripe Online -->
              <div class="col-12 col-sm-6">
                <div class="card bg-secondary bg-opacity-10 border rounded-4 p-3 h-100 cursor-pointer transition shadow-sm"
                     [class.border-primary]="paymentMethod === 'STRIPE'"
                     [class.border-2]="paymentMethod === 'STRIPE'"
                     [class.bg-primary]="paymentMethod === 'STRIPE'"
                     [class.bg-opacity-10]="paymentMethod === 'STRIPE'"
                     [class.border-secondary-subtle]="paymentMethod !== 'STRIPE'"
                     (click)="paymentMethod = 'STRIPE'">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="fa-solid fa-credit-card text-info fs-5"></i>
                      <strong class="text-white">Pay Online (Stripe)</strong>
                    </div>
                    <i class="fa-solid" [class.fa-circle-check]="paymentMethod === 'STRIPE'" [class.text-primary]="paymentMethod === 'STRIPE'" [class.fa-circle]="paymentMethod !== 'STRIPE'" [class.text-secondary]="paymentMethod !== 'STRIPE'" style="font-size: 1.25rem;"></i>
                  </div>
                  <p class="small text-secondary mb-0">Instant payment receipt & confirmed booking via Credit/Debit card.</p>
                </div>
              </div>

              <!-- Option 2: Pay at Counter -->
              <div class="col-12 col-sm-6">
                <div class="card bg-secondary bg-opacity-10 border rounded-4 p-3 h-100 cursor-pointer transition shadow-sm"
                     [class.border-warning]="paymentMethod === 'PAY_AT_COUNTER'"
                     [class.border-2]="paymentMethod === 'PAY_AT_COUNTER'"
                     [class.bg-warning]="paymentMethod === 'PAY_AT_COUNTER'"
                     [class.bg-opacity-10]="paymentMethod === 'PAY_AT_COUNTER'"
                     [class.border-secondary-subtle]="paymentMethod !== 'PAY_AT_COUNTER'"
                     (click)="paymentMethod = 'PAY_AT_COUNTER'">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="fa-solid fa-store text-warning fs-5"></i>
                      <strong class="text-white">Pay at Counter</strong>
                    </div>
                    <i class="fa-solid" [class.fa-circle-check]="paymentMethod === 'PAY_AT_COUNTER'" [class.text-warning]="paymentMethod === 'PAY_AT_COUNTER'" [class.fa-circle]="paymentMethod !== 'PAY_AT_COUNTER'" [class.text-secondary]="paymentMethod !== 'PAY_AT_COUNTER'" style="font-size: 1.25rem;"></i>
                  </div>
                  <p class="small text-secondary mb-0">Reserve online now, pay cash or card when picking up at Málaga store.</p>
                </div>
              </div>
            </div>

            <!-- GDPR Consents & Terms -->
            <div class="card bg-secondary bg-opacity-10 border-secondary rounded-3 p-3 mb-4">
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="termsCheck" [(ngModel)]="termsAccepted" name="termsAccepted" required>
                <label class="form-check-label text-light small" for="termsCheck">
                  I agree to the <a routerLink="/terms" target="_blank" class="text-primary text-decoration-underline">Terms & Conditions</a> and <a routerLink="/rental-terms" target="_blank" class="text-primary text-decoration-underline">Rental Policy</a> *
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="privacyCheck" [(ngModel)]="privacyAccepted" name="privacyAccepted" required>
                <label class="form-check-label text-light small" for="privacyCheck">
                  I accept the processing of my personal data according to the <a routerLink="/privacy" target="_blank" class="text-primary text-decoration-underline">Privacy Policy</a> (GDPR) *
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-success btn-lg w-100 rounded-pill shadow-sm fw-bold" [disabled]="submitting() || !termsAccepted || !privacyAccepted">
              <i class="fa-solid fa-check-circle me-2"></i> Confirm Booking
            </button>
          </form>
        </div>

        <!-- Booking Summary Sidebar -->
        <div class="col-12 col-lg-5">
          <div class="card bg-secondary bg-opacity-10 border-secondary rounded-4 p-4 sticky-top" style="top: 90px;">
            <h5 class="fw-bold text-white mb-3 border-bottom border-secondary pb-2">Booking Summary</h5>

            <div class="mb-3">
              <span class="text-secondary small d-block">Experience / Vehicle</span>
              <strong class="text-info fs-6">
                {{ state.bookingMode() === 'TOUR' ? state.selectedTour()?.title : state.selectedFleet()?.display_name }}
              </strong>
            </div>

            <div class="mb-3">
              <span class="text-secondary small d-block">Date & Time</span>
              <strong class="text-white">{{ state.selectedDate() }} at {{ state.selectedTimeSlot() }}</strong>
            </div>

            <div class="mb-3">
              <span class="text-secondary small d-block">
                {{ state.bookingMode() === 'TOUR' ? 'Participants' : 'Quantity & Duration' }}
              </span>
              <strong class="text-white">
                {{ state.quantityOrParticipants() }} {{ state.bookingMode() === 'TOUR' ? 'Persons' : 'Vehicle(s)' }}
                @if (state.bookingMode() === 'FLEET') {
                  ({{ state.durationDays() }} Day(s))
                }
              </strong>
            </div>

            <div class="border-top border-secondary pt-3 mt-3 d-flex align-items-center justify-content-between">
              <span class="text-light fw-bold">Total Price</span>
              <h3 class="fw-bold text-success mb-0">€{{ state.calculatedTotalPrice() }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerFormComponent {
  api = inject(BookingApiService);
  state = inject(BookingStateService);
  i18n = inject(I18nService);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  notes = '';
  paymentMethod: 'STRIPE' | 'PAY_AT_COUNTER' = 'PAY_AT_COUNTER';

  termsAccepted = false;
  privacyAccepted = false;

  submitting = signal<boolean>(false);

  async submitBooking() {
    if (!this.firstName || !this.lastName || !this.phone) {
      alert('Please complete First Name, Last Name, and Phone Number.');
      return;
    }

    if (!this.termsAccepted || !this.privacyAccepted) {
      alert('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    this.submitting.set(true);
    try {
      const mode = this.bookingMode();
      const payload = {
        type: mode,
        item_id: mode === 'TOUR' ? (this.state.selectedTour()?.id || 1) : 1,
        vehicle_id: mode === 'FLEET' ? 1 : undefined,
        item_name: mode === 'TOUR' ? (this.state.selectedTour()?.title || 'Tour') : (this.state.selectedFleet()?.display_name || 'Vehicle'),
        customer_name: `${this.firstName} ${this.lastName}`,
        customer_first_name: this.firstName,
        customer_last_name: this.lastName,
        customer_email: this.email,
        customer_phone: this.phone,
        booking_date: this.state.selectedDate(),
        booking_time: this.state.selectedTimeSlot(),
        pickup_date: this.state.selectedDate(),
        pickup_time: this.state.selectedTimeSlot(),
        duration_days: mode === 'FLEET' ? this.state.durationDays() : undefined,
        quantity_or_participants: this.state.quantityOrParticipants(),
        total_price: this.state.calculatedTotalPrice(),
        payment_method: this.paymentMethod,
        terms_accepted: true,
        privacy_accepted: true,
        notes: this.notes
      };

      const result = await this.api.createBooking(payload);
      this.state.confirmedBooking.set(result);
      this.state.currentStep.set('CONFIRMATION');
    } catch (err) {
      alert('Failed to process booking. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  bookingMode() {
    return this.state.bookingMode();
  }
}
