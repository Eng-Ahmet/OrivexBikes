import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';

export interface AggregatedHomeModel {
  key: string;
  name: string;
  category: string;
  store_name: string;
  hourly_rate: number;
  daily_rate: number;
  available_count: number;
  representative_id: number;
  is_scooter: boolean;
}

@Component({
  selector: 'app-public-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-wrapper overflow-hidden">
      <!-- 1. HERO BANNER SECTION -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="position-relative bg-dark text-white py-5 px-4 px-md-5 rounded-4 shadow-lg border border-secondary border-opacity-20 overflow-hidden" style="background: linear-gradient(135deg, #0b0f19 0%, #151d30 100%) !important;">
          <div class="row align-items-center g-4 py-2 position-relative z-1">
            <div class="col-12 col-lg-7">
              <span class="badge bg-secondary bg-opacity-30 text-info border border-info border-opacity-30 px-3 py-1.5 rounded-pill small mb-3 shadow-sm d-inline-flex align-items-center gap-1.5 mw-100">
                <i class="fa-solid fa-sun text-warning flex-shrink-0"></i> <span class="text-truncate" style="max-width: 260px;">Málaga & Mijas #1 Mobility Experience</span>
              </span>

              <h1 class="display-4 fw-extrabold font-heading text-white tracking-tight mb-3 lh-sm">
                Discover Costa del Sol with <span class="text-info">Orivex<span class="text-primary">Bike</span></span>
              </h1>

              <p class="lead text-secondary mb-4 fs-5" style="max-width: 620px;">
                Rent high-range electric bikes, city cruisers, and Xiaomi/Etwow e-scooters or join expert-guided sunset coastal tours powered by Orivex Technology.
              </p>

              <!-- Quick Action Buttons -->
              <div class="d-flex flex-wrap gap-3 mb-4">
                <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2">
                  <i class="fa-solid fa-bolt"></i> Rent Bikes & Scooters
                </a>
                <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-outline-light btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-person-biking text-info"></i> Guided Tours (€35)
                </a>
              </div>

              <!-- Key Stats Bar: Single Horizontal Row Grid on Mobile -->
              <div class="row g-2 pt-3 border-top border-secondary border-opacity-30 text-secondary align-items-center">
                <div class="col-3 text-center">
                  <h4 class="fw-bold text-success mb-0 fs-5">4.9 ★</h4>
                  <span class="extra-small text-secondary text-truncate d-block" title="Google & TripAdvisor">Rating</span>
                </div>
                <div class="col-3 text-center border-start border-secondary border-opacity-25">
                  <h4 class="fw-bold text-primary mb-0 fs-5">53+</h4>
                  <span class="extra-small text-secondary text-truncate d-block" title="Inspected Fleet">Fleet</span>
                </div>
                <div class="col-3 text-center border-start border-secondary border-opacity-25">
                  <h4 class="fw-bold text-info mb-0 fs-5">2 Hubs</h4>
                  <span class="extra-small text-secondary text-truncate d-block" title="Málaga & Mijas">Hubs</span>
                </div>
                <div class="col-3 text-center border-start border-secondary border-opacity-25">
                  <h4 class="fw-bold text-warning mb-0 fs-5">€0</h4>
                  <span class="extra-small text-secondary text-truncate d-block" title="No Hidden Deposit Fees">Fees</span>
                </div>
              </div>
            </div>

            <!-- Hero Right Visual Card -->
            <div class="col-12 col-lg-5 text-center">
              <div class="bg-dark p-4 p-md-5 rounded-4 border border-secondary border-opacity-30 shadow-sm position-relative overflow-hidden" style="background: #111827 !important;">
                <div class="bg-primary text-white rounded-4 p-4 mb-4 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 80px; height: 80px;">
                  <i class="fa-solid fa-bicycle fa-2xl"></i>
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
        </div>
      </section>

      <!-- 2. COMPREHENSIVE SERVICES GRID SECTION -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="text-center mb-5">
          <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 px-3 py-1.5 rounded-pill mb-2 fw-semibold">Our Complete Services</span>
          <h2 class="display-6 fw-bold text-white font-heading">Everything You Need For Your Ride</h2>
          <p class="text-secondary" style="max-width: 650px; margin: 0 auto;">From hourly city rentals to campsite delivery and workshop repairs, OrivexBike provides a complete mobility solution.</p>
        </div>

        <div class="row g-4">
          <!-- Service 1: Self-Guided Fleet Rental -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-primary text-white rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-bolt fa-xl text-white"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">Self-Guided Fleet Rental</h4>
              <p class="text-secondary small mb-3">Rent premium electric bikes, city cruisers, and Xiaomi/Etwow e-scooters by the hour or day with instant online QR check-in.</p>
              <a routerLink="/bikes" class="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                Browse Vehicle Catalog <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Service 2: Guided Coastal Tours -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-info text-dark rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-person-biking fa-xl text-dark"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">Guided Coastal Sunset Tours</h4>
              <p class="text-secondary small mb-3">Join bilingual expert guides exploring Port of Málaga, Alcazaba fortress viewpoints, and Mijas countryside with authentic tapas stops.</p>
              <a routerLink="/tours" class="text-info text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                View Tour Experiences <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Service 3: Campsite & Hotel Delivery -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-success text-white rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-truck-ramp-box fa-xl text-white"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">Campsite & Hotel Delivery</h4>
              <p class="text-secondary small mb-3">We deliver fully charged e-bikes and scooters directly to Málaga Beach Campsite, hotels, and holiday villas across Mijas coast.</p>
              <a routerLink="/locations" class="text-success text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                Check Delivery Hubs <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Service 4: Corporate & Group Events -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-warning text-dark rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-users fa-xl text-dark"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">Group & Corporate Packages</h4>
              <p class="text-secondary small mb-3">Custom eco-friendly group excursions, team building rides, and long-term holiday rentals with tailored group discounts.</p>
              <a routerLink="/support" class="text-warning text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                Request Group Quote <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Service 5: Repair & Workshop Services -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-danger text-white rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-wrench fa-xl text-white"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">On-Site Repair & Maintenance</h4>
              <p class="text-secondary small mb-3">Professional workshop service for bicycles and e-scooters, including tire replacement, brake adjustments, and battery diagnostics.</p>
              <a routerLink="/support" class="text-danger text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                Book Workshop Service <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Service 6: 24/7 Roadside Assistance -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm hover-shadow transition" style="background: #111827 !important;">
              <div class="bg-secondary text-white rounded-3 p-3 mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 52px; height: 52px;">
                <i class="fa-solid fa-headset fa-xl text-white"></i>
              </div>
              <h4 class="fw-bold text-white mb-2 font-heading">24/7 Coastal Support</h4>
              <p class="text-secondary small mb-3">On-call roadside assistance and swift vehicle swaps anywhere along Málaga and Mijas beachfront promenades.</p>
              <a routerLink="/support" class="text-secondary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 mt-auto">
                Contact Customer Support <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>



      <!-- 4. GUIDED TOURS SPOTLIGHT SECTION -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="card bg-dark border-primary border-opacity-30 rounded-4 p-4 p-md-5 shadow-lg overflow-hidden position-relative" style="background: #0f172a !important;">
          <div class="row align-items-center g-4">
            <div class="col-12 col-lg-7">
              <span class="badge bg-info text-dark fw-bold px-3 py-1.5 rounded-pill mb-2">Guided Coastal Adventures</span>
              <h2 class="display-6 fw-extrabold text-white font-heading mb-3">Explore Málaga's Best Sightseeing Routes</h2>
              <p class="text-secondary lead mb-4">
                Ride alongside local expert guides covering Port of Málaga, Malagueta Beach, Gibralfaro viewpoints, and scenic coastal paths. Small groups guarantee a personalized experience!
              </p>

              <div class="row g-3 mb-4">
                <div class="col-6 col-sm-4">
                  <div class="p-3 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-25">
                    <h5 class="fw-bold text-white mb-0">2.5 Hours</h5>
                    <span class="extra-small text-secondary">Tour Duration</span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-3 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-25">
                    <h5 class="fw-bold text-warning mb-0">Tapas Included</h5>
                    <span class="extra-small text-secondary">Local Refreshments</span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-3 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-25">
                    <h5 class="fw-bold text-info mb-0">€35 / Person</h5>
                    <span class="extra-small text-secondary">All-Inclusive Rate</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-3">
                <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" class="btn btn-info btn-lg rounded-pill text-dark fw-bold px-4 shadow">
                  <i class="fa-solid fa-ticket me-2"></i> Reserve Guided Tour
                </a>
                <a routerLink="/tours" class="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i class="fa-solid fa-list-ul me-2"></i> All Tours
                </a>
              </div>
            </div>

            <div class="col-12 col-lg-5 text-center">
              <div class="p-4 bg-secondary bg-opacity-10 rounded-4 border border-secondary border-opacity-30">
                <i class="fa-solid fa-person-biking fa-5x text-info mb-3"></i>
                <h4 class="fw-bold text-white mb-1">Sunset Coastal Tour</h4>
                <p class="text-secondary small mb-3">Daily departures from Málaga Beach Campsite Hub</p>
                <div class="badge bg-success px-3 py-2 rounded-pill">Guaranteed Small Group Max 10 Riders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. STORE LOCATIONS & CAMPSITES HUB -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="text-center mb-5">
          <span class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-3 py-1.5 rounded-pill mb-2 fw-semibold">Convenient Pickup Hubs</span>
          <h2 class="display-6 fw-bold text-white font-heading">Our Store & Campsite Locations</h2>
          <p class="text-secondary">Pickup directly at our beachfront stores or request campsite delivery.</p>
        </div>

        <div class="row g-4">
          @for (store of stores(); track store.id) {
            <div class="col-12 col-md-6">
              <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm" style="background: #111827 !important;">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="bg-success text-white rounded-3 p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 48px; height: 48px;">
                    <i class="fa-solid fa-store fa-lg"></i>
                  </div>
                  <span class="badge bg-secondary bg-opacity-30 text-white rounded-pill px-3 py-1.5">Open {{ store.operating_hours || '09:00 - 21:00' }}</span>
                </div>

                <h3 class="fw-bold text-white mb-2 font-heading">{{ store.name }}</h3>
                <p class="text-secondary small mb-3"><i class="fa-solid fa-location-dot text-danger me-2"></i> {{ store.address }}, {{ store.city }}</p>
                <p class="text-secondary small mb-4"><i class="fa-solid fa-phone text-success me-2"></i> {{ store.phone || '+34 952 000 111' }}</p>

                <div class="mt-auto d-flex gap-2">
                  <a [routerLink]="['/book']" [queryParams]="{storeId: store.id}" class="btn btn-outline-success btn-sm rounded-pill w-100 fw-bold">
                    <i class="fa-solid fa-calendar-check me-1"></i> Book at this Location
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 6. LIVE REVIEWS & CUSTOMER RATINGS -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="text-center mb-5">
          <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2 fw-bold">Customer Ratings</span>
          <h2 class="display-6 fw-bold text-white font-heading">What Our Riders Say</h2>
          <p class="text-secondary">Authentic reviews from happy riders across Málaga and Mijas coast.</p>
        </div>

        <div class="row g-4">
          @for (review of reviews(); track review.id) {
            <div class="col-12 col-md-4">
              <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 h-100 shadow-sm" style="background: #111827 !important;">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="fw-bold text-white font-heading">{{ review.customer_name }}</span>
                  <span class="text-warning small">
                    <i class="fa-solid fa-star" *ngFor="let star of [1,2,3,4,5]"></i>
                  </span>
                </div>
                <p class="text-secondary small mb-0">"{{ review.comment }}"</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 7. FREQUENTLY ASKED QUESTIONS (FAQ) -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="card bg-dark border-secondary border-opacity-25 rounded-4 p-4 p-md-5 shadow-sm" style="background: #111827 !important;">
          <div class="text-center mb-5">
            <span class="badge bg-secondary text-white px-3 py-1.5 rounded-pill mb-2">Have Questions?</span>
            <h2 class="display-6 fw-bold text-white font-heading">Frequently Asked Questions</h2>
            <p class="text-secondary">Find quick answers regarding deposits, helmet safety, and booking policies.</p>
          </div>

          <div class="accordion accordion-flush" id="publicFaqAccordion">
            @for (faq of faqs(); track faq.id; let idx = $index) {
              <div class="accordion-item bg-transparent border-bottom border-secondary border-opacity-25">
                <h2 class="accordion-header" [id]="'heading' + idx">
                  <button class="accordion-button collapsed bg-transparent text-white fw-bold shadow-none py-3" type="button" data-bs-toggle="collapse" [attr.data-bs-target]="'#collapse' + idx" aria-expanded="false" [attr.aria-controls]="'collapse' + idx">
                    <i class="fa-solid fa-circle-question me-2 text-primary"></i> {{ faq.question }}
                  </button>
                </h2>
                <div [id]="'collapse' + idx" class="accordion-collapse collapse" [attr.aria-labelledby]="'heading' + idx" data-bs-parent="#publicFaqAccordion">
                  <div class="accordion-body text-secondary small pt-0 pb-3">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- 8. FINAL CTA BANNER -->
      <section class="container-fluid px-3 px-md-4 mb-5 w-100">
        <div class="card bg-primary text-white rounded-4 p-4 p-md-5 shadow-lg border-0 text-center">
          <h2 class="display-6 fw-extrabold font-heading mb-2">Ready to Explore Málaga?</h2>
          <p class="lead opacity-90 mb-4" style="max-width: 600px; margin: 0 auto;">
            Reserve your bike or tour online in under 60 seconds. Instant digital QR voucher with pay-at-store option.
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
export class PublicHomePageComponent implements OnInit {
  private http = inject(HttpClient);
  i18n = inject(I18nService);

  aggregatedModels = signal<AggregatedHomeModel[]>([]);
  stores = signal<any[]>([]);
  reviews = signal<any[]>([]);
  faqs = signal<any[]>([]);

  ngOnInit() {
    this.loadFleet();
    this.loadStores();
    this.loadReviews();
    this.loadFaqs();
  }

  loadFleet() {
    this.http.get<any[]>('/api/v1/public/fleet').subscribe({
      next: (data) => {
        const raw = (Array.isArray(data) && data.length > 0) ? data : this.getFallbackFleet();
        this.aggregatedModels.set(this.aggregateModels(raw));
      },
      error: () => {
        const raw = this.getFallbackFleet();
        this.aggregatedModels.set(this.aggregateModels(raw));
      }
    });
  }

  loadStores() {
    this.http.get<any[]>('/api/v1/public/stores').subscribe({
      next: (data) => this.stores.set((Array.isArray(data) && data.length > 0) ? data : this.getFallbackStores()),
      error: () => this.stores.set(this.getFallbackStores())
    });
  }

  loadReviews() {
    this.http.get<any[]>('/api/v1/public/reviews').subscribe({
      next: (data) => this.reviews.set((Array.isArray(data) && data.length > 0) ? data : this.getFallbackReviews()),
      error: () => this.reviews.set(this.getFallbackReviews())
    });
  }

  loadFaqs() {
    this.http.get<any[]>('/api/v1/public/faqs').subscribe({
      next: (data) => this.faqs.set((Array.isArray(data) && data.length > 0) ? data : this.getFallbackFaqs()),
      error: () => this.faqs.set(this.getFallbackFaqs())
    });
  }

  private aggregateModels(rawFleet: any[]): AggregatedHomeModel[] {
    const map = new Map<string, AggregatedHomeModel>();

    for (const v of rawFleet) {
      const cleanName = (v.name || 'Vehicle').replace(/\s*#\d+$/i, '').trim();
      const cat = (v.category || 'General').trim();
      const key = `${cleanName}_${cat}`;

      const catLower = cat.toLowerCase();
      const nameLower = cleanName.toLowerCase();
      const isScooter = catLower.includes('scooter') || catLower.includes('patinete') || nameLower.includes('patinete') || nameLower.includes('scooter');

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: cleanName,
          category: cat,
          store_name: v.store_name || 'Málaga Beach Campsite Store',
          hourly_rate: v.hourly_rate || 8,
          daily_rate: v.daily_rate || 25,
          available_count: v.status === 'AVAILABLE' ? 1 : 0,
          representative_id: v.id,
          is_scooter: isScooter
        });
      } else {
        const existing = map.get(key)!;
        if (v.status === 'AVAILABLE') {
          existing.available_count += 1;
        }
      }
    }

    return Array.from(map.values()).slice(0, 6);
  }

  private getFallbackFleet() {
    return [
      { id: 101, name: 'Patinete Etwow #1', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, status: 'AVAILABLE' },
      { id: 102, name: 'Patinete Etwow #2', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, status: 'AVAILABLE' },
      { id: 104, name: 'Patinete Ninebot #1', category: 'Scooters', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, status: 'AVAILABLE' },
      { id: 106, name: 'E-Bike City Cruiser #1', category: 'E-Bikes', store_name: 'Málaga Beach Campsite Store', hourly_rate: 15, daily_rate: 40, status: 'AVAILABLE' },
      { id: 108, name: 'Xiaomi Pro 2 E-Scooter', category: 'Scooters', store_name: 'Mijas Coastal Hub', hourly_rate: 10, daily_rate: 28, status: 'AVAILABLE' }
    ];
  }

  private getFallbackStores() {
    return [
      { id: 1, name: 'Málaga Beach Campsite Store', city: 'Málaga', address: 'Paseo Marítimo 42', phone: '+34 952 000 111', operating_hours: '09:00 - 21:00' },
      { id: 2, name: 'Mijas Coastal Resort Store', city: 'Mijas', address: 'Av. del Mar 18', phone: '+34 952 000 222', operating_hours: '09:00 - 20:00' }
    ];
  }

  private getFallbackReviews() {
    return [
      { id: 1, customer_name: 'Marco Rossi', rating: 5, comment: 'Rented the Patinete Etwow for a full day along Málaga promenade. Super fast, great battery life, and smooth booking process!' },
      { id: 2, customer_name: 'Sarah Jenkins', rating: 5, comment: 'The guided sunset tour was the highlight of our vacation. Our guide was super knowledgeable and friendly!' },
      { id: 3, customer_name: 'Carlos Mendez', rating: 5, comment: 'Delivered directly to Málaga Beach Campsite. Excellent e-bikes and top customer support!' }
    ];
  }

  private getFallbackFaqs() {
    return [
      { id: 1, question: 'Are helmets and heavy-duty locks included with my rental?', answer: 'Yes! Every rental includes certified safety helmets, anti-theft locks, and front/rear LED safety lights free of charge.' },
      { id: 2, question: 'Do I need to pay a security deposit?', answer: 'A refundable security deposit is held during pickup (€50 for scooters, €100 for e-bikes) and instantly released upon return.' },
      { id: 3, question: 'Can I pick up at Málaga store and return at Mijas?', answer: 'Yes, cross-store drop-offs are available. Please select your pickup and return locations when completing your booking.' }
    ];
  }
}
