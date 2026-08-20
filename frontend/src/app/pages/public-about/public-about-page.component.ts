import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <span class="badge bg-primary px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-sun me-1 text-warning"></i> Málaga Born & Raised
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">About QQBikes Málaga</h1>
        <p class="text-secondary lead mb-0">Providing high-quality e-bikes, city bicycles, scooters, and guided coastal experiences since 2025.</p>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-12 col-lg-6">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 h-100 shadow-sm">
            <h3 class="fw-bold text-white font-heading mb-3"><i class="fa-solid fa-bullseye text-primary me-2"></i> Our Mission</h3>
            <p class="text-secondary mb-3">
              QQBikes was founded with a clear vision: to empower tourists and locals to explore the Costa del Sol sustainably, effortlessly, and safely.
            </p>
            <p class="text-secondary mb-0">
              We operate state-of-the-art rental hubs in Málaga Central Beach Promenade and Mijas Coastal Resort, maintaining a fleet of over 50 inspected vehicles.
            </p>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 h-100 shadow-sm">
            <h3 class="fw-bold text-white font-heading mb-3"><i class="fa-solid fa-award text-warning me-2"></i> Fleet Standards</h3>
            <ul class="list-unstyled text-secondary mb-0">
              <li class="mb-2"><i class="fa-solid fa-circle-check text-success me-2"></i> 100% inspected and battery-tested before every dispatch.</li>
              <li class="mb-2"><i class="fa-solid fa-circle-check text-success me-2"></i> Free safety helmets, heavy-duty locks, and lights included.</li>
              <li class="mb-2"><i class="fa-solid fa-circle-check text-success me-2"></i> 24/7 roadside assistance & instant vehicle replacement.</li>
              <li class="mb-0"><i class="fa-solid fa-circle-check text-success me-2"></i> Transparent daily & hourly rates with zero hidden charges.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="card bg-dark border-primary border-opacity-50 rounded-4 p-4 p-md-5 text-center shadow-lg">
        <h3 class="fw-bold text-white mb-2">Ready to explore Málaga on two wheels?</h3>
        <p class="text-secondary mb-4">Choose your preferred bike or join our guided coastal tour today.</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/bikes" class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold">
            <i class="fa-solid fa-bolt me-2"></i> Explore Fleet Catalog
          </a>
          <a routerLink="/tours" class="btn btn-outline-light btn-lg rounded-pill px-4">
            <i class="fa-solid fa-person-biking me-2"></i> Guided Tours
          </a>
        </div>
      </div>
    </div>
  `
})
export class PublicAboutPageComponent {}
