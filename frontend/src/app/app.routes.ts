import { Routes } from '@angular/router';
import { FleetPageComponent } from './pages/fleet-page/fleet-page.component';
import { RentalsPageComponent } from './pages/rentals-page/rentals-page.component';
import { ShiftsPageComponent } from './pages/shifts-page/shifts-page.component';
import { TariffsPageComponent } from './pages/tariffs-page/tariffs-page.component';
import { SchedulesPageComponent } from './pages/schedules-page/schedules-page.component';
import { RepairsPageComponent } from './pages/repairs-page/repairs-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

import { PublicBookingPageComponent } from './features/public-booking/public-booking-page.component';
import { PublicHomePageComponent } from './pages/public-home/public-home-page.component';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: PublicHomePageComponent },
  { path: 'book', component: PublicBookingPageComponent },
  { path: 'login', component: LoginPageComponent },

  // Admin Suite Routes - Protected with AuthGuard
  { path: 'fleet', component: FleetPageComponent, canActivate: [authGuard] },
  { path: 'rentals', component: RentalsPageComponent, canActivate: [authGuard] },
  { path: 'shifts', component: ShiftsPageComponent, canActivate: [authGuard] },
  { path: 'tariffs', component: TariffsPageComponent, canActivate: [authGuard] },
  { path: 'schedules', component: SchedulesPageComponent, canActivate: [authGuard] },
  { path: 'repairs', component: RepairsPageComponent, canActivate: [authGuard] },

  // Executive Admin Routes - Protected with AuthGuard & AdminGuard
  { path: 'analytics', component: AnalyticsPageComponent, canActivate: [authGuard, adminGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard, adminGuard] },

  { path: '**', redirectTo: 'home' }
];
