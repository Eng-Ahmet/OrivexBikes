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
  host: {
    class: 'w-100 d-block'
  },
  template: `
    <div class="container-fluid d-flex align-items-center justify-content-between px-2 px-md-4 py-1.5 w-100">
      <!-- Brand Logo & Title -->
      <a class="navbar-brand d-flex align-items-center text-decoration-none me-auto" href="#">
        <div class="bg-primary bg-gradient text-white rounded-3 p-1.5 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
          <i class="fa-solid fa-bicycle"></i>
        </div>
        <div>
          <span class="fs-5 fw-bold tracking-tight text-white font-heading">QQ<span class="text-primary">Bikes</span></span>
          <span class="badge bg-secondary text-light ms-1 px-1.5 py-0.5 align-middle d-none d-sm-inline-block" style="font-size: 0.65rem; font-weight: 500;">v2.0</span>
        </div>
      </a>

      <!-- Header Actions Bar (Pushed to Right End) -->
      <div class="d-flex align-items-center gap-2 text-nowrap ms-auto">
        <!-- Real-Time Shift Till Cash Indicator (Desktop) -->
        @if (state.activeShift()) {
          <div class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 rounded-pill d-none d-md-flex align-items-center gap-1">
            <span class="spinner-grow spinner-grow-sm text-success" role="status" style="width: 0.5rem; height: 0.5rem;"></span>
            <span><i class="fa-solid fa-cash-register me-1 text-success"></i><strong class="text-white font-mono">€{{ (state.activeShift()?.expected_cash || state.activeShift()?.opening_cash || 0).toFixed(0) }}</strong></span>
          </div>
        }

        <!-- Store Location Selector (Desktop view) -->
        @if (state.activeRole() === 'ADMIN') {
          <div class="dropdown d-none d-md-block">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-2.5 py-1 d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-store text-info"></i>
              <span class="text-truncate" style="max-width: 120px;">{{ state.getStoreName(state.activeStoreId()) }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li><button class="dropdown-item fw-bold text-primary" (click)="selectStore(null)"><i class="fa-solid fa-globe me-2"></i> 🌐 All Stores Context</button></li>
              <li><hr class="dropdown-divider"></li>
              @for (st of state.stores(); track st.id) {
                <li><button class="dropdown-item" (click)="selectStore(st.id)"><i class="fa-solid fa-shop me-2 text-info"></i> {{ st.name }} ({{ st.code }})</button></li>
              }
            </ul>
          </div>
        }

        <!-- Public Booking Engine Quick Link (Desktop view) -->
        <a routerLink="/book" class="btn btn-success btn-sm rounded-pill px-2.5 d-none d-sm-flex align-items-center gap-1" title="Book Online">
          <i class="fa-solid fa-calendar-check text-white"></i>
          <span class="fw-bold">Book</span>
        </a>

        <!-- Logged-in Staff Profile Avatar Dropdown -->
        <div class="dropdown">
          <button class="btn btn-dark border border-secondary rounded-pill p-1 text-white shadow-sm d-flex align-items-center gap-1 dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 26px; height: 26px; font-size: 0.75rem;">
              {{ (state.currentUser()?.first_name || state.currentUser()?.username || 'S').charAt(0).toUpperCase() }}
            </div>
            <span class="fw-bold text-white small text-truncate d-none d-md-inline" style="max-width: 100px;">{{ state.currentUser()?.first_name || state.currentUser()?.username }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary shadow p-2" style="background-color: #121824 !important; min-width: 220px;">
            <li>
              <div class="px-3 py-2 border-bottom border-secondary mb-2 text-light">
                <div class="fw-bold text-white">{{ state.currentUser()?.first_name }} {{ state.currentUser()?.last_name }}</div>
                <div class="text-secondary small">&#64;{{ state.currentUser()?.username }} ({{ state.activeRole() }})</div>
                <div class="text-info small mt-1"><i class="fa-solid fa-store me-1"></i> {{ state.getStoreName(state.activeStoreId()) }}</div>
                @if (state.activeShift()) {
                  <div class="text-success small mt-1"><i class="fa-solid fa-cash-register me-1"></i> Till: €{{ (state.activeShift()?.expected_cash || state.activeShift()?.opening_cash || 0).toFixed(2) }}</div>
                }
              </div>
            </li>

            <!-- Mobile Quick Actions Inside Profile Dropdown -->
            <li class="d-md-none"><a routerLink="/book" class="dropdown-item py-2 text-success fw-bold d-flex align-items-center gap-2"><i class="fa-solid fa-calendar-check"></i> Book Online Engine</a></li>
            <li class="d-md-none"><hr class="dropdown-divider border-secondary"></li>

            <li>
              <button class="dropdown-item text-danger fw-bold rounded-2 d-flex align-items-center gap-2 py-2" (click)="handleLogout()">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>{{ i18n.t('logout') }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Language Selector Dropdown (Desktop) -->
        <div class="dropdown d-none d-md-block">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-2 py-1 d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
            <i class="fa-solid fa-globe text-primary"></i>
            <span class="text-uppercase small">{{ i18n.currentLang() }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><button class="dropdown-item" (click)="selectLang('es')">🇪🇸 Español</button></li>
            <li><button class="dropdown-item" (click)="selectLang('en')">🇬🇧 English</button></li>
            <li><button class="dropdown-item" (click)="selectLang('ar')">🇸🇦 العربية</button></li>
          </ul>
        </div>

        <!-- Mobile Menu Drawer Hamburger Button -->
        <button class="btn btn-primary btn-sm d-md-none rounded-3 px-2.5 py-1.5 shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebarDrawer">
          <i class="fa-solid fa-bars fa-lg"></i>
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


