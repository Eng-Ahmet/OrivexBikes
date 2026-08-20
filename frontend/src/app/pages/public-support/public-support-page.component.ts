import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-support-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <span class="badge bg-danger px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-headset me-1"></i> Customer Support & Assistance
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Contact & Support Desk</h1>
        <p class="text-secondary lead mb-0">Have questions about rentals, guided tours, or roadside assistance? Contact our Málaga team.</p>
      </div>

      <div class="row g-4">
        <!-- Left Contact Info -->
        <div class="col-12 col-lg-5">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 mb-4 shadow-sm">
            <h4 class="fw-bold text-white font-heading mb-4"><i class="fa-solid fa-store text-primary me-2"></i> QQBikes Store Hubs</h4>

            <div class="mb-4">
              <h6 class="fw-bold text-warning mb-1">Málaga Beach Central Store</h6>
              <p class="text-secondary small mb-1"><i class="fa-solid fa-location-dot text-danger me-2"></i> Paseo Marítimo 42, 29016 Málaga</p>
              <p class="text-secondary small mb-1"><i class="fa-solid fa-phone text-success me-2"></i> +34 952 112 233</p>
              <p class="text-secondary small"><i class="fa-solid fa-clock text-info me-2"></i> Open 09:00 - 22:00 Daily</p>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-info mb-1">Mijas Coastal Resort Store</h6>
              <p class="text-secondary small mb-1"><i class="fa-solid fa-location-dot text-danger me-2"></i> Calle San Miguel 18, 29620 Mijas</p>
              <p class="text-secondary small mb-1"><i class="fa-solid fa-phone text-success me-2"></i> +34 952 889 900</p>
              <p class="text-secondary small"><i class="fa-solid fa-clock text-info me-2"></i> Open 09:30 - 21:30 Daily</p>
            </div>

            <div class="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 p-3 text-center">
              <i class="fa-solid fa-triangle-exclamation text-danger fa-2x mb-2"></i>
              <h6 class="fw-bold text-white mb-1">Roadside Assistance Line</h6>
              <p class="text-secondary small mb-0">For active rental punctures or roadside help, call WhatsApp hotline: <strong class="text-white">+34 600 111 000</strong></p>
            </div>
          </div>
        </div>

        <!-- Right Support Ticket Form -->
        <div class="col-12 col-lg-7">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 shadow-sm">
            <h4 class="fw-bold text-white font-heading mb-3"><i class="fa-solid fa-envelope-open-text text-info me-2"></i> Send Us a Message</h4>
            <p class="text-secondary small mb-4">Submit a support ticket and our staff will respond within a few hours.</p>

            <div *ngIf="successMsg" class="alert alert-success rounded-4 shadow-sm mb-4">
              <i class="fa-solid fa-circle-check me-2"></i> {{ successMsg }}
            </div>

            <form (ngSubmit)="submitTicket()">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small fw-bold">Full Name *</label>
                  <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="ticket.name" name="name" required placeholder="John Doe" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small fw-bold">Email Address *</label>
                  <input type="email" class="form-control bg-dark text-white border-secondary" [(ngModel)]="ticket.email" name="email" required placeholder="john@example.com" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small fw-bold">Phone Number</label>
                  <input type="tel" class="form-control bg-dark text-white border-secondary" [(ngModel)]="ticket.phone" name="phone" placeholder="+34 600 000 000" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label text-secondary small fw-bold">Subject Topic</label>
                  <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="ticket.subject" name="subject">
                    <option value="Rental Booking Query">Rental Booking Query</option>
                    <option value="Guided Tour Reservation">Guided Tour Reservation</option>
                    <option value="Roadside Assistance">Roadside Assistance</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold">Message *</label>
                  <textarea class="form-control bg-dark text-white border-secondary" rows="4" [(ngModel)]="ticket.message" name="message" required placeholder="How can we assist you today?"></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold" [disabled]="submitting">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                <i class="fa-solid fa-paper-plane me-2" *ngIf="!submitting"></i> Submit Support Ticket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicSupportPageComponent {
  private http = inject(HttpClient);

  submitting = false;
  successMsg = '';

  ticket = {
    name: '',
    email: '',
    phone: '',
    subject: 'Rental Booking Query',
    message: ''
  };

  submitTicket() {
    if (!this.ticket.name || !this.ticket.email || !this.ticket.message) {
      alert('Please fill in your name, email, and message.');
      return;
    }

    this.submitting = true;
    this.successMsg = '';

    this.http.post<any>('/api/v1/public/support', this.ticket).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMsg = `${res.message} Ticket Code: ${res.ticket_code}`;
        this.ticket = { name: '', email: '', phone: '', subject: 'Rental Booking Query', message: '' };
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.error || 'Failed to submit support ticket.');
      }
    });
  }
}
