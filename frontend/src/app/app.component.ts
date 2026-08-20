import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PublicHeaderComponent } from './components/public/public-header/public-header.component';
import { PublicFooterComponent } from './components/public/public-footer/public-footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { NewContractModalComponent } from './components/modals/new-contract-modal.component';
import { ReturnVehicleModalComponent } from './components/modals/return-vehicle-modal.component';
import { ExtendContractModalComponent } from './components/modals/extend-contract-modal.component';
import { LoginModalComponent } from './components/modals/login-modal.component';
import { ApiService } from './core/services/api.service';
import { StateService } from './core/services/state.service';
import { I18nService } from './core/services/i18n.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    PublicHeaderComponent,
    PublicFooterComponent,
    ToastComponent,
    NewContractModalComponent,
    ReturnVehicleModalComponent,
    ExtendContractModalComponent,
    LoginModalComponent
  ],
  template: `
    @if (!isAdminRoute()) {
      <!-- Public Customer Website Layout (No Admin Sidebar or Active Shift Counters!) -->
      <app-public-header></app-public-header>

      <main class="min-vh-100 py-3">
        <router-outlet></router-outlet>
      </main>

      <app-public-footer></app-public-footer>
    } @else {
      <!-- Admin / Employee Dashboard Layout -->
      <header class="navbar navbar-expand-lg sticky-top border-bottom border-secondary-subtle px-2 px-md-4 bg-dark bg-gradient w-100">
        <app-header class="w-100"></app-header>
      </header>

      <div class="container-fluid py-3 px-3 px-md-4">
        <div class="row g-3">
          <aside class="col-12 col-md-3 col-xl-2 d-none d-md-block">
            <app-sidebar></app-sidebar>
          </aside>

          <main class="col-12 col-md-9 col-xl-10">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>

      <!-- Mobile Offcanvas Sidebar Drawer for Admin -->
      <div class="offcanvas offcanvas-start bg-dark text-light border-end border-secondary" tabindex="-1" id="mobileSidebarDrawer">
        <div class="offcanvas-header border-bottom border-secondary d-flex align-items-center justify-content-between">
          <div>
            <h5 class="offcanvas-title text-info fw-bold mb-0"><i class="fa-solid fa-bicycle me-2"></i> QQBikes Menu</h5>
            <span class="text-secondary extra-small"><i class="fa-solid fa-store me-1"></i> {{ state.getStoreName(state.activeStoreId()) }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-2">
          <!-- Store & Language Selectors inside Mobile Drawer -->
          <div class="p-2.5 mb-3 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-25">
            @if (state.activeRole() === 'ADMIN') {
              <div class="mb-2">
                <label class="form-label text-secondary extra-small mb-1 fw-bold"><i class="fa-solid fa-store text-info me-1"></i> Active Store Context</label>
                <select class="form-select form-select-sm bg-dark text-white border-secondary rounded-3" [ngModel]="state.activeStoreId()" (ngModelChange)="state.setActiveStore($event)">
                  <option [ngValue]="null">🌐 All Stores Context (Company-Wide)</option>
                  @for (st of state.stores(); track st.id) {
                    <option [ngValue]="st.id">{{ st.name }} ({{ st.code }})</option>
                  }
                </select>
              </div>
            }

            <div>
              <label class="form-label text-secondary extra-small mb-1 fw-bold"><i class="fa-solid fa-globe text-primary me-1"></i> System Language</label>
              <div class="btn-group w-100" role="group">
                <button type="button" class="btn btn-sm btn-outline-secondary text-white" [class.active]="i18n.currentLang() === 'es'" (click)="i18n.setLanguage('es')">🇪🇸 ES</button>
                <button type="button" class="btn btn-sm btn-outline-secondary text-white" [class.active]="i18n.currentLang() === 'en'" (click)="i18n.setLanguage('en')">🇬🇧 EN</button>
                <button type="button" class="btn btn-sm btn-outline-secondary text-white" [class.active]="i18n.currentLang() === 'ar'" (click)="i18n.setLanguage('ar')">🇸🇦 AR</button>
              </div>
            </div>
          </div>

          <app-sidebar></app-sidebar>
        </div>
      </div>
    }

    <!-- Toast Notifications Outlet -->
    <app-toast></app-toast>

    <!-- Modals Outlets -->
    <app-new-contract-modal></app-new-contract-modal>
    <app-return-vehicle-modal></app-return-vehicle-modal>
    <app-extend-contract-modal></app-extend-contract-modal>
    <app-login-modal></app-login-modal>
  `
})
export class AppComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);
  router = inject(Router);

  isAdminRoute = signal<boolean>(false);

  async ngOnInit() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      this.checkRoute(url);
    });

    this.checkRoute(window.location.hash || window.location.pathname);
    if (this.state.token()) {
      await this.api.getMe();
    }
    await this.api.getCurrentShift();
  }

  private checkRoute(url: string) {
    const publicPaths = [
      '/home',
      '/bikes',
      '/book',
      '/booking-confirmation',
      '/my-booking',
      '/tours',
      '/locations',
      '/reviews',
      '/support',
      '/faq',
      '/about',
      '/privacy',
      '/terms',
      '/rental-terms',
      '/not-found',
      '/login'
    ];
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isPublicRoute = publicPaths.some(path => cleanUrl === path || cleanUrl.startsWith(path + '/'));
    this.isAdminRoute.set(!isPublicRoute);
  }
}
