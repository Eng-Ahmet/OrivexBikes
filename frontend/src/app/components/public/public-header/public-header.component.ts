import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService, Language } from '../../../core/services/i18n.service';
import { StateService } from '../../../core/services/state.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top border-bottom border-secondary-subtle px-3 px-md-5 bg-dark bg-gradient">
      <div class="container-fluid">
        <!-- Public Brand Logo & Title -->
        <a class="navbar-brand d-flex align-items-center text-decoration-none me-4" routerLink="/home">
          <div class="bg-primary bg-gradient text-white rounded-3 p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="fa-solid fa-bicycle fa-lg"></i>
          </div>
          <div>
            <span class="fs-4 fw-bold tracking-tight text-white font-heading">QQ<span class="text-primary">Bikes</span></span>
            <span class="d-block text-secondary" style="font-size: 0.65rem; margin-top: -4px;">Málaga Coast Rentals & Tours</span>
          </div>
        </a>

        <!-- Mobile Toggler -->
        <button class="btn btn-outline-light btn-sm d-lg-none rounded-circle ms-auto me-2" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbarNav">
          <i class="fa-solid fa-bars"></i>
        </button>

        <!-- Navbar Navigation Links -->
        <div class="collapse navbar-collapse" id="publicNavbarNav">
          <ul class="navbar-menu navbar-nav me-auto mb-2 mb-lg-0 gap-1 gap-lg-2">
            <li class="nav-item">
              <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link text-light px-3 py-2 rounded-3">
                <i class="fa-solid fa-house me-1 text-primary"></i> Home
              </a>
            </li>
            <li class="nav-item">
              <a [routerLink]="['/book']" [queryParams]="{mode: 'TOUR'}" routerLinkActive="active" class="nav-link text-light px-3 py-2 rounded-3">
                <i class="fa-solid fa-person-biking me-1 text-info"></i> Tours & Experiences
              </a>
            </li>
            <li class="nav-item">
              <a [routerLink]="['/book']" [queryParams]="{mode: 'FLEET'}" routerLinkActive="active" class="nav-link text-light px-3 py-2 rounded-3">
                <i class="fa-solid fa-bolt me-1 text-warning"></i> Bikes & Scooters
              </a>
            </li>
          </ul>

          <!-- Customer Header Right Actions -->
          <div class="d-flex align-items-center flex-wrap gap-2">
            <!-- Language Selector Dropdown -->
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 d-flex align-items-center gap-2 text-light" type="button" data-bs-toggle="dropdown">
                <i class="fa-solid fa-globe text-primary"></i>
                <span class="text-uppercase">{{ i18n.currentLang() }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><button class="dropdown-item" (click)="selectLang('es')">🇪🇸 Español</button></li>
                <li><button class="dropdown-item" (click)="selectLang('en')">🇬🇧 English</button></li>
                <li><button class="dropdown-item" (click)="selectLang('ar')">🇸🇦 العربية</button></li>
              </ul>
            </div>

            <!-- Staff / Admin Portal Link -->
            <a routerLink="/login" class="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 text-secondary" title="Staff Portal Login">
              <i class="fa-solid fa-lock"></i>
              <span class="d-none d-sm-inline">Staff Login</span>
            </a>

            <!-- Primary Book Now CTA Button -->
            <a routerLink="/book" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm fw-bold">
              <i class="fa-solid fa-calendar-check me-1"></i> Book Now
            </a>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class PublicHeaderComponent {
  i18n = inject(I18nService);
  state = inject(StateService);

  selectLang(lang: Language) {
    this.i18n.setLanguage(lang);
  }
}
