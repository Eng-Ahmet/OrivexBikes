import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-3" style="background: #0b0f19 !important;">
      <div class="card border rounded-4 p-4 p-md-5 shadow-lg w-100" style="max-width: 440px; background: #121824 !important; border-color: rgba(255,255,255,0.08) !important;">
        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="bg-primary bg-gradient text-white rounded-4 p-3 d-inline-flex align-items-center justify-content-center shadow-lg mb-3" style="width: 60px; height: 60px;">
            <i class="fa-solid fa-shield-halved fa-2x"></i>
          </div>
          <h2 class="fw-extrabold text-white font-heading tracking-tight mb-1">QQ<span class="text-primary">Bikes</span> Staff Portal</h2>
          <p class="text-secondary small mb-0">Secure Administrative & Shift Control Access</p>
        </div>

        <!-- Login Tabs: PIN Code / Password -->
        <div class="btn-group w-100 mb-4 p-1 bg-dark rounded-pill border border-secondary">
          <button class="btn btn-sm rounded-pill text-white fw-bold py-2" [class.btn-primary]="loginMode === 'PIN'" [class.btn-dark]="loginMode !== 'PIN'" (click)="loginMode = 'PIN'">
            <i class="fa-solid fa-key me-1"></i> Quick PIN Access
          </button>
          <button class="btn btn-sm rounded-pill text-white fw-bold py-2" [class.btn-primary]="loginMode === 'CREDENTIALS'" [class.btn-dark]="loginMode !== 'CREDENTIALS'" (click)="loginMode = 'CREDENTIALS'">
            <i class="fa-solid fa-user-lock me-1"></i> Credentials
          </button>
        </div>

        <!-- PIN Login Form -->
        @if (loginMode === 'PIN') {
          <div class="mb-4">
            <label class="form-label text-secondary small fw-semibold">4-Digit Employee PIN Code (رمز الدخول)</label>
            <div class="input-group input-group-lg">
              <span class="input-group-text bg-dark text-info border-secondary"><i class="fa-solid fa-lock"></i></span>
              <input type="password" maxlength="4" class="form-control bg-dark text-light border-secondary text-center fw-bold fs-3 tracking-widest font-mono"
                     placeholder="••••" [(ngModel)]="pinCode" (keyup.enter)="handlePinLogin()" />
            </div>
            <div class="form-text text-secondary small mt-2">
              Default PINs: <strong>1111</strong> (Admin), <strong>1234</strong> (Gustavo), <strong>2222</strong> (Fran), <strong>3333</strong> (Ahmet)
            </div>
          </div>

          <button class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold text-white py-3" (click)="handlePinLogin()" [disabled]="!pinCode || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            } @else {
              <i class="fa-solid fa-right-to-bracket me-2"></i>
            }
            Authenticate & Access Dashboard
          </button>
        } @else {
          <!-- Credentials Form -->
          <div class="mb-3">
            <label class="form-label text-secondary small fw-semibold">Store Center Location</label>
            <select class="form-select bg-dark text-light border-secondary rounded-pill px-3" [(ngModel)]="selectedStoreId">
              <option [value]="1">Málaga Beach Campsite Store</option>
              <option [value]="2">Torremolinos Central Hub</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label text-secondary small fw-semibold">Role Selection</label>
            <select class="form-select bg-dark text-light border-secondary rounded-pill px-3" [(ngModel)]="selectedRole">
              <option value="ADMIN">ADMIN (Full Control)</option>
              <option value="EMPLOYEE">EMPLOYEE (Counter & Shift)</option>
            </select>
          </div>

          <button class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold text-white py-3 mt-3" (click)="handleCredentialsLogin()" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            } @else {
              <i class="fa-solid fa-shield-cat me-2"></i>
            }
            Sign In to Staff Suite
          </button>
        }

        <!-- Footer Notice -->
        <div class="text-center mt-4 border-top border-secondary border-opacity-25 pt-3">
          <a href="#/book" class="text-secondary small text-decoration-none">
            <i class="fa-solid fa-arrow-left me-1"></i> Return to Public Customer Site
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);
  router = inject(Router);

  loginMode: 'PIN' | 'CREDENTIALS' = 'PIN';
  pinCode = '';
  selectedStoreId = 1;
  selectedRole: 'ADMIN' | 'EMPLOYEE' = 'ADMIN';
  loading = signal<boolean>(false);

  async handlePinLogin() {
    if (!this.pinCode) return;
    this.loading.set(true);
    try {
      const res = await this.api.verifyPin(this.pinCode);
      if (res && res.valid) {
        const user = res.user;
        this.state.setActiveRole(user.user_type);
        this.state.setActiveStore(user.store_id || 1);
        this.state.token.set(`token-${Date.now()}`);
        localStorage.setItem('qqbikes_token', `token-${Date.now()}`);
        this.state.showToast('Access Granted', `Welcome back ${user.first_name} (${user.user_type})`, 'success');
        this.router.navigate(['/fleet']);
      }
    } catch (err: any) {
      this.state.showToast('Access Denied', err?.error?.error || 'Invalid PIN code', 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  async handleCredentialsLogin() {
    this.loading.set(true);
    try {
      const res = await this.api.login(this.selectedRole, this.selectedStoreId);
      if (res && res.token) {
        this.state.token.set(res.token);
        localStorage.setItem('qqbikes_token', res.token);
        this.state.setActiveRole(this.selectedRole);
        this.state.setActiveStore(this.selectedStoreId);
        this.state.showToast('Signed In', `Signed in as ${this.selectedRole}`, 'success');
        this.router.navigate(['/fleet']);
      }
    } catch (err) {
      this.state.showToast('Login Error', 'Failed to authenticate session', 'danger');
    } finally {
      this.loading.set(false);
    }
  }
}
