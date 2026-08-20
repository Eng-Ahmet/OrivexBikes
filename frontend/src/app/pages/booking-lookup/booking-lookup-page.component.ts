import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-lookup-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4" style="max-width: 800px;">
      <!-- Header -->
      <div class="text-center mb-4">
        <span class="badge bg-info text-dark fw-bold px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-magnifying-glass me-1"></i> Customer Self Service
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Lookup & Manage Booking</h1>
        <p class="text-secondary">Enter your Booking Reference Code (e.g. QQB-8F4K2M) to view status or request cancellation.</p>
      </div>

      <!-- Search Card -->
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 mb-4 shadow-sm">
        <form (ngSubmit)="searchBooking()">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
              <label class="form-label text-secondary small fw-bold">Booking Reference Code *</label>
              <input type="text" class="form-control form-control-lg bg-dark text-white border-secondary font-monospace" placeholder="QQB-8F4K2M" [(ngModel)]="searchCode" name="searchCode" required />
            </div>
            <div class="col-12 col-md-4">
              <button type="submit" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold" [disabled]="searching">
                <span *ngIf="searching" class="spinner-border spinner-border-sm me-1"></span>
                <i class="fa-solid fa-search me-1" *ngIf="!searching"></i> Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMsg" class="alert alert-danger rounded-4 shadow-sm mb-4">
        <i class="fa-solid fa-circle-exclamation me-2"></i> {{ errorMsg }}
      </div>

      <!-- Result Card -->
      <div *ngIf="booking" class="card bg-dark border-secondary-subtle rounded-4 p-4 shadow-lg">
        <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary">
          <div>
            <span class="text-secondary small d-block">Booking Reference</span>
            <h3 class="fw-extrabold text-primary font-monospace mb-0">{{ booking.booking_code }}</h3>
          </div>
          <div>
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6" *ngIf="booking.booking_status === 'CONFIRMED' || booking.booking_status === 'ACTIVE'">{{ booking.booking_status }}</span>
            <span class="badge bg-danger px-3 py-2 rounded-pill fs-6" *ngIf="booking.booking_status === 'CANCELLED'">{{ booking.booking_status }}</span>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4">
            <span class="text-secondary small d-block">Customer Name</span>
            <strong class="text-white">{{ booking.customer_name }}</strong>
          </div>
          <div class="col-6 col-md-4">
            <span class="text-secondary small d-block">Phone Number</span>
            <strong class="text-white">{{ booking.customer_phone_masked || '***' }}</strong>
          </div>
          <div class="col-6 col-md-4">
            <span class="text-secondary small d-block">Vehicle / Tour</span>
            <strong class="text-info">{{ booking.vehicle_name || booking.tour_title }}</strong>
          </div>
          <div class="col-6 col-md-4" *ngIf="booking.store_name">
            <span class="text-secondary small d-block">Pickup Store</span>
            <strong class="text-white">{{ booking.store_name }}</strong>
          </div>
          <div class="col-6 col-md-4" *ngIf="booking.start_time">
            <span class="text-secondary small d-block">Pickup Time</span>
            <strong class="text-white">{{ booking.start_time | date:'short' }}</strong>
          </div>
          <div class="col-6 col-md-4">
            <span class="text-secondary small d-block">Total Rental Fee</span>
            <strong class="text-success fs-5">€{{ booking.total_amount }}</strong>
          </div>
        </div>

        <!-- Cancellation Section -->
        <div *ngIf="booking.booking_status === 'CONFIRMED'" class="bg-secondary bg-opacity-10 rounded-3 p-3 mt-2">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h6 class="fw-bold text-white mb-1">Need to cancel your reservation?</h6>
              <p class="text-secondary small mb-0">Free cancellation up to 24 hours prior to pickup time.</p>
            </div>
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="cancelBooking()" [disabled]="cancelling">
              <span *ngIf="cancelling" class="spinner-border spinner-border-sm me-1"></span>
              <i class="fa-solid fa-ban me-1" *ngIf="!cancelling"></i> Cancel Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingLookupPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  searchCode = '';
  booking: any = null;
  searching = false;
  cancelling = false;
  errorMsg = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.searchCode = params['code'];
        this.searchBooking();
      }
    });
  }

  searchBooking() {
    if (!this.searchCode) return;
    this.searching = true;
    this.errorMsg = '';
    this.booking = null;

    this.http.get<any>(`/api/v1/public/bookings/lookup?booking_code=${encodeURIComponent(this.searchCode)}`).subscribe({
      next: (data) => {
        this.booking = data;
        this.searching = false;
      },
      error: (err) => {
        this.searching = false;
        this.errorMsg = err.error?.error || 'Booking reference code not found.';
      }
    });
  }

  cancelBooking() {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    this.cancelling = true;

    this.http.post<any>(`/api/v1/public/bookings/${encodeURIComponent(this.booking.booking_code)}/cancel`, {}).subscribe({
      next: () => {
        this.cancelling = false;
        alert('Booking cancelled successfully.');
        this.searchBooking();
      },
      error: (err) => {
        this.cancelling = false;
        alert(err.error?.error || 'Failed to cancel booking.');
      }
    });
  }
}
