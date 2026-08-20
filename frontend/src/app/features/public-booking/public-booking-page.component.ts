import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BookingStateService } from './services/booking-state.service';
import { ModeSelectorComponent } from './mode-selector.component';
import { TourBrowserComponent } from './tour-browser.component';
import { FleetBrowserComponent } from './fleet-browser.component';
import { DateTimePickerComponent } from './date-time-picker.component';
import { CustomerFormComponent } from './customer-form.component';
import { BookingConfirmationComponent } from './booking-confirmation.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-public-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    ModeSelectorComponent,
    TourBrowserComponent,
    FleetBrowserComponent,
    DateTimePickerComponent,
    CustomerFormComponent,
    BookingConfirmationComponent
  ],
  template: `
    <div class="container py-4" style="max-width: 1140px;">
      <!-- Main Hero Header -->
      <div class="text-center mb-4">
        <span class="badge bg-primary text-white px-3 py-2 rounded-pill mb-2 shadow-sm">
          <i class="fa-solid fa-star me-1 text-warning"></i> Official Online Booking
        </span>
        <h1 class="fw-extrabold text-white font-heading tracking-tight display-5 mb-2">
          Book Your <span class="text-primary">QQBikes</span> Experience
        </h1>
        <p class="text-secondary lead mx-auto" style="max-width: 650px;">
          Choose between expert-guided coastal bike tours or rent top-tier bikes & electric scooters in Málaga.
        </p>
      </div>

      <!-- Step Wizard Progress Bar -->
      @if (state.currentStep() !== 'CONFIRMATION') {
        <div class="position-relative mb-5">
          <div class="progress bg-secondary bg-opacity-20" style="height: 4px;">
            <div class="progress-bar bg-primary transition" [style.width]="getStepProgressWidth()"></div>
          </div>
          <div class="d-flex justify-content-between position-relative mt-n3 px-2">
            <div class="text-center">
              <span class="badge rounded-circle p-2 border border-2" [class.bg-primary]="state.currentStep() === 'SELECT_ITEM'" [class.border-primary]="state.currentStep() === 'SELECT_ITEM'" [class.bg-dark]="state.currentStep() !== 'SELECT_ITEM'">1</span>
              <div class="small fw-bold text-light mt-1 d-none d-sm-block">Select Experience</div>
            </div>
            <div class="text-center">
              <span class="badge rounded-circle p-2 border border-2" [class.bg-primary]="state.currentStep() === 'SELECT_DATE_TIME'" [class.border-primary]="state.currentStep() === 'SELECT_DATE_TIME'" [class.bg-dark]="state.currentStep() !== 'SELECT_DATE_TIME'">2</span>
              <div class="small fw-bold text-light mt-1 d-none d-sm-block">Date & Time</div>
            </div>
            <div class="text-center">
              <span class="badge rounded-circle p-2 border border-2" [class.bg-primary]="state.currentStep() === 'CUSTOMER_INFO'" [class.border-primary]="state.currentStep() === 'CUSTOMER_INFO'" [class.bg-dark]="state.currentStep() !== 'CUSTOMER_INFO'">3</span>
              <div class="small fw-bold text-light mt-1 d-none d-sm-block">Customer Details</div>
            </div>
            <div class="text-center">
              <span class="badge rounded-circle p-2 border border-2 bg-dark">4</span>
              <div class="small fw-bold text-secondary mt-1 d-none d-sm-block">Confirmation</div>
            </div>
          </div>
        </div>
      }

      <!-- Dynamic Wizard View -->
      @switch (state.currentStep()) {
        @case ('SELECT_ITEM') {
          <app-mode-selector></app-mode-selector>
          @if (state.bookingMode() === 'TOUR') {
            <app-tour-browser></app-tour-browser>
          } @else {
            <app-fleet-browser></app-fleet-browser>
          }
        }
        @case ('SELECT_DATE_TIME') {
          <app-date-time-picker></app-date-time-picker>
        }
        @case ('CUSTOMER_INFO') {
          <app-customer-form></app-customer-form>
        }
        @case ('CONFIRMATION') {
          <app-booking-confirmation></app-booking-confirmation>
        }
      }
    </div>
  `
})
export class PublicBookingPageComponent implements OnInit {
  state = inject(BookingStateService);
  i18n = inject(I18nService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'FLEET') {
        this.state.bookingMode.set('FLEET');
      } else if (params['mode'] === 'TOUR') {
        this.state.bookingMode.set('TOUR');
      }
    });
  }

  getStepProgressWidth(): string {
    switch (this.state.currentStep()) {
      case 'SELECT_ITEM': return '33%';
      case 'SELECT_DATE_TIME': return '66%';
      case 'CUSTOMER_INFO': return '90%';
      case 'CONFIRMATION': return '100%';
      default: return '33%';
    }
  }
}
