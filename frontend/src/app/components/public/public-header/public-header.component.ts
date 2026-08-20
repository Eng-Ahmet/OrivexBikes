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
        <div class="container-fluid d-flex align-items-center justify-content-between px-3 px-md-4 w-100">
          <!-- Public Brand Logo & Title -->
          <a class="navbar-brand d-flex align-items-center text-decoration-none me-auto text-nowrap" routerLink="/home">
            <div class="brand-icon bg-primary bg-gradient text-white rounded-3 p-1.5 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
              <i class="fa-solid fa-bicycle"></i>
            </div>
            <div>
              <span class="fs-5 fw-extrabold tracking-tight text-white font-heading">Orivex<span class="text-primary">Bike</span></span>
              <span class="d-none d-sm-block text-secondary text-uppercase fw-semibold" style="font-size: 0.55rem; letter-spacing: 0.5px; margin-top: -3px;">By Orivex Technology</span>
            </div>
          </a>

          <!-- Mobile Actions & Toggler: Clean Minimalist Top Bar -->
          <div class="d-flex align-items-center gap-2 d-lg-none text-nowrap ms-auto">
            <!-- Mobile Language Selector -->
            <div class="dropdown text-nowrap">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-2.5 py-1 d-flex align-items-center text-white text-nowrap" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-globe text-primary me-1"></i>
                <span class="text-uppercase fw-semibold small">{{ i18n.currentLang() }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary">
                <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('es')">🇪🇸 <span class="ms-2">Español</span></button></li>
                <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('en')">🇬🇧 <span class="ms-2">English</span></button></li>
                <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('ar')">🇸🇦 <span class="ms-2">العربية</span></button></li>
              </ul>
            </div>

            <!-- Mobile Navbar Menu Toggler -->
            <button class="navbar-toggler border-secondary text-white p-1.5 rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbarNav" aria-controls="publicNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <i class="fa-solid fa-bars fa-lg"></i>
            </button>
          </div>

          <!-- Navbar Collapsible Area -->
          <div class="collapse navbar-collapse mt-3 mt-lg-0" id="publicNavbarNav">
            <div class="p-3 p-lg-0 rounded-4 bg-dark bg-opacity-95 border border-secondary border-opacity-25 border-lg-0 bg-lg-transparent w-100 d-lg-flex align-items-center">
              <ul class="navbar-nav me-auto mb-3 mb-lg-0 gap-1 align-items-lg-center text-nowrap">
                <li class="nav-item">
                  <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-house text-primary me-2"></i> <span>Home</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/bikes" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-bolt text-warning me-2"></i> <span>Fleet Catalog</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/tours" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-person-biking text-info me-2"></i> <span>Guided Tours</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/locations" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-store text-success me-2"></i> <span>Locations</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/reviews" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-star text-warning me-2"></i> <span>Reviews</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/faq" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-circle-question text-secondary me-2"></i> <span>FAQ</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a routerLink="/support" routerLinkActive="active" (click)="closeNav()" class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 d-flex align-items-center text-nowrap">
                    <i class="fa-solid fa-headset text-danger me-2"></i> <span>Support</span>
                  </a>
                </li>

                <!-- Legal Policies Dropdown Nav Link -->
                <li class="nav-item dropdown">
                  <a class="nav-link text-white-50 text-hover-white px-2.5 py-2 rounded-3 dropdown-toggle d-flex align-items-center text-nowrap" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-scale-balanced text-primary me-2"></i> <span>Legal Policies</span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-dark shadow-lg border-secondary rounded-3">
                    <li>
                      <a routerLink="/privacy" (click)="closeNav()" class="dropdown-item py-2.5 text-white d-flex align-items-center text-nowrap">
                        <i class="fa-solid fa-user-shield text-primary me-2.5"></i> <span>Política de Privacidad (RGPD)</span>
                      </a>
                    </li>
                    <li>
                      <a routerLink="/terms" (click)="closeNav()" class="dropdown-item py-2.5 text-white d-flex align-items-center text-nowrap">
                        <i class="fa-solid fa-file-contract text-warning me-2.5"></i> <span>Términos del Contrato</span>
                      </a>
                    </li>
                    <li>
                      <a routerLink="/rental-terms" (click)="closeNav()" class="dropdown-item py-2.5 text-white d-flex align-items-center text-nowrap">
                        <i class="fa-solid fa-lock text-success me-2.5"></i> <span>Seguridad Interna de Datos</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>

              <!-- Customer Header Right Actions (Compact Desktop View & Stacked Mobile) -->
              <div class="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 pt-3 pt-lg-0 border-top border-secondary border-opacity-25 border-lg-0 ms-lg-auto">
                <!-- Primary Book Now CTA Button -->
                <a routerLink="/book" (click)="closeNav()" class="btn btn-primary btn-sm rounded-pill px-3 py-1.5 shadow-sm fw-bold d-inline-flex align-items-center justify-content-center text-nowrap">
                  <i class="fa-solid fa-calendar-check me-2"></i>
                  <span>Book Now</span>
                </a>

                <!-- Booking Lookup Link -->
                <a routerLink="/my-booking" (click)="closeNav()" class="btn btn-outline-info btn-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center justify-content-center text-nowrap" title="Manage Booking">
                  <i class="fa-solid fa-magnifying-glass me-2"></i>
                  <span>My Booking</span>
                </a>

                <!-- Staff / Admin Portal Link -->
                <a routerLink="/login" (click)="closeNav()" class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center justify-content-center text-secondary text-nowrap" title="Staff Portal Login">
                  <i class="fa-solid fa-user-gear me-2"></i>
                  <span>Staff Login</span>
                </a>

                <!-- Language Selector Dropdown (Desktop) -->
                <div class="dropdown d-none d-lg-block text-nowrap ms-lg-1">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 py-1.5 d-flex align-items-center text-white text-nowrap" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-globe text-primary me-2"></i>
                    <span class="text-uppercase fw-semibold">{{ i18n.currentLang() }}</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary">
                    <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('es')">🇪🇸 <span class="ms-2">Español</span></button></li>
                    <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('en')">🇬🇧 <span class="ms-2">English</span></button></li>
                    <li><button class="dropdown-item d-flex align-items-center text-nowrap" (click)="selectLang('ar')">🇸🇦 <span class="ms-2">العربية</span></button></li>
                  </ul>
                </div>
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
    this.closeNav();
  }

  closeNav() {
    const navEl = document.getElementById('publicNavbarNav');
    if (navEl && navEl.classList.contains('show')) {
      navEl.classList.remove('show');
    }
  }
}
