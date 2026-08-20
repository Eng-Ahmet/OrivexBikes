import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-public-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-wrapper overflow-hidden">
      <!-- HERO BANNER SECTION -->
      <section class="position-relative bg-dark bg-gradient text-white py-5 px-3 px-md-5 mb-5 rounded-4 shadow-lg border border-secondary border-opacity-25 overflow-hidden">
        <!-- Ambient Background Glow Orbs -->
        <div class="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-20 blur-3xl" style="width: 400px; height: 400px; filter: blur(90px);"></div>
        <div class="position-absolute bottom-0 end-0 translate-middle-y rounded-circle bg-info opacity-15 blur-3xl" style="width: 350px; height: 350px; filter: blur(80px);"></div>

        <div class="row align-items-center g-4 py-3 position-relative z-1">
          <div class="col-12 col-lg-7">
            <span class="badge bg-primary bg-opacity-20 text-cyan border border-primary border-opacity-30 px-3.5 py-2 rounded-pill fs-6 mb-3 shadow-sm d-inline-flex align-items-center gap-2">
              <i class="fa-solid fa-sun text-warning"></i> Málaga #1 Bike & E-Scooter Experience
            </span>

            <h1 class="display-4 fw-extrabold font-heading text-white tracking-tight mb-3 lh-sm">
              Discover Costa del Sol with <span class="text-gradient-cyan">Orivex<span class="text-primary">Bike</span></span>
            </h1>

            <p class="lead text-secondary mb-4 fs-5" style="max-width: 620px;">
              Rent high-range electric bikes, city cruisers, and e-scooters or join expert-guided sunset coastal tours powered by Orivex Technology.
            </p>

            <!-- Quick Action Buttons -->
            <div class="d-flex flex-wrap gap-3 mb-4">
              <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" class="btn btn-primary btn-lg rounded-pill px-4 shadow-lg fw-bold d-flex align-items-center gap-2">
                <i class="fa-solid fa-bolt"></i> Rent Bikes & Scooters
              </a>
              <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-outline-light btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
                <i class="fa-solid fa-person-biking text-info"></i> Guided Tours (€35)
              </a>
            </div>

            <!-- Stats Bar -->
            <div class="d-flex flex-wrap align-items-center gap-4 pt-3 border-top border-secondary border-opacity-30 text-secondary">
              <div>
                <h4 class="fw-bold text-success mb-0">4.9 ★</h4>
                <span class="extra-small text-secondary">Google & TripAdvisor</span>
              </div>
              <div class="vr bg-secondary opacity-50 d-none d-sm-block" style="height: 30px;"></div>
              <div>
                <h4 class="fw-bold text-primary mb-0">50+</h4>
                <span class="extra-small text-secondary">Verified Fleet</span>
              </div>
              <div class="vr bg-secondary opacity-50 d-none d-sm-block" style="height: 30px;"></div>
              <div>
                <h4 class="fw-bold text-info mb-0">2 Hubs</h4>
                <span class="extra-small text-secondary">Málaga & Mijas</span>
              </div>
              <div class="vr bg-secondary opacity-50 d-none d-sm-block" style="height: 30px;"></div>
              <div>
                <h4 class="fw-bold text-warning mb-0">€0</h4>
                <span class="extra-small text-secondary">Hidden Fees</span>
              </div>
            </div>
          </div>

          <!-- Hero Right Visual Card -->
          <div class="col-12 col-lg-5 text-center">
            <div class="bg-dark bg-opacity-70 p-4 p-md-5 rounded-4 border border-secondary border-opacity-30 shadow-lg position-relative overflow-hidden">
              <div class="bg-primary bg-gradient text-white rounded-4 p-4 mb-4 d-inline-flex align-items-center justify-content-center shadow-lg" style="width: 90px; height: 90px;">
                <i class="fa-solid fa-bicycle fa-3x"></i>
              </div>

              <h2 class="fw-extrabold text-white font-heading mb-1">Orivex<span class="text-primary">Bike</span></h2>
              <p class="text-secondary small mb-4">Official Costa del Sol Rental Platform</p>

              <div class="d-flex flex-column gap-2 text-start bg-secondary bg-opacity-10 p-3 rounded-3 mb-4">
                <div class="d-flex align-items-center gap-2 text-light small">
                  <i class="fa-solid fa-circle-check text-success"></i> <span>Free Helmet & Heavy-Duty Lock</span>
                </div>
                <div class="d-flex align-items-center gap-2 text-light small">
                  <i class="fa-solid fa-circle-check text-success"></i> <span>Full Battery Charge Guarantee</span>
                </div>
                <div class="d-flex align-items-center gap-2 text-light small">
                  <i class="fa-solid fa-circle-check text-success"></i> <span>Instant Digital QR Voucher</span>
                </div>
              </div>

              <a routerLink="/bikes" class="btn btn-outline-primary w-100 rounded-pill fw-bold py-2.5">
                <i class="fa-solid fa-compass me-1.5"></i> Explore Full Catalog
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- EXPERIENCE SELECTOR CARDS -->
      <section class="container mb-5">
        <div class="text-center mb-4">
          <span class="badge bg-secondary text-white px-3 py-1.5 rounded-pill mb-2">Flexible Options</span>
          <h2 class="display-6 fw-bold text-white font-heading">What would you like to experience?</h2>
          <p class="text-secondary">Instant online confirmation with counter pickup or instant tour reservation</p>
        </div>

        <div class="row g-4">
          <!-- Guided Tours Card -->
          <div class="col-12 col-md-6">
            <div class="card bg-dark border-primary border-opacity-30 rounded-4 p-4 h-100 shadow-sm hover-shadow transition d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="bg-primary bg-gradient text-white rounded-3 p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                  <i class="fa-solid fa-person-biking fa-xl text-white"></i>
                </div>
                <span class="badge bg-primary rounded-pill px-3 py-1.5 fs-6">From €35 / Person</span>
              </div>

              <h3 class="fw-bold text-white mb-2 font-heading">Guided Coastal Tours</h3>
              <p class="text-secondary mb-4 flex-grow-1">
                Join bilingual expert guides for stunning rides along Port of Málaga, Alcazaba viewpoints, and Mijas countryside with authentic tapas stops.
              </p>

              <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-primary btn-lg rounded-pill w-100 shadow-sm fw-bold">
                <i class="fa-solid fa-compass me-2"></i> Book Guided Tour
              </a>
            </div>
          </div>

          <!-- Fleet Rental Card -->
          <div class="col-12 col-md-6">
            <div class="card bg-dark border-warning border-opacity-30 rounded-4 p-4 h-100 shadow-sm hover-shadow transition d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="bg-warning bg-gradient text-dark rounded-3 p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                  <i class="fa-solid fa-bolt fa-xl text-dark"></i>
                </div>
                <span class="badge bg-warning text-dark rounded-pill px-3 py-1.5 fs-6 fw-bold">From €18 / Day</span>
              </div>

              <h3 class="fw-bold text-white mb-2 font-heading">Self-Guided Fleet Rental</h3>
              <p class="text-secondary mb-4 flex-grow-1">
                Ride at your own pace with top-tier city bicycles, 500W long-range e-bikes, and Xiaomi Pro electric scooters.
              </p>

              <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" class="btn btn-warning btn-lg rounded-pill text-dark fw-bold w-100 shadow-sm">
                <i class="fa-solid fa-bicycle me-2"></i> Rent Vehicle Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- WHY CHOOSE ORIVEXBIKE GRID -->
      <section class="container mb-5">
        <div class="card bg-dark bg-gradient border-secondary border-opacity-25 rounded-4 p-4 p-md-5 shadow-lg">
          <div class="text-center mb-5">
            <h2 class="fw-bold text-white font-heading">Why Ride With OrivexBike?</h2>
            <p class="text-secondary">Certified quality Standards by Orivex Technology S.L.</p>
          </div>

          <div class="row g-4 text-center">
            <div class="col-12 col-sm-6 col-md-3">
              <div class="p-3 bg-secondary bg-opacity-10 rounded-4 h-100 border border-secondary border-opacity-25">
                <div class="icon-box bg-primary bg-opacity-20 text-primary rounded-circle p-3 d-inline-flex mb-3">
                  <i class="fa-solid fa-shield-halved fa-2x"></i>
                </div>
                <h5 class="fw-bold text-white mb-2">Safety Gear Included</h5>
                <p class="text-secondary small mb-0">Free helmets, anti-theft locks, and front/rear LED safety lights with every rental.</p>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <div class="p-3 bg-secondary bg-opacity-10 rounded-4 h-100 border border-secondary border-opacity-25">
                <div class="icon-box bg-success bg-opacity-20 text-success rounded-circle p-3 d-inline-flex mb-3">
                  <i class="fa-solid fa-battery-full fa-2x"></i>
                </div>
                <h5 class="fw-bold text-white mb-2">Long Range Batteries</h5>
                <p class="text-secondary small mb-0">Up to 60 km range, 100% inspected and fully charged prior to customer pickup.</p>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <div class="p-3 bg-secondary bg-opacity-10 rounded-4 h-100 border border-secondary border-opacity-25">
                <div class="icon-box bg-warning bg-opacity-20 text-warning rounded-circle p-3 d-inline-flex mb-3">
                  <i class="fa-solid fa-qrcode fa-2x"></i>
                </div>
                <h5 class="fw-bold text-white mb-2">Instant QR Voucher</h5>
                <p class="text-secondary small mb-0">Zero paperwork. Instant QR booking voucher sent to your phone for rapid counter pickup.</p>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <div class="p-3 bg-secondary bg-opacity-10 rounded-4 h-100 border border-secondary border-opacity-25">
                <div class="icon-box bg-info bg-opacity-20 text-info rounded-circle p-3 d-inline-flex mb-3">
                  <i class="fa-solid fa-headset fa-2x"></i>
                </div>
                <h5 class="fw-bold text-white mb-2">24/7 Road Support</h5>
                <p class="text-secondary small mb-0">Roadside assistance and vehicle replacement across Málaga & Mijas coast.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA BANNER -->
      <section class="container mb-5">
        <div class="card bg-primary bg-gradient text-white rounded-4 p-4 p-md-5 shadow-lg border-0 text-center">
          <h2 class="display-6 fw-extrabold font-heading mb-2">Ready to Explore Málaga?</h2>
          <p class="lead opacity-90 mb-4" style="max-width: 600px; margin: 0 auto;">
            Reserve your bike or tour online in under 60 seconds. Pay online or at the store counter.
          </p>

          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <a routerLink="/book" class="btn btn-dark btn-lg rounded-pill px-5 fw-bold shadow">
              <i class="fa-solid fa-calendar-check me-2 text-warning"></i> Book Online Now
            </a>
            <a routerLink="/locations" class="btn btn-outline-light btn-lg rounded-pill px-4">
              <i class="fa-solid fa-store me-2"></i> Store Locations
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class PublicHomePageComponent {
  i18n = inject(I18nService);
}
