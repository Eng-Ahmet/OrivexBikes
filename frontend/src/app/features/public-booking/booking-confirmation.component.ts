import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStateService } from './services/booking-state.service';
import { I18nService } from '../../core/services/i18n.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (booking()) {
      <div class="card bg-dark bg-gradient border-success rounded-4 p-4 p-md-5 shadow-lg text-center mx-auto" style="max-width: 680px;">
        <div class="badge bg-success bg-opacity-20 text-success border border-success px-4 py-2 rounded-pill fs-6 mb-3">
          <i class="fa-solid fa-circle-check me-2"></i> Booking Confirmed!
        </div>

        <h2 class="fw-bold text-white mb-1 font-heading">Thank You for Booking!</h2>
        <p class="text-secondary small mb-4">Your booking voucher and reference code have been generated below.</p>

        <!-- Booking Code & QR Box -->
        <div class="card bg-secondary bg-opacity-10 border-secondary rounded-4 p-4 mb-4 text-center">
          <span class="text-secondary small text-uppercase d-block mb-1">Booking Reference Code</span>
          <h2 class="fw-mono fw-bold text-primary tracking-widest mb-3">{{ booking()?.booking_code }}</h2>

          <!-- Visual QR Code Representation -->
          <div class="bg-white p-3 rounded-4 d-inline-block shadow-sm mb-3">
            <div class="d-flex flex-column align-items-center justify-content-center border border-2 border-dark p-3 rounded-3" style="width: 140px; height: 140px; background: #fff; color: #000;">
              <i class="fa-solid fa-qrcode fa-5x"></i>
              <span class="fw-mono small fw-bold mt-1" style="font-size: 0.6rem;">{{ booking()?.booking_code }}</span>
            </div>
          </div>
          <span class="text-muted d-block small">Scan at store counter for instant pick-up</span>
        </div>

        <!-- EXPLICIT PAYMENT STATUS BOX -->
        @if (booking()?.payment_status === 'PAID') {
          <div class="card bg-success bg-opacity-10 border-success border-opacity-50 rounded-4 p-3 mb-4 text-start">
            <div class="d-flex align-items-center gap-3">
              <i class="fa-solid fa-circle-check fa-2x text-success"></i>
              <div>
                <h6 class="fw-bold text-success mb-0">PAYMENT STATUS: PAID IN FULL</h6>
                <div class="small text-light">Amount Paid: <strong>€{{ booking()?.total_price }}</strong> via Stripe Online Card</div>
                <div class="small text-secondary" style="font-size: 0.75rem;">Transaction Ref: {{ booking()?.payment_reference }}</div>
              </div>
            </div>
          </div>
        } @else {
          <div class="card bg-warning bg-opacity-10 border-warning border-opacity-50 rounded-4 p-3 mb-4 text-start">
            <div class="d-flex align-items-center gap-3">
              <i class="fa-solid fa-triangle-exclamation fa-2x text-warning"></i>
              <div>
                <h6 class="fw-bold text-warning mb-0">PAYMENT STATUS: UNPAID / DUE AT COUNTER</h6>
                <div class="small text-light">Amount Due Upon Arrival: <strong class="text-warning">€{{ booking()?.total_price }}</strong></div>
                <div class="small text-secondary" style="font-size: 0.75rem;">Please pay cash or card when picking up at Málaga Store</div>
              </div>
            </div>
          </div>
        }

        <!-- Booking Receipt Breakdown -->
        <div class="text-start bg-dark p-3 rounded-3 mb-4 border border-secondary">
          <div class="row g-2 small">
            <div class="col-6 text-secondary">Item / Tour:</div>
            <div class="col-6 text-end fw-bold text-white">{{ booking()?.item_name }}</div>

            <div class="col-6 text-secondary">Customer:</div>
            <div class="col-6 text-end fw-bold text-white">{{ booking()?.customer_first_name }} {{ booking()?.customer_last_name }}</div>

            <div class="col-6 text-secondary">Contact:</div>
            <div class="col-6 text-end fw-bold text-white">{{ booking()?.customer_phone }}</div>

            <div class="col-6 text-secondary">Date & Time:</div>
            <div class="col-6 text-end fw-bold text-info">{{ booking()?.booking_date }} at {{ booking()?.booking_time }}</div>

            <div class="col-6 text-secondary">Quantity / Guests:</div>
            <div class="col-6 text-end fw-bold text-white">{{ booking()?.quantity_or_participants }}</div>

            <div class="col-6 text-secondary">Total Booking Price:</div>
            <div class="col-6 text-end fw-bold text-success fs-6">€{{ booking()?.total_price }}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button class="btn btn-success rounded-pill px-4 shadow-sm" (click)="downloadPdfVoucher()">
            <i class="fa-solid fa-file-pdf me-2"></i> Download Official PDF Voucher
          </button>

          <button class="btn btn-outline-light rounded-pill px-4" (click)="printReceipt()">
            <i class="fa-solid fa-print me-2"></i> Print Receipt
          </button>

          <button class="btn btn-primary rounded-pill px-4" (click)="state.resetWizard()">
            <i class="fa-solid fa-plus me-2"></i> Make Another Booking
          </button>
        </div>
      </div>
    }
  `
})
export class BookingConfirmationComponent {
  state = inject(BookingStateService);
  i18n = inject(I18nService);

  booking() {
    return this.state.confirmedBooking();
  }

  printReceipt() {
    window.print();
  }

  downloadPdfVoucher() {
    const b = this.booking();
    if (!b) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('QQBikes Rental & Store Management', 14, 20);
    doc.setFontSize(10);
    doc.text('Málaga Beach Promenade Store • www.qqbikes.es', 14, 28);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`Official Booking Voucher`, 14, 48);
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${b.booking_code}`, 14, 56);

    // Box details
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, 63, 182, 55);

    doc.setFontSize(10);
    doc.text(`Customer Name: ${b.customer_first_name} ${b.customer_last_name}`, 20, 72);
    doc.text(`Email: ${b.customer_email}`, 20, 80);
    doc.text(`Phone: ${b.customer_phone}`, 20, 88);

    doc.text(`Booked Experience / Vehicle: ${b.item_name}`, 20, 98);
    doc.text(`Date & Time: ${b.booking_date} at ${b.booking_time}`, 20, 106);

    // Explicit Payment Status Box
    const isPaid = b.payment_status === 'PAID';
    if (isPaid) {
      doc.setFillColor(220, 255, 220);
      doc.rect(14, 125, 182, 25, 'F');
      doc.setDrawColor(0, 150, 0);
      doc.rect(14, 125, 182, 25, 'S');

      doc.setTextColor(0, 100, 0);
      doc.setFontSize(12);
      doc.text(`PAYMENT STATUS: PAID IN FULL - €${b.total_price}`, 20, 137);
      doc.setFontSize(9);
      doc.text(`Payment Method: Stripe Online Credit Card (Ref: ${b.payment_reference || 'STRIPE-OK'})`, 20, 144);
    } else {
      doc.setFillColor(255, 245, 220);
      doc.rect(14, 125, 182, 25, 'F');
      doc.setDrawColor(200, 120, 0);
      doc.rect(14, 125, 182, 25, 'S');

      doc.setTextColor(180, 90, 0);
      doc.setFontSize(12);
      doc.text(`PAYMENT STATUS: UNPAID / DUE UPON ARRIVAL AT COUNTER`, 20, 137);
      doc.setFontSize(9);
      doc.text(`Amount Due at Store: €${b.total_price} (Pay cash or card when picking up at Málaga counter)`, 20, 144);
    }

    // Pick-up Instructions
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text('Pickup Location & Instructions:', 14, 162);
    doc.setFontSize(9);
    doc.text('• Please present this PDF voucher or Booking Reference Code (BK-...) upon arrival.', 14, 170);
    doc.text('• Valid Passport or Photo ID is required for vehicle pickup.', 14, 177);
    doc.text('• Store Address: QQBikes Málaga Central, Paseo Marítimo 12, Málaga.', 14, 184);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on ${new Date().toLocaleString()} • QQBikes Systems`, 14, 280);

    doc.save(`QQBikes_Voucher_${b.booking_code}.pdf`);
  }
}
