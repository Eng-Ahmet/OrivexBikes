import { Routes } from '@angular/router';

// Administrative Pages
import { FleetPageComponent } from './pages/fleet-page/fleet-page.component';
import { RentalsPageComponent } from './pages/rentals-page/rentals-page.component';
import { ShiftsPageComponent } from './pages/shifts-page/shifts-page.component';
import { TariffsPageComponent } from './pages/tariffs-page/tariffs-page.component';
import { SchedulesPageComponent } from './pages/schedules-page/schedules-page.component';
import { RepairsPageComponent } from './pages/repairs-page/repairs-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { EmployeesPageComponent } from './pages/employees-page/employees-page.component';
import { ShiftDefinitionsPageComponent } from './pages/shift-definitions-page/shift-definitions-page.component';
import { AttendancePageComponent } from './pages/attendance-page/attendance-page.component';
import { OvertimePageComponent } from './pages/overtime-page/overtime-page.component';
import { LeaveRequestsPageComponent } from './pages/leave-requests-page/leave-requests-page.component';
import { ShiftSwapsPageComponent } from './pages/shift-swaps-page/shift-swaps-page.component';
import { PayrollPageComponent } from './pages/payroll-page/payroll-page.component';
import { PayrollReportsPageComponent } from './pages/payroll-reports-page/payroll-reports-page.component';
import { StoresPageComponent } from './pages/stores-page/stores-page.component';
import { ExpensesPageComponent } from './pages/expenses-page/expenses-page.component';

// Public Customer Website Pages
import { PublicHomePageComponent } from './pages/public-home/public-home-page.component';
import { PublicFleetPageComponent } from './pages/public-fleet/public-fleet-page.component';
import { PublicVehicleDetailsComponent } from './pages/public-vehicle-details/public-vehicle-details.component';
import { PublicBookingPageComponent } from './features/public-booking/public-booking-page.component';
import { BookingConfirmationPageComponent } from './pages/booking-confirmation/booking-confirmation-page.component';
import { BookingLookupPageComponent } from './pages/booking-lookup/booking-lookup-page.component';
import { PublicToursPageComponent } from './pages/public-tours/public-tours-page.component';
import { PublicTourDetailsComponent } from './pages/public-tour-details/public-tour-details.component';
import { PublicLocationsPageComponent } from './pages/public-locations/public-locations-page.component';
import { PublicReviewsPageComponent } from './pages/public-reviews/public-reviews-page.component';
import { PublicSupportPageComponent } from './pages/public-support/public-support-page.component';
import { PublicFaqPageComponent } from './pages/public-faq/public-faq-page.component';
import { PublicAboutPageComponent } from './pages/public-about/public-about-page.component';

// 3 Separate Dedicated Policy Component Files
import { PrivacyPolicyPageComponent } from './pages/privacy-policy/privacy-policy-page.component';
import { TermsConditionsPageComponent } from './pages/terms-conditions/terms-conditions-page.component';
import { SecurityPolicyPageComponent } from './pages/security-policy/security-policy-page.component';

import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

// Core Guards
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public Routes (No Auth Guard Required)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: PublicHomePageComponent },
  { path: 'bikes', component: PublicFleetPageComponent },
  { path: 'bikes/:id', component: PublicVehicleDetailsComponent },
  { path: 'book', component: PublicBookingPageComponent },
  { path: 'booking-confirmation/:bookingNumber', component: BookingConfirmationPageComponent },
  { path: 'my-booking', component: BookingLookupPageComponent },
  { path: 'tours', component: PublicToursPageComponent },
  { path: 'tours/:id', component: PublicTourDetailsComponent },
  { path: 'locations', component: PublicLocationsPageComponent },
  { path: 'reviews', component: PublicReviewsPageComponent },
  { path: 'support', component: PublicSupportPageComponent },
  { path: 'faq', component: PublicFaqPageComponent },
  { path: 'about', component: PublicAboutPageComponent },

  // 3 Separate Dedicated Routes to 3 Distinct Component Files
  { path: 'privacy', component: PrivacyPolicyPageComponent },
  { path: 'terms', component: TermsConditionsPageComponent },
  { path: 'rental-terms', component: SecurityPolicyPageComponent },

  { path: 'not-found', component: NotFoundPageComponent },
  { path: 'login', component: LoginPageComponent },

  // Admin / Staff Suite Routes - Protected with AuthGuard
  { path: 'fleet', component: FleetPageComponent, canActivate: [authGuard] },
  { path: 'rentals', component: RentalsPageComponent, canActivate: [authGuard] },
  { path: 'shifts', component: ShiftsPageComponent, canActivate: [authGuard] },
  { path: 'tariffs', component: TariffsPageComponent, canActivate: [authGuard] },
  { path: 'schedules', component: SchedulesPageComponent, canActivate: [authGuard] },
  { path: 'repairs', component: RepairsPageComponent, canActivate: [authGuard] },

  // Multi-Store & Operating Expenses Routes
  { path: 'stores', component: StoresPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'expenses', component: ExpensesPageComponent, canActivate: [authGuard, adminGuard] },

  // HR & Payroll Module Routes - Protected with AuthGuard & AdminGuard
  { path: 'employees', component: EmployeesPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'shift-definitions', component: ShiftDefinitionsPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'attendance', component: AttendancePageComponent, canActivate: [authGuard] },
  { path: 'overtime', component: OvertimePageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'leave-requests', component: LeaveRequestsPageComponent, canActivate: [authGuard] },
  { path: 'shift-swaps', component: ShiftSwapsPageComponent, canActivate: [authGuard] },
  { path: 'payroll', component: PayrollPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'payroll-reports', component: PayrollReportsPageComponent, canActivate: [authGuard, adminGuard] },

  // Executive Admin Routes - Protected with AuthGuard & AdminGuard
  { path: 'analytics', component: AnalyticsPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard, adminGuard] },

  { path: '**', redirectTo: 'not-found' }
];
