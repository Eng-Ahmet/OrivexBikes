import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-secondary mt-3">Loading vehicle specifications...</p>
      </div>

      <div *ngIf="!loading && vehicle" class="row g-4">
        <!-- Back Breadcrumb -->
        <div class="col-12">
          <a routerLink="/bikes" class="text-secondary text-decoration-none small">
            <i class="fa-solid fa-arrow-left me-1"></i> Back to Fleet Catalog
          </a>
        </div>

        <!-- Left Image & Specs -->
        <div class="col-12 col-lg-7">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 mb-4 text-center shadow-sm">
            <div class="bg-secondary bg-opacity-10 rounded-4 p-5 mb-4 position-relative">
              <span class="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                <i class="fa-solid fa-circle-check me-1"></i> Ready for Pickup
              </span>
              <i class="fa-solid fa-bicycle fa-6x text-primary my-4" *ngIf="!vehicle.category.toLowerCase().includes('scooter')"></i>
              <i class="fa-solid fa-motorcycle fa-6x text-warning my-4" *ngIf="vehicle.category.toLowerCase().includes('scooter')"></i>
            </div>

            <div class="text-start">
              <h2 class="fw-bold text-white font-heading mb-2">{{ vehicle.name }}</h2>
              <p class="text-secondary mb-4">Category: <strong class="text-primary">{{ vehicle.category }}</strong> | Location: <strong class="text-white">{{ vehicle.store_name }}</strong></p>

              <h5 class="fw-bold text-white font-heading mb-3">Vehicle Specifications</h5>
              <div class="row g-3 text-secondary small">
                <div class="col-6 col-md-4 bg-secondary bg-opacity-10 p-3 rounded-3">
                  <span class="d-block text-secondary">Battery Range</span>
                  <strong class="text-white fs-6">{{ vehicle.specifications?.range_km || '45-60 km' }}</strong>
                </div>
                <div class="col-6 col-md-4 bg-secondary bg-opacity-10 p-3 rounded-3">
                  <span class="d-block text-secondary">Max Speed</span>
                  <strong class="text-white fs-6">{{ vehicle.specifications?.max_speed || '25 km/h' }}</strong>
                </div>
                <div class="col-6 col-md-4 bg-secondary bg-opacity-10 p-3 rounded-3">
                  <span class="d-block text-secondary">Motor Power</span>
                  <strong class="text-white fs-6">{{ vehicle.specifications?.motor_power || '350W' }}</strong>
                </div>
                <div class="col-6 col-md-6 bg-secondary bg-opacity-10 p-3 rounded-3">
                  <span class="d-block text-secondary">Frame Material</span>
                  <strong class="text-white fs-6">{{ vehicle.specifications?.frame_type || 'Aluminium Alloy' }}</strong>
                </div>
                <div class="col-6 col-md-6 bg-secondary bg-opacity-10 p-3 rounded-3">
                  <span class="d-block text-secondary">Braking System</span>
                  <strong class="text-white fs-6">{{ vehicle.specifications?.brakes || 'Dual Disc Brakes' }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pricing & Booking Card -->
        <div class="col-12 col-lg-5">
          <div class="card bg-dark border-primary border-opacity-50 rounded-4 p-4 shadow-sm">
            <h4 class="fw-bold text-white font-heading mb-3">Rental Pricing</h4>

            <div class="bg-secondary bg-opacity-10 rounded-4 p-4 mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-secondary">Hourly Rate:</span>
                <strong class="text-white fs-5">€{{ vehicle.hourly_rate }}/hr</strong>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-secondary">Full Day Rate (24h):</span>
                <strong class="text-success fs-4">€{{ vehicle.daily_rate }}/day</strong>
              </div>
              <hr class="border-secondary my-3" />
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-secondary">Refundable Security Deposit:</span>
                <strong class="text-warning fs-5">€{{ vehicle.deposit_amount }}</strong>
              </div>
            </div>

            <div class="alert alert-dark border-secondary text-secondary small rounded-3 mb-4">
              <div class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check text-success me-2"></i> Free Helmet & Anti-Theft Lock</div>
              <div class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check text-success me-2"></i> Instant Store Pickup Confirmation</div>
              <div class="d-flex align-items-center"><i class="fa-solid fa-circle-check text-success me-2"></i> Pay Online or Pay at Counter</div>
            </div>

            <a [routerLink]="['/book']" [queryParams]="{vehicleId: vehicle.id}" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold mb-3">
              <i class="fa-solid fa-calendar-check me-2"></i> Book This Vehicle Now
            </a>

            <a routerLink="/support" class="btn btn-outline-secondary btn-sm w-100 rounded-pill">
              <i class="fa-solid fa-headset me-1"></i> Questions? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicVehicleDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  vehicle: any = null;
  loading = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.http.get<any>(`/api/v1/public/fleet/${id}`).subscribe({
          next: (data) => {
            this.vehicle = data || this.getFallbackVehicle(id);
            this.loading = false;
          },
          error: () => {
            this.vehicle = this.getFallbackVehicle(id);
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  private getFallbackVehicle(id: any) {
    return {
      id: Number(id) || 1,
      name: 'Orivex E-Bike Pro 500W',
      category: 'E-Bike',
      store_name: 'Málaga Beach Store',
      hourly_rate: 10,
      daily_rate: 35,
      deposit_amount: 100,
      status: 'AVAILABLE',
      specifications: {
        range_km: '45-60 km',
        max_speed: '25 km/h',
        motor_power: '500W Dual Motor',
        frame_type: 'Aluminium Alloy 6061',
        brakes: 'Hydraulic Disc Brakes'
      }
    };
  }
}
