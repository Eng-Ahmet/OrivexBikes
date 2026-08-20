import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService, Language } from '../../core/services/i18n.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden">
      <!-- Ambient Glow Orbs -->
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>

      <!-- Glassmorphic Login Card -->
      <div class="login-card card border-0 rounded-5 p-4 p-md-5 shadow-2xl w-100 position-relative z-1">
        
        <!-- Language Switcher Bar -->
        <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light border-opacity-10">
          <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-3 py-2 text-uppercase font-mono small tracking-wider">
            <i class="fa-solid fa-shield-halved me-1"></i> SSOT v1.0
          </span>

          <!-- Trilingual Language Pills -->
          <div class="lang-pill-group d-flex gap-1 p-1 bg-dark bg-opacity-60 rounded-pill border border-white border-opacity-10">
            <button type="button" class="btn btn-sm rounded-pill px-2.5 py-1 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'es'"
                    (click)="changeLang('es')">
              🇪🇸 <span class="d-none d-sm-inline ms-1">ES</span>
            </button>
            <button type="button" class="btn btn-sm rounded-pill px-2.5 py-1 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'en'"
                    (click)="changeLang('en')">
              🇬🇧 <span class="d-none d-sm-inline ms-1">EN</span>
            </button>
            <button type="button" class="btn btn-sm rounded-pill px-2.5 py-1 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'ar'"
                    (click)="changeLang('ar')">
              🇸🇦 <span class="ms-1">العربية</span>
            </button>
          </div>
        </div>

        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="brand-emblem bg-gradient-primary text-white rounded-4 p-3 d-inline-flex align-items-center justify-content-center shadow-lg mb-3">
            <i class="fa-solid fa-bicycle fa-2x brand-icon"></i>
          </div>
          <h2 class="fw-black text-white font-heading tracking-tight mb-1 fs-3">
            QQ<span class="text-cyan">Bikes</span> <span class="fw-light text-white-50">|</span> {{ i18n.t('staffPortal') }}
          </h2>
          <p class="text-white-50 small mb-0">{{ i18n.t('secureAccessTitle') }}</p>
        </div>

        <!-- Login Tabs: PIN Code / Credentials -->
        <div class="segmented-control w-100 mb-4 p-1 rounded-4 d-flex">
          <button type="button" class="btn flex-fill rounded-3 text-white fw-bold py-2.5 transition-all text-nowrap"
                  [class.active-tab]="loginMode === 'PIN'"
                  (click)="loginMode = 'PIN'">
            <i class="fa-solid fa-key me-1.5 text-warning"></i> {{ i18n.t('quickPinAccess') }}
          </button>
          <button type="button" class="btn flex-fill rounded-3 text-white fw-bold py-2.5 transition-all text-nowrap"
                  [class.active-tab]="loginMode === 'CREDENTIALS'"
                  (click)="loginMode = 'CREDENTIALS'">
            <i class="fa-solid fa-id-card-clip me-1.5 text-cyan"></i> {{ i18n.t('credentialsAccess') }}
          </button>
        </div>

        <!-- PIN Login Form -->
        @if (loginMode === 'PIN') {
          <div class="mb-4">
            <label class="form-label text-white-50 small fw-semibold d-block mb-2">
              {{ i18n.t('employeePinLabel') }}
            </label>
            <div class="input-group input-group-lg shadow-sm">
              <span class="input-group-text bg-dark border-secondary border-opacity-50 text-cyan px-3">
                <i class="fa-solid fa-lock-keyhole"></i>
              </span>
              <input [type]="showPin ? 'text' : 'password'" maxlength="4"
                     class="form-control bg-dark text-cyan border-secondary border-opacity-50 text-center fw-extrabold fs-2 tracking-widest font-mono shadow-inner"
                     placeholder="••••" [(ngModel)]="pinCode" (keyup.enter)="handlePinLogin()" />
              <button class="btn btn-dark border-secondary border-opacity-50 text-white-50" type="button" (click)="showPin = !showPin">
                <i class="fa-solid" [class.fa-eye]="!showPin" [class.fa-eye-slash]="showPin"></i>
              </button>
            </div>

            <!-- Quick Interactive Demo PIN Chips -->
            <div class="demo-chips-section mt-3 p-3 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10">
              <div class="text-white-50 extra-small fw-semibold mb-2">
                <i class="fa-solid fa-bolt text-warning me-1"></i> {{ i18n.t('quickPinClickHelp') }}
              </div>
              <div class="d-flex flex-wrap gap-1.5">
                <button type="button" class="btn btn-xs btn-outline-primary rounded-pill text-white border-opacity-30 py-1 px-2.5 small"
                        (click)="setPin('1111')">
                  👑 <strong>1111</strong> <span class="opacity-75">(Admin)</span>
                </button>
                <button type="button" class="btn btn-xs btn-outline-info rounded-pill text-white border-opacity-30 py-1 px-2.5 small"
                        (click)="setPin('1234')">
                  🚴 <strong>1234</strong> <span class="opacity-75">(Gustavo)</span>
                </button>
                <button type="button" class="btn btn-xs btn-outline-success rounded-pill text-white border-opacity-30 py-1 px-2.5 small"
                        (click)="setPin('2222')">
                  🛠️ <strong>2222</strong> <span class="opacity-75">(Fran)</span>
                </button>
                <button type="button" class="btn btn-xs btn-outline-warning rounded-pill text-white border-opacity-30 py-1 px-2.5 small"
                        (click)="setPin('3333')">
                  💻 <strong>3333</strong> <span class="opacity-75">(Ahmet)</span>
                </button>
              </div>
            </div>
          </div>

          <button class="btn btn-gradient-primary btn-lg w-100 rounded-4 shadow-lg fw-bold text-white py-3 transition-all transform-hover"
                  (click)="handlePinLogin()" [disabled]="!pinCode || loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            } @else {
              <i class="fa-solid fa-right-to-bracket me-2"></i>
            }
            {{ i18n.t('authenticateBtn') }}
          </button>
        } @else {
          <!-- Credentials Form -->
          <div class="mb-3">
            <label class="form-label text-white-50 small fw-semibold mb-1">
              <i class="fa-solid fa-store text-cyan me-1"></i> {{ i18n.t('storeLocationLabel') }}
            </label>
            <select class="form-select bg-dark text-light border-secondary border-opacity-50 rounded-3 p-3 shadow-sm" [(ngModel)]="selectedStoreId">
              <option [value]="1">🏬 {{ i18n.t('malagaStoreOption') }}</option>
              <option [value]="2">🌴 {{ i18n.t('torremolinosStoreOption') }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label text-white-50 small fw-semibold mb-1">
              <i class="fa-solid fa-user-gear text-cyan me-1"></i> {{ i18n.t('roleSelectionLabel') }}
            </label>
            <select class="form-select bg-dark text-light border-secondary border-opacity-50 rounded-3 p-3 shadow-sm" [(ngModel)]="selectedRole">
              <option value="ADMIN">🛡️ {{ i18n.t('adminRoleOption') }}</option>
              <option value="EMPLOYEE">💼 {{ i18n.t('employeeRoleOption') }}</option>
            </select>
          </div>

          <button class="btn btn-gradient-primary btn-lg w-100 rounded-4 shadow-lg fw-bold text-white py-3 transition-all transform-hover"
                  (click)="handleCredentialsLogin()" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            } @else {
              <i class="fa-solid fa-shield-cat me-2"></i>
            }
            {{ i18n.t('signInStaffSuite') }}
          </button>
        }

        <!-- Footer Notice -->
        <div class="text-center mt-4 border-top border-light border-opacity-10 pt-3">
          <a href="#/book" class="text-white-50 small text-decoration-none hover-cyan transition-all">
            <i class="fa-solid fa-arrow-left me-1"></i> {{ i18n.t('returnToPublicSite') }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background: radial-gradient(circle at 50% 20%, #151e33 0%, #080c14 100%) !important;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      opacity: 0.35;
      animation: floatGlow 12s ease-in-out infinite alternate;
    }
    .orb-1 { width: 380px; height: 380px; background: #2563eb; top: -100px; left: -100px; }
    .orb-2 { width: 320px; height: 320px; background: #0284c7; bottom: -80px; right: -80px; animation-delay: -4s; }
    .orb-3 { width: 260px; height: 260px; background: #7c3aed; top: 40%; right: 15%; animation-delay: -8s; }

    @keyframes floatGlow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, 40px) scale(1.15); }
    }

    .login-card {
      max-width: 460px;
      background: rgba(18, 26, 43, 0.82) !important;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(37, 99, 235, 0.18) !important;
    }

    .brand-emblem {
      width: 68px;
      height: 68px;
      background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
      box-shadow: 0 0 25px rgba(37, 99, 235, 0.4);
    }

    .text-cyan { color: #38bdf8 !important; }
    
    .segmented-control {
      background: rgba(10, 15, 26, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .active-tab {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }

    .active-lang {
      background: rgba(37, 99, 235, 0.8) !important;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }

    .btn-gradient-primary {
      background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
      border: none;
      box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4);
    }
    .btn-gradient-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 12px 25px -4px rgba(37, 99, 235, 0.5);
    }

    .extra-small { font-size: 0.75rem; }
    .hover-cyan:hover { color: #38bdf8 !important; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
  `]
})
export class LoginPageComponent {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);
  router = inject(Router);

  loginMode: 'PIN' | 'CREDENTIALS' = 'PIN';
  pinCode = '';
  showPin = false;
  selectedStoreId = 1;
  selectedRole: 'ADMIN' | 'EMPLOYEE' = 'ADMIN';
  loading = signal<boolean>(false);

  changeLang(lang: Language) {
    this.i18n.setLanguage(lang);
  }

  setPin(pin: string) {
    this.pinCode = pin;
  }

  async handlePinLogin() {
    if (!this.pinCode) return;
    this.loading.set(true);
    try {
      const res = await this.api.verifyPin(this.pinCode);
      if (res && res.valid) {
        const user = res.user;
        const realToken = res.token || `token-${Date.now()}`;
        this.state.token.set(realToken);
        localStorage.setItem('qqbikes_token', realToken);
        this.state.setCurrentUser(user);
        this.state.showToast(this.i18n.t('login'), `Welcome back ${user.first_name} (${user.user_type})`, 'success');
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
        const user = res.user || {
          id: Date.now(),
          username: this.selectedRole.toLowerCase(),
          first_name: this.selectedRole === 'ADMIN' ? 'Carlos' : 'Sofia',
          last_name: this.selectedRole === 'ADMIN' ? 'Admin' : 'Employee',
          user_type: this.selectedRole,
          store_id: this.selectedStoreId
        };
        this.state.setCurrentUser(user);
        this.state.showToast(this.i18n.t('login'), `Signed in as ${this.selectedRole}`, 'success');
        this.router.navigate(['/fleet']);
      }
    } catch (err) {
      this.state.showToast('Login Error', 'Failed to authenticate session', 'danger');
    } finally {
      this.loading.set(false);
    }
  }
}
