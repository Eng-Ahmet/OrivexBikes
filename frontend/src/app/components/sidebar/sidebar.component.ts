import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-3 shadow-lg sticky-top" style="top: 85px; background: #121824 !important;">
      <div class="nav flex-column nav-pills gap-2">
        <a routerLink="/fleet" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-layer-group width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('fleet') }}</span>
        </a>

        <a routerLink="/rentals" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-clock-rotate-left width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('rentals') }}</span>
        </a>

        <a routerLink="/shifts" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-briefcase width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('shifts') }}</span>
          @if (!state.activeShift()) {
            <span class="badge bg-danger text-white rounded-pill ms-auto" style="font-size: 0.65rem;">!</span>
          }
        </a>

        <a routerLink="/tariffs" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-tags width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('tariffs') }}</span>
        </a>

        <a routerLink="/schedules" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-calendar-days width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('schedules') }}</span>
        </a>

        <a routerLink="/repairs" routerLinkActive="active-tab" class="admin-sidebar-tab nav-link text-start text-light py-2 px-3 rounded-3 d-flex align-items-center gap-3">
          <i class="fa-solid fa-wrench width-20 text-white"></i>
          <span class="fw-semibold text-white">{{ i18n.t('repairs') }}</span>
        </a>

        <hr class="border-secondary my-2" />

        <a routerLink="/book" class="btn btn-outline-info btn-sm rounded-pill py-2 px-3 text-start d-flex align-items-center gap-2 mt-1 text-white">
          <i class="fa-solid fa-store text-white"></i>
          <span class="text-white">Public Customer Site</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-sidebar-tab {
      color: #ffffff !important;
      border: 1px solid transparent;
      transition: all 0.2s ease-in-out;
    }
    .admin-sidebar-tab:hover {
      color: #ffffff !important;
      background-color: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.3);
    }
    .admin-sidebar-tab.active-tab {
      color: #ffffff !important;
      background-color: rgba(56, 189, 248, 0.25) !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    }
  `]
})
export class SidebarComponent {
  i18n = inject(I18nService);
  state = inject(StateService);
}
