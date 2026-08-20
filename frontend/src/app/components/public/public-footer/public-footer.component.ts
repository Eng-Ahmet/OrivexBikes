import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-dark text-light border-top border-secondary-subtle pt-5 pb-4 mt-5">
      <div class="container px-4">
        <div class="row g-4">
          <!-- Brand Bio & Contact -->
          <div class="col-12 col-md-4">
            <div class="d-flex align-items-center mb-3">
              <div class="bg-primary bg-gradient text-white rounded-3 p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                <i class="fa-solid fa-bicycle"></i>
              </div>
              <span class="fs-4 fw-bold font-heading text-white">QQ<span class="text-primary">Bikes</span></span>
            </div>
            <p class="text-secondary small mb-3">
              Málaga's premier bike, e-bike, and electric scooter rental service. Offering guided coastal tours, daily rentals, and instant online bookings.
            </p>
            <div class="d-flex gap-3 text-secondary">
              <a href="#" class="text-secondary hover-text-primary"><i class="fa-brands fa-facebook fa-lg"></i></a>
              <a href="#" class="text-secondary hover-text-primary"><i class="fa-brands fa-instagram fa-lg"></i></a>
              <a href="#" class="text-secondary hover-text-primary"><i class="fa-brands fa-whatsapp fa-lg"></i></a>
              <a href="#" class="text-secondary hover-text-primary"><i class="fa-brands fa-tripadvisor fa-lg"></i></a>
            </div>
          </div>

          <!-- Quick Navigation Links -->
          <div class="col-6 col-md-2">
            <h6 class="fw-bold text-white mb-3 font-heading">Explore</h6>
            <ul class="list-unstyled text-secondary small">
              <li class="mb-2"><a routerLink="/home" class="text-secondary text-decoration-none hover-text-light"><i class="fa-solid fa-angle-right me-1 text-primary"></i> Home</a></li>
              <li class="mb-2"><a routerLink="/book" class="text-secondary text-decoration-none hover-text-light"><i class="fa-solid fa-angle-right me-1 text-primary"></i> Guided Tours</a></li>
              <li class="mb-2"><a routerLink="/book" class="text-secondary text-decoration-none hover-text-light"><i class="fa-solid fa-angle-right me-1 text-primary"></i> Bike Rental</a></li>
              <li class="mb-2"><a routerLink="/book" class="text-secondary text-decoration-none hover-text-light"><i class="fa-solid fa-angle-right me-1 text-primary"></i> E-Scooters</a></li>
            </ul>
          </div>

          <!-- Store Hours & Support -->
          <div class="col-6 col-md-3">
            <h6 class="fw-bold text-white mb-3 font-heading">Store Locations</h6>
            <div class="text-secondary small mb-2">
              <i class="fa-solid fa-store text-warning me-2"></i> <strong>Central Store:</strong><br />
              Paseo Marítimo 12, Málaga Beach
            </div>
            <div class="text-secondary small mb-2">
              <i class="fa-solid fa-tent text-info me-2"></i> <strong>Campsite Store:</strong><br />
              Camping Mijas Coastal Resort
            </div>
            <div class="text-secondary small">
              <i class="fa-solid fa-clock me-2 text-success"></i> Open 09:00 - 21:00 Daily
            </div>
          </div>

          <!-- Contact & App Badges -->
          <div class="col-12 col-md-3">
            <h6 class="fw-bold text-white mb-3 font-heading">Customer Support</h6>
            <p class="text-secondary small mb-2"><i class="fa-solid fa-phone text-success me-2"></i> +34 952 000 111</p>
            <p class="text-secondary small mb-3"><i class="fa-solid fa-envelope text-primary me-2"></i> info&#64;qqbikes.es</p>

            <a routerLink="/book" class="btn btn-outline-primary btn-sm w-100 rounded-pill shadow-sm">
              <i class="fa-solid fa-calendar-check me-2"></i> Book Online Now
            </a>
          </div>
        </div>

        <hr class="border-secondary my-4" />

        <div class="d-flex flex-wrap align-items-center justify-content-between text-secondary small">
          <div>© 2026 QQBikes Málaga S.L. All rights reserved.</div>
          <div class="d-flex gap-3">
            <a routerLink="/fleet" class="text-secondary text-decoration-none"><i class="fa-solid fa-user-shield me-1"></i> Staff Portal</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {
  i18n = inject(I18nService);
}
