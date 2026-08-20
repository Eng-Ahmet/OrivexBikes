import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService, Language } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky-top z-3 w-100">
      <nav class="navbar navbar-expand-lg navbar-dark border-bottom border-secondary border-opacity-25 py-2.5 shadow-lg w-100" style="backdrop-filter: blur(16px); background: rgba(11, 15, 25, 0.96) !important;">
        <div class="container-fluid px-3 px-md-4">
          <!-- Public Brand Logo & Title -->
          <a class="navbar-brand d-flex align-items-center text-decoration-none me-3 text-nowrap" routerLink="/home">
            <div class="brand-icon bg-primary bg-gradient text-white rounded-3 p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="fa-solid fa-bicycle fa-lg"></i>
            </div>
            <div>
              <span class="fs-4 fw-extrabold tracking-tight text-white font-heading">Orivex<span class="text-primary">Bike</span></span>
              <span class="d-block text-secondary text-uppercase fw-semibold" style="font-size: 0.625rem; letter-spacing: 0.6px; margin-top: -3px;">By Orivex Technology</span>
            </div>
          </a>

          <!-- Mobile Actions & Toggler -->
          <div class="d-flex align-items-center gap-2 d-lg-none ms-auto me-2 text-nowrap">
            <a routerLink="/book" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-bold">
              <i class="fa-solid fa-calendar-check me-1"></i> Book
            </a>
            <button class="navbar-toggler border-secondary text-white p-2 rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbarNav" aria-controls="publicNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <i class="fa-solid fa-bars fa-lg"></i>
            </button>
          </div>

          <!-- Navbar Collapsible Area -->
          <div class="collapse navbar-collapse mt-3 mt-lg-0" id="publicNavbarNav">
            <div class="p-3 p-lg-0 rounded-4 bg-dark bg-opacity-95 border border-secondary border-opacity-25 border-lg-0 bg-lg-transparent w-100 d-lg-flex align-items-center">
              <ul class="navbar-nav me-auto mb-3 mb-lg-0 gap-1 align-items-lg-center text-nowrap">
                <li class="nav-item">
                  <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-house text-primary"></i> <span>Home</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/bikes" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-bolt text-warning"></i> <span>Fleet Catalog</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/tours" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-person-biking text-info"></i> <span>Guided Tours</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/locations" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-store text-success"></i> <span>Locations</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/reviews" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-star text-warning"></i> <span>Reviews</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/faq" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-circle-question text-secondary"></i> <span>FAQ</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/support" routerLinkActive="active" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center gap-1.5 text-nowrap">
                    <i class="fa-solid fa-headset text-danger"></i> <span>Support</span>
                  </a>
                </li>

                <!-- Legal Policies Dropdown Nav Link -->
                <li class="nav-item dropdown">
                  <a class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 dropdown-toggle d-flex align-items-center gap-1.5 text-nowrap" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-scale-balanced text-primary"></i> <span>Legal Policies</span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-dark shadow-lg border-secondary rounded-3">
                    <li>
                      <a routerLink="/privacy" class="dropdown-item py-2.5 text-white d-flex align-items-center gap-2 text-nowrap">
                        <i class="fa-solid fa-user-shield text-primary"></i> <span>Política de Privacidad (RGPD)</span>
                      </a>
                    </li>
                    <li>
                      <a routerLink="/terms" class="dropdown-item py-2.5 text-white d-flex align-items-center gap-2 text-nowrap">
                        <i class="fa-solid fa-file-contract text-warning"></i> <span>Términos del Contrato</span>
                      </a>
                    </li>
                    <li>
                      <a routerLink="/rental-terms" class="dropdown-item py-2.5 text-white d-flex align-items-center gap-2 text-nowrap">
                        <i class="fa-solid fa-lock text-success"></i> <span>Seguridad Interna de Datos</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>

              <!-- Customer Header Right Actions -->
              <div class="d-flex align-items-center flex-nowrap gap-2 pt-3 pt-lg-0 border-top border-secondary border-opacity-25 border-lg-0 ms-lg-auto text-nowrap">
                <!-- Booking Lookup Link -->
                <a routerLink="/my-booking" class="btn btn-outline-info btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 text-nowrap" title="Manage Booking">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <span>My Booking</span>
                </a>

                <!-- Language Selector Dropdown -->
                <div class="dropdown text-nowrap">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 d-flex align-items-center gap-1.5 text-white text-nowrap" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-globe text-primary"></i>
                    <span class="text-uppercase fw-semibold">{{ i18n.currentLang() }}</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary">
                    <li><button class="dropdown-item d-flex align-items-center gap-2 text-nowrap" (click)="selectLang('es')">🇪🇸 <span>Español</span></button></li>
                    <li><button class="dropdown-item d-flex align-items-center gap-2 text-nowrap" (click)="selectLang('en')">🇬🇧 <span>English</span></button></li>
                    <li><button class="dropdown-item d-flex align-items-center gap-2 text-nowrap" (click)="selectLang('ar')">🇸🇦 <span>العربية</span></button></li>
                  </ul>
                </div>

                <!-- Staff / Admin Portal Link -->
                <a routerLink="/login" class="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 text-secondary text-nowrap" title="Staff Portal Login">
                  <i class="fa-solid fa-user-gear"></i>
                  <span>Staff Login</span>
                </a>

                <!-- Primary Book Now CTA Button (Desktop view) -->
                <a routerLink="/book" class="btn btn-primary btn-sm rounded-pill px-3.5 shadow-sm fw-bold d-none d-lg-inline-flex align-items-center gap-1.5 text-nowrap">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span>Book Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .nav-link.active {
      color: #fff !important;
      background: rgba(13, 110, 253, 0.15);
      font-weight: 600;
    }
    .text-hover-white:hover {
      color: #fff !important;
    }
    .navbar-nav .nav-link {
      white-space: nowrap;
    }
  `]
})
export class PublicHeaderComponent {
  i18n = inject(I18nService);

  selectLang(lang: Language) {
    this.i18n.setLanguage(lang);
  }
}
