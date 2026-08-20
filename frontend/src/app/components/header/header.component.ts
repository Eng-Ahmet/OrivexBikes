import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../core/services/i18n.service';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';

import { Router, RouterModule } from '@angular/router';

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
        <!-- Real-Time Shift Till Cash Indicator Badge -->
        @if (state.activeShift()) {
          <div class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
            <span><i class="fa-solid fa-cash-register me-1 text-success"></i> {{ i18n.t('activeShift') }}: <strong class="text-white font-mono">€{{ (state.activeShift()?.expected_cash || state.activeShift()?.opening_cash || 0).toFixed(2) }}</strong></span>
          </div>
        } @else {
          <div class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ i18n.t('noActiveShift') }}</span>
          </div>
        }

        <!-- Store Location Selector (ADMIN vs EMPLOYEE) -->
        @if (state.activeRole() === 'ADMIN') {
          <div class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-store text-info"></i>
              <span>{{ state.getStoreName(state.activeStoreId()) }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li><button class="dropdown-item fw-bold text-primary" (click)="selectStore(null)"><i class="fa-solid fa-globe me-2"></i> 🌐 All Stores Context (Company-Wide)</button></li>
              <li><hr class="dropdown-divider"></li>
              @for (st of state.stores(); track st.id) {
                <li><button class="dropdown-item" (click)="selectStore(st.id)"><i class="fa-solid fa-shop me-2 text-info"></i> {{ st.name }} ({{ st.code }})</button></li>
              }
            </ul>
          </div>
        } @else {
          <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
            <i class="fa-solid fa-lock text-warning me-1"></i> Store: {{ state.getStoreName(state.activeStoreId()) }}
          </div>
        }

        <!-- Rich Active Logged-in Staff Profile Card with Dropdown -->
        <div class="dropdown">
          <button class="btn btn-dark border border-secondary rounded-pill px-3 py-1 text-white shadow-sm d-flex align-items-center gap-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 26px; height: 26px; font-size: 0.75rem;">
              {{ (state.currentUser()?.first_name || state.currentUser()?.username || 'S').charAt(0).toUpperCase() }}
            </div>
            <div class="d-flex flex-column text-start" style="line-height: 1.1;">
              <span class="fw-bold text-white small">{{ state.currentUser()?.first_name || state.currentUser()?.username }} {{ state.currentUser()?.last_name || '' }}</span>
              <span class="text-info" style="font-size: 0.68rem;">
                <i class="fa-solid fa-id-badge me-1"></i>{{ state.activeRole() }} &bull; {{ state.getStoreName(state.activeStoreId()) }}
              </span>
            </div>
          </button>
          <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary shadow p-2" style="background-color: #121824 !important;">
            <li>
              <div class="px-3 py-2 border-bottom border-secondary mb-2 text-light">
                <div class="fw-bold text-white">{{ state.currentUser()?.first_name }} {{ state.currentUser()?.last_name }}</div>
                <div class="text-secondary small">&#64;{{ state.currentUser()?.username }} ({{ state.activeRole() }})</div>
              </div>
            </li>
            <li>
              <button class="dropdown-item text-danger fw-bold rounded-2 d-flex align-items-center gap-2 py-2" (click)="handleLogout()">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>{{ i18n.t('logout') }}</span>
              </button>
            </li>
          </ul>
        </div>

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
  router = inject(Router);

  async ngOnInit() {
    try {
      const storesList = await this.api.getStores();
      if (storesList && storesList.length > 0) {
        this.state.stores.set(storesList);
      }
    } catch (e) {}
  }

  selectStore(id: number | null) {
    if (this.state.activeRole() === 'EMPLOYEE') return;
    this.state.setActiveStore(id);
    this.state.showToast('Store Scope Updated', `Active context set to: ${this.state.getStoreName(id)}`, 'info');
  }

  selectLang(lang: Language) {
    this.i18n.setLanguage(lang);
  }

  handleLogout() {
    this.state.logout();
    this.router.navigate(['/login']);
  }
}


