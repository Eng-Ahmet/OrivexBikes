import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-public-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Banner Section -->
    <div class="position-relative bg-dark bg-gradient text-white py-5 px-3 px-md-5 mb-5 rounded-4 shadow-lg border border-secondary-subtle overflow-hidden">
      <div class="row align-items-center g-4 py-4">
        <div class="col-12 col-lg-7">
          <span class="badge bg-primary text-white px-3 py-2 rounded-pill fs-6 mb-3 shadow-sm">
            <i class="fa-solid fa-sun text-warning me-2"></i> Málaga #1 Rental & Guided Tour Experience
          </span>

          <h1 class="display-4 fw-extrabold font-heading text-white tracking-tight mb-3">
            Discover <span class="text-primary">Málaga</span> on Two Wheels
          </h1>

          <p class="lead text-secondary mb-4" style="max-width: 600px;">
            Rent premium electric bikes, city bicycles, and e-scooters or join expert-guided coastal sunset tours along the Mediterranean.
          </p>

          <div class="d-flex flex-wrap gap-3">
            <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold">
              <i class="fa-solid fa-bolt me-2"></i> Rent Bikes & Scooters
            </a>
            <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-outline-light btn-lg rounded-pill px-4">
              <i class="fa-solid fa-person-biking me-2 text-info"></i> Guided Tours (€35)
            </a>
          </div>

          <div class="d-flex align-items-center gap-4 mt-4 pt-3 border-top border-secondary">
            <div>
              <h4 class="fw-bold text-success mb-0">4.9 ★</h4>
              <span class="small text-secondary">Google & TripAdvisor</span>
            </div>
            <div class="vr bg-secondary"></div>
            <div>
              <h4 class="fw-bold text-primary mb-0">50+</h4>
              <span class="small text-secondary">Fleet Vehicles</span>
            </div>
            <div class="vr bg-secondary d-none d-sm-block"></div>
            <div class="d-none d-sm-block">
              <h4 class="fw-bold text-info mb-0">2 Stores</h4>
              <span class="small text-secondary">Málaga & Mijas</span>
            </div>
          </div>
        </div>

        <!-- Official Brand Logo Banner Badge -->
        <div class="col-12 col-lg-5 text-center">
          <div class="position-relative bg-secondary bg-opacity-10 p-4 p-md-5 rounded-4 border border-secondary shadow-sm">
            <div class="d-inline-flex align-items-center gap-3 bg-dark bg-opacity-90 p-4 rounded-4 border border-secondary shadow-lg">
              <div class="bg-primary bg-gradient text-white rounded-4 p-3 shadow d-flex align-items-center justify-content-center" style="width: 70px; height: 70px;">
                <i class="fa-solid fa-bicycle fa-3x text-white"></i>
              </div>
              <div class="text-start">
                <h2 class="fw-extrabold text-white font-heading mb-0 fs-1">QQ<span class="text-primary">Bikes</span></h2>
                <span class="text-secondary small">Málaga Coast Rentals & Tours</span>
              </div>
            </div>

            <div class="badge bg-success position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow">
              <i class="fa-solid fa-circle-check me-1"></i> Helmet & Lock Included
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Options Section -->
    <div class="container mb-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold text-white font-heading">What would you like to experience?</h2>
        <p class="text-secondary">Instant real-time availability & online booking with visual QR vouchers</p>
      </div>

      <div class="row g-4">
        <!-- Guided Tours Card -->
        <div class="col-12 col-md-6">
          <div class="card bg-secondary bg-opacity-10 border-primary border-opacity-25 rounded-4 p-4 h-100 hover-shadow transition">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                <i class="fa-solid fa-person-biking fa-2x text-white"></i>
              </div>
              <span class="badge bg-primary rounded-pill px-3 py-1">From €35 / Person</span>
            </div>

            <h3 class="fw-bold text-white mb-2">Guided Tours & Safaris</h3>
            <p class="text-secondary mb-4">
              Join local guides for unforgettable rides through Málaga Coast, Alcazaba trails, and Mijas countryside.
            </p>

            <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-primary btn-lg rounded-pill mt-auto shadow-sm">
              <i class="fa-solid fa-arrow-right me-2"></i> Explore & Book Tours
            </a>
          </div>
        </div>

        <!-- Fleet Rental Card -->
        <div class="col-12 col-md-6">
          <div class="card bg-secondary bg-opacity-10 border-warning border-opacity-25 rounded-4 p-4 h-100 hover-shadow transition">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="bg-warning text-dark rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                <i class="fa-solid fa-bolt fa-2x text-dark"></i>
              </div>
              <span class="badge bg-warning text-dark rounded-pill px-3 py-1">From €20 / Day</span>
            </div>

            <h3 class="fw-bold text-white mb-2">Bikes & E-Scooter Rental</h3>
            <p class="text-secondary mb-4">
              Explore Málaga at your own pace with top-tier city bikes, high-range e-bikes, and electric scooters.
            </p>

            <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" class="btn btn-warning btn-lg rounded-pill text-dark fw-bold mt-auto shadow-sm">
              <i class="fa-solid fa-arrow-right me-2"></i> Rent Bikes & Scooters
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Why Choose QQBikes Feature Grid -->
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 p-md-5 mb-5 shadow-sm">
      <div class="text-center mb-4">
        <h3 class="fw-bold text-white font-heading">Why Ride With QQBikes?</h3>
      </div>

      <div class="row g-4 text-center">
        <div class="col-12 col-md-3">
          <div class="p-3">
            <i class="fa-solid fa-shield-halved fa-2x text-primary mb-3"></i>
            <h5 class="fw-bold text-white">Full Safety Equipment</h5>
            <p class="text-secondary small mb-0">Complimentary helmets, heavy-duty anti-theft locks, and lights included.</p>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <div class="p-3">
            <i class="fa-solid fa-battery-full fa-2x text-success mb-3"></i>
            <h5 class="fw-bold text-white">High-Battery Range</h5>
            <p class="text-secondary small mb-0">Long-range batteries inspected and fully charged before every rental.</p>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <div class="p-3">
            <i class="fa-solid fa-headset fa-2x text-info mb-3"></i>
            <h5 class="fw-bold text-white">Roadside Assistance</h5>
            <p class="text-secondary small mb-0">Free roadside assistance and bike replacement across Málaga coastal areas.</p>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <div class="p-3">
            <i class="fa-solid fa-credit-card fa-2x text-warning mb-3"></i>
            <h5 class="fw-bold text-white">Flexible Payment</h5>
            <p class="text-secondary small mb-0">Pay online with Stripe or pay at counter upon arrival at our store.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicHomePageComponent {
  i18n = inject(I18nService);
}
