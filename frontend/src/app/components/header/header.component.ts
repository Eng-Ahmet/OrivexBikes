import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../core/services/i18n.service';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2">
      <!-- Brand Logo & Title -->
      <a class="navbar-brand d-flex align-items-center text-decoration-none me-4" href="#">
        <div class="bg-primary bg-gradient text-white rounded-3 p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="fa-solid fa-bicycle fa-lg"></i>
        </div>
        <div>
          <span class="fs-4 fw-bold tracking-tight text-white font-heading">QQ<span class="text-primary">Bikes</span></span>
          <span class="badge bg-secondary text-light ms-2 px-2 py-1 align-middle" style="font-size: 0.7rem; font-weight: 500;">v2.0 Angular</span>
        </div>
      </a>

      <!-- Public Booking Engine Quick Link -->
      <a routerLink="/book" class="btn btn-success btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-2">
        <i class="fa-solid fa-calendar-check text-white"></i>
        <span class="fw-bold">Book Online</span>
      </a>

      <!-- Quick Action Controls -->
      <div class="d-flex align-items-center flex-wrap gap-2 ms-auto">
        <!-- Shift Status Indicator Badge -->
        @if (state.activeShift()) {
          <div class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
            <span><i class="fa-solid fa-cash-register me-1"></i> {{ i18n.t('activeShift') }}: <strong>€{{ state.activeShift()?.opening_cash || 0 }}</strong></span>
          </div>
        } @else {
          <div class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ i18n.t('noActiveShift') }}</span>
          </div>
        }

        <!-- Store Location Dropdown -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
            <i class="fa-solid fa-store text-info"></i>
            <span>{{ getStoreName(state.activeStoreId()) }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><button class="dropdown-item" (click)="selectStore(1)"><i class="fa-solid fa-shop me-2 text-primary"></i> Tienda Central Málaga</button></li>
            <li><button class="dropdown-item" (click)="selectStore(2)"><i class="fa-solid fa-tent me-2 text-warning"></i> Camping Mijas</button></li>
          </ul>
        </div>

        <!-- Role Badge -->
        <span class="badge rounded-pill px-3 py-2" [class.bg-primary]="state.activeRole() === 'ADMIN'" [class.bg-info]="state.activeRole() === 'EMPLOYEE'">
          <i class="fa-solid me-1" [class.fa-user-shield]="state.activeRole() === 'ADMIN'" [class.fa-user-gear]="state.activeRole() === 'EMPLOYEE'"></i>
          {{ state.activeRole() }}
        </span>

        <!-- Language Selector Dropdown -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
            <i class="fa-solid fa-globe text-primary"></i>
            <span class="text-uppercase">{{ i18n.currentLang() }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><button class="dropdown-item" (click)="selectLang('es')">🇪🇸 Español</button></li>
            <li><button class="dropdown-item" (click)="selectLang('en')">🇬🇧 English</button></li>
            <li><button class="dropdown-item" (click)="selectLang('ar')">🇸🇦 العربية</button></li>
          </ul>
        </div>

        <!-- Mobile Drawer Toggle -->
        <button class="btn btn-outline-light btn-sm d-md-none rounded-circle ms-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebarDrawer">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  `
})
export class HeaderComponent {
  i18n = inject(I18nService);
  state = inject(StateService);
  api = inject(ApiService);

  getStoreName(id: number): string {
    return id === 2 ? 'Camping Mijas' : 'Tienda Central Málaga';
  }

  selectStore(id: number) {
    this.state.setActiveStore(id);
    this.state.showToast('Tienda Cambiada', `Se ha cambiado al local: ${this.getStoreName(id)}`, 'info');
  }

  selectLang(lang: Language) {
    this.i18n.setLanguage(lang);
  }
}
