import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 text-center" style="max-width: 650px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-5 shadow-lg">
        <div class="bg-danger bg-opacity-10 text-danger rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-4" style="width: 90px; height: 90px;">
          <i class="fa-solid fa-triangle-exclamation fa-4x"></i>
        </div>

        <h1 class="display-4 fw-extrabold text-white font-heading mb-2">404</h1>
        <h3 class="fw-bold text-white mb-3">Page Not Found</h3>
        <p class="text-secondary mb-4">
          The vehicle, tour, or public page you requested does not exist or may have been moved.
        </p>

        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/bikes" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
            <i class="fa-solid fa-bicycle me-1"></i> Browse Fleet
          </a>
          <a routerLink="/home" class="btn btn-outline-light rounded-pill px-4">
            <i class="fa-solid fa-house me-1"></i> Return Home
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundPageComponent {}
