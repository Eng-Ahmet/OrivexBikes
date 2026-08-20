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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
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
      <header class="navbar navbar-expand-lg sticky-top border-bottom border-secondary-subtle px-3 px-md-4 bg-dark bg-gradient">
        <app-header></app-header>
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
        <div class="offcanvas-header border-bottom border-secondary">
          <h5 class="offcanvas-title text-info fw-bold"><i class="fa-solid fa-bicycle me-2"></i> QQBikes Menu</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-2">
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
    const adminPaths = ['/fleet', '/rentals', '/shifts', '/tariffs', '/schedules', '/repairs', '/analytics', '/settings'];
    const isAdmin = adminPaths.some(path => url.includes(path));
    this.isAdminRoute.set(isAdmin);
  }
}
