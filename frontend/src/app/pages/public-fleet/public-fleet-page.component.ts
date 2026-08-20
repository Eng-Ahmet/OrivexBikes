import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-fleet-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header Banner -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="fa-solid fa-bolt me-1"></i> Quality Verified Fleet
            </span>
            <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Bikes & E-Scooters Catalog</h1>
            <p class="text-secondary lead mb-0">Browse our available vehicles in Málaga & Mijas. Transparent rates & zero hidden fees.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a routerLink="/book" class="btn btn-primary btn-lg rounded-pill px-4 shadow">
              <i class="fa-solid fa-calendar-check me-2"></i> Book Online Now
            </a>
          </div>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="card bg-dark border-secondary-subtle rounded-4 p-3 mb-4 shadow-sm">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-secondary small mb-1 fw-bold"><i class="fa-solid fa-store me-1 text-primary"></i> Pickup Location</label>
            <select class="form-select bg-dark text-white border-secondary rounded-3" [(ngModel)]="selectedStore" (change)="loadFleet()">
              <option value="">All Locations (Málaga & Mijas)</option>
              <option *ngFor="let s of stores" [value]="s.id">{{ s.name }} ({{ s.city }})</option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-secondary small mb-1 fw-bold"><i class="fa-solid fa-layer-group me-1 text-info"></i> Vehicle Category</label>
            <select class="form-select bg-dark text-white border-secondary rounded-3" [(ngModel)]="selectedCategory" (change)="loadFleet()">
              <option value="">All Categories</option>
              <option value="scooter">Electric Scooters</option>
              <option value="ebike">E-Bikes / Electric Bikes</option>
              <option value="bike">Comfort City Bikes</option>
            </select>
          </div>

          <div class="col-12 col-md-4 text-md-end">
            <button class="btn btn-outline-secondary btn-sm rounded-pill mt-md-4" (click)="resetFilters()">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading fleet...</span>
        </div>
        <p class="text-secondary mt-3">Loading live fleet inventory...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && fleet.length === 0" class="text-center py-5 bg-dark rounded-4 border border-secondary-subtle">
        <i class="fa-solid fa-bicycle fa-3x text-secondary mb-3"></i>
        <h4 class="text-white">No vehicles found matching filters</h4>
        <p class="text-secondary mb-3">Try clearing your filters or selecting a different location.</p>
        <button class="btn btn-outline-primary rounded-pill px-4" (click)="resetFilters()">View All Vehicles</button>
      </div>

      <!-- Fleet Grid -->
      <div *ngIf="!loading && fleet.length > 0" class="row g-4">
        <div *ngFor="let vehicle of fleet" class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-secondary-subtle rounded-4 h-100 shadow-sm hover-shadow transition overflow-hidden">
            <div class="position-relative bg-secondary bg-opacity-10 text-center p-4">
              <span class="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm" *ngIf="vehicle.status === 'AVAILABLE'">
                <i class="fa-solid fa-circle-check me-1"></i> Available Now
              </span>
              <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm" *ngIf="vehicle.status !== 'AVAILABLE'">
                <i class="fa-solid fa-clock me-1"></i> Reserved
              </span>
              <span class="badge bg-dark border border-secondary position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white shadow-sm">
                €{{ vehicle.daily_rate }}/day
              </span>

              <i class="fa-solid fa-bicycle fa-4x text-primary my-4" *ngIf="!vehicle.category.toLowerCase().includes('scooter')"></i>
              <i class="fa-solid fa-motorcycle fa-4x text-warning my-4" *ngIf="vehicle.category.toLowerCase().includes('scooter')"></i>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-primary small fw-bold text-uppercase tracking-wider">{{ vehicle.category }}</span>
                <span class="text-secondary small"><i class="fa-solid fa-store me-1"></i> {{ vehicle.store_name }}</span>
              </div>

              <h4 class="card-title fw-bold text-white mb-3">{{ vehicle.name }}</h4>

              <div class="bg-secondary bg-opacity-10 rounded-3 p-3 mb-4">
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Hourly Rate:</span>
                  <strong class="text-white">€{{ vehicle.hourly_rate }}/hr</strong>
                </div>
                <div class="d-flex justify-content-between text-secondary small mb-1">
                  <span>Daily Rate:</span>
                  <strong class="text-white">€{{ vehicle.daily_rate }}/day</strong>
                </div>
                <div class="d-flex justify-content-between text-secondary small">
                  <span>Security Deposit:</span>
                  <strong class="text-warning">€{{ vehicle.deposit_amount }}</strong>
                </div>
              </div>

              <div class="mt-auto d-flex gap-2">
                <a [routerLink]="['/bikes', vehicle.id]" class="btn btn-outline-light btn-sm rounded-pill flex-grow-1">
                  <i class="fa-solid fa-circle-info me-1"></i> Details
                </a>
                <a [routerLink]="['/book']" [queryParams]="{vehicleId: vehicle.id}" class="btn btn-primary btn-sm rounded-pill flex-grow-1 fw-bold">
                  <i class="fa-solid fa-calendar-check me-1"></i> Book
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicFleetPageComponent implements OnInit {
  private http = inject(HttpClient);
  
  fleet: any[] = [];
  stores: any[] = [];
  loading = true;

  selectedStore = '';
  selectedCategory = '';

  ngOnInit() {
    this.loadStores();
    this.loadFleet();
  }

  loadStores() {
    this.http.get<any[]>('/api/v1/public/stores').subscribe({
      next: (data) => this.stores = data,
      error: () => this.stores = []
    });
  }

  loadFleet() {
    this.loading = true;
    let url = '/api/v1/public/fleet?';
    if (this.selectedStore) url += `store_id=${this.selectedStore}&`;
    if (this.selectedCategory) url += `category=${this.selectedCategory}&`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.fleet = data;
        this.loading = false;
      },
      error: () => {
        this.fleet = [];
        this.loading = false;
      }
    });
  }

  resetFilters() {
    this.selectedStore = '';
    this.selectedCategory = '';
    this.loadFleet();
  }
}
