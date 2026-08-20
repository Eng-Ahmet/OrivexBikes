import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-public-policies-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 900px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 p-md-5 shadow-sm">
        <h1 class="fw-extrabold text-white font-heading mb-3">{{ title }}</h1>
        <p class="text-secondary small border-bottom border-secondary pb-3 mb-4">Last Updated: August 20, 2026 | QQBikes Málaga S.L.</p>

        <!-- Terms & Conditions Section -->
        <div *ngIf="policyType === 'terms'" class="text-secondary">
          <h5 class="fw-bold text-white mb-2">1. Terms of Rental Service</h5>
          <p>By reserving or renting a vehicle from QQBikes Málaga S.L., the customer agrees to abide by all local traffic regulations in Spain, operate vehicles responsibly, and return equipment at the agreed store location by the designated return time.</p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Security Deposits & Guarantee</h5>
          <p>A mandatory security deposit or credit card pre-authorization is required upon pickup. Deposits are fully released upon safe return of undamaged equipment.</p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Late Returns</h5>
          <p>A 15-minute grace period is granted. Beyond 15 minutes, standard hourly rates will be charged to the customer contract.</p>
        </div>

        <!-- Privacy Policy Section -->
        <div *ngIf="policyType === 'privacy'" class="text-secondary">
          <h5 class="fw-bold text-white mb-2">1. GDPR Data Processing</h5>
          <p>In compliance with the General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018, QQBikes collects personal data (Name, Email, Phone, Passport ID) solely for rental contract execution and safety verification.</p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Data Isolation & Protection</h5>
          <p>Your personal identity documents and phone numbers are encrypted and isolated within administrative databases. QQBikes never sells or transfers personal data to third parties.</p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Right to Erasure</h5>
          <p>Customers may request data access or account deletion by contacting info&#64;qqbikes.es.</p>
        </div>

        <!-- Rental Terms Section -->
        <div *ngIf="policyType === 'rental-terms'" class="text-secondary">
          <h5 class="fw-bold text-white mb-2">1. Rider Qualifications</h5>
          <p>Riders must be at least 16 years of age for electric scooters and 14 for bicycles. Helmets are mandatory for all electric scooter riders and minors.</p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Maintenance & Damage Responsibility</h5>
          <p>The hirer is responsible for loss, theft, or damage to the vehicle during the rental period. Punctures caused by reckless off-road riding are subject to standard repair fees.</p>
        </div>

        <div class="mt-5 pt-3 border-top border-secondary text-center">
          <a routerLink="/book" class="btn btn-primary rounded-pill px-4 fw-bold me-2">
            <i class="fa-solid fa-calendar-check me-1"></i> Proceed to Booking
          </a>
          <a routerLink="/home" class="btn btn-outline-light rounded-pill px-4">
            <i class="fa-solid fa-house me-1"></i> Home Page
          </a>
        </div>
      </div>
    </div>
  `
})
export class PublicPoliciesPageComponent implements OnInit {
  private router = inject(Router);

  title = 'Terms of Service';
  policyType = 'terms';

  ngOnInit() {
    const url = this.router.url;
    if (url.includes('privacy')) {
      this.title = 'Privacy Policy (GDPR)';
      this.policyType = 'privacy';
    } else if (url.includes('rental-terms')) {
      this.title = 'Rental Policy & Rules';
      this.policyType = 'rental-terms';
    } else {
      this.title = 'Terms & Conditions of Service';
      this.policyType = 'terms';
    }
  }
}
