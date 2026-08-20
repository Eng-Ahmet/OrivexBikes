import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booking-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5" style="max-width: 850px;">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-secondary mt-3">Loading booking confirmation...</p>
      </div>

      <div *ngIf="!loading && booking" class="card bg-dark border-success border-2 rounded-4 p-4 p-md-5 shadow-lg">
        <!-- Success Banner -->
        <div class="text-center mb-4 pb-3 border-bottom border-secondary">
          <div class="bg-success bg-gradient text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3 shadow" style="width: 70px; height: 70px;">
            <i class="fa-solid fa-circle-check fa-3x"></i>
          </div>
          <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">Reservation Confirmed</span>
          <h1 class="fw-extrabold text-white font-heading display-6 mb-1">Booking Confirmation</h1>
          <p class="text-secondary">Save or print your official rental voucher for pickup.</p>
        </div>

        <!-- Voucher Content -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-7">
            <div class="bg-secondary bg-opacity-10 rounded-4 p-4 h-100">
              <h5 class="fw-bold text-white font-heading mb-3"><i class="fa-solid fa-receipt me-2 text-primary"></i> Reservation Details</h5>
              
              <div class="mb-3">
                <span class="text-secondary small d-block">Booking Reference Code</span>
                <span class="font-monospace fs-4 fw-extrabold text-primary">{{ booking.booking_code }}</span>
              </div>

              <div class="mb-3">
                <span class="text-secondary small d-block">Customer Name</span>
                <strong class="text-white fs-6">{{ booking.customer_name }}</strong>
              </div>

              <div class="mb-3">
                <span class="text-secondary small d-block">Vehicle / Experience</span>
                <strong class="text-white fs-6">{{ booking.vehicle_name || booking.tour_title }}</strong>
              </div>

              <div class="mb-3">
                <span class="text-secondary small d-block">Pickup Store Location</span>
                <strong class="text-white">{{ booking.store_name }}</strong>
                <span class="d-block text-secondary small">{{ booking.store_address }}</span>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <span class="text-secondary small d-block">Pickup Date/Time</span>
                  <strong class="text-white small">{{ booking.start_time | date:'short' }}</strong>
                </div>
                <div class="col-6">
                  <span class="text-secondary small d-block">Return Date/Time</span>
                  <strong class="text-white small">{{ booking.end_time | date:'short' }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- QR Code & Financial Summary -->
          <div class="col-12 col-md-5">
            <div class="bg-secondary bg-opacity-10 rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-between">
              <div>
                <h6 class="fw-bold text-white mb-2">Voucher QR Code</h6>
                <div class="bg-white p-3 rounded-3 d-inline-block shadow-sm my-2">
                  <div class="font-monospace fw-bold text-dark p-3 border border-dark rounded-2" style="font-size: 0.85rem; word-break: break-all;">
                    <i class="fa-solid fa-qrcode fa-4x text-dark d-block mb-2"></i>
                    {{ booking.booking_code }}
                  </div>
                </div>
                <span class="d-block text-secondary small">Present this code at counter</span>
              </div>

              <div class="bg-dark p-3 rounded-3 mt-3">
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Rental Amount:</span>
                  <strong class="text-white">€{{ booking.total_amount }}</strong>
                </div>
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Security Deposit:</span>
                  <strong class="text-warning">€{{ booking.deposit_amount }}</strong>
                </div>
                <div class="d-flex justify-content-between text-secondary small">
                  <span>Payment Status:</span>
                  <span class="badge bg-warning text-dark">{{ booking.payment_status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex flex-wrap gap-3 justify-content-between align-items-center pt-3 border-top border-secondary">
          <button class="btn btn-outline-light btn-sm rounded-pill px-4" (click)="printVoucher()">
            <i class="fa-solid fa-print me-2"></i> Print Voucher
          </button>

          <div class="d-flex gap-2">
            <a routerLink="/my-booking" [queryParams]="{code: booking.booking_code}" class="btn btn-outline-info btn-sm rounded-pill px-3">
              <i class="fa-solid fa-magnifying-glass me-1"></i> Manage Booking
            </a>
            <a routerLink="/home" class="btn btn-primary btn-sm rounded-pill px-4 fw-bold">
              <i class="fa-solid fa-house me-1"></i> Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingConfirmationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  booking: any = null;
  loading = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const code = params['bookingNumber'];
      if (code) {
        this.http.get<any>(`/api/v1/public/bookings/lookup?booking_code=${code}`).subscribe({
          next: (data) => {
            this.booking = data;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  async printVoucher() {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const b = this.booking || {};

      // Dark Brand Header Box
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, 210, 45, 'F');

      // Title & Subtitle
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('OrivexBike - Official Rental Voucher', 15, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Costa del Sol Premium Mobility & Guided Tours | Orivex Technology', 15, 28);
      doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 15, 34);

      // Status Badge Box
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(145, 15, 50, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIRMED', 155, 24);

      // Section 1: Reservation Metadata Card
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 55, 180, 50, 4, 4, 'FD');

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Reservation Details', 22, 66);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Booking Ref Code:', 22, 76);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 110, 253);
      doc.text(String(b.booking_code || 'QQ-BOOKING'), 60, 76);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Customer Name:', 22, 84);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(b.customer_name || 'Valued Customer'), 60, 84);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Item Reserved:', 22, 92);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(b.vehicle_name || b.tour_title || 'E-Bike / Scooter'), 60, 92);

      // Section 2: Store Pickup & Schedule Card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 112, 180, 48, 4, 4, 'FD');

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Store Pickup & Timing', 22, 123);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Store Location:', 22, 133);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(b.store_name || 'Málaga Store'), 60, 133);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Pickup Schedule:', 22, 141);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(b.start_time ? new Date(b.start_time).toLocaleString() : 'Scheduled Pickup', 60, 141);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Return Schedule:', 22, 149);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(b.end_time ? new Date(b.end_time).toLocaleString() : 'Scheduled Return', 60, 149);

      // Section 3: Financial Summary Table
      doc.setFillColor(15, 23, 42);
      doc.rect(15, 168, 180, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', 22, 174);
      doc.text('Amount (€)', 160, 174);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text('Rental Total Fee', 22, 186);
      doc.text(`€${Number(b.total_amount || 0).toFixed(2)}`, 160, 186);

      doc.text('Refundable Security Deposit', 22, 194);
      doc.text(`€${Number(b.deposit_amount || 0).toFixed(2)}`, 160, 194);

      doc.setDrawColor(203, 213, 225);
      doc.line(15, 200, 195, 200);

      doc.setFont('helvetica', 'bold');
      doc.text('Payment Status', 22, 208);
      doc.setTextColor(16, 185, 129);
      doc.text(String(b.payment_status || 'PAID / CONFIRMED'), 160, 208);

      // Terms & Conditions Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Please present this official PDF voucher alongside a valid passport or National Identity Card at counter pickup.', 15, 275);
      doc.text('OrivexBike S.L. | Customer Support: info@orivexbike.com | Support Line: +34 951 123 456', 15, 280);

      doc.save(`Voucher_${b.booking_code || 'OrivexBike'}.pdf`);
    } catch (e) {
      window.print();
    }
  }
}
