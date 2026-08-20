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
    <div class="login-split-wrapper min-vh-100 container-fluid p-0 d-flex flex-column flex-lg-row overflow-hidden position-relative">
      
      <!-- Background Ambient Glow Orbs -->
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>

      <!-- LEFT PANEL: 50% EQUAL WIDTH (col-12 col-lg-6) - Welcome, Branding & Language Switcher -->
      <div class="left-hero-panel col-12 col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-between text-white position-relative z-1">
        
        <!-- Top Row: Brand Emblem & Trilingual Language Switcher -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-emblem bg-gradient-primary text-white rounded-4 p-2.5 d-flex align-items-center justify-content-center shadow-lg">
              <i class="fa-solid fa-bicycle fa-xl"></i>
            </div>
            <div>
              <h1 class="fs-4 fw-black tracking-tight text-white mb-0 font-heading">
                Orivex<span class="text-cyan">Bike</span> <span class="badge bg-primary bg-opacity-20 text-cyan border border-cyan border-opacity-30 rounded-pill ms-2 font-mono extra-small">v2.0</span>
              </h1>
              <span class="text-white-50 extra-small">Powered by Orivex Technology</span>
            </div>
          </div>

          <!-- Trilingual Language Pills Selector -->
          <div class="lang-pill-group d-flex gap-1 p-1 bg-dark bg-opacity-70 rounded-pill border border-white border-opacity-10 shadow-sm">
            <button type="button" class="btn btn-sm rounded-pill px-3 py-1.5 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'es'"
                    (click)="changeLang('es')">
              🇪🇸 <span class="ms-1">ES</span>
            </button>
            <button type="button" class="btn btn-sm rounded-pill px-3 py-1.5 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'en'"
                    (click)="changeLang('en')">
              🇬🇧 <span class="ms-1">EN</span>
            </button>
            <button type="button" class="btn btn-sm rounded-pill px-3 py-1.5 text-white fw-bold transition-all"
                    [class.active-lang]="i18n.currentLang() === 'ar'"
                    (click)="changeLang('ar')">
              🇸🇦 <span class="ms-1">العربية</span>
            </button>
          </div>
        </div>

        <!-- Middle Hero Welcome Section -->
        <div class="my-auto py-4">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-cyan bg-opacity-10 text-cyan border border-cyan border-opacity-25 mb-3">
            <i class="fa-solid fa-shield-halved"></i>
            <span class="extra-small fw-bold tracking-wider text-uppercase">Operational System SSOT v1.0</span>
          </div>

          <h2 class="display-6 fw-extrabold text-white font-heading tracking-tight mb-3 lh-sm">
            {{ i18n.t('welcomeHeroTitle') }}
          </h2>
          <p class="lead text-white-50 mb-4 fs-6">
            {{ i18n.t('welcomeHeroSub') }}
          </p>

          <!-- System Feature List -->
          <div class="d-flex flex-column gap-3 max-w-650">
            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-dark bg-opacity-40 border border-white border-opacity-10">
              <div class="icon-box-circle p-2.5" style="width: 42px; height: 42px; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.35);">
                <i class="fa-solid fa-layer-group fs-5 text-cyan"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white mb-0 small">{{ i18n.t('fleetControlTitle') }}</h6>
                <p class="text-white-50 extra-small mb-0">{{ i18n.t('fleetControlSub') }}</p>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-dark bg-opacity-40 border border-white border-opacity-10">
              <div class="icon-box-circle p-2.5" style="width: 42px; height: 42px; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.35);">
                <i class="fa-solid fa-cash-register fs-5 text-warning"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white mb-0 small">{{ i18n.t('shiftAuditTitle') }}</h6>
                <p class="text-white-50 extra-small mb-0">{{ i18n.t('shiftAuditSub') }}</p>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-dark bg-opacity-40 border border-white border-opacity-10">
              <div class="icon-box-circle p-2.5" style="width: 42px; height: 42px; background: rgba(14, 165, 233, 0.18); border: 1px solid rgba(14, 165, 233, 0.35);">
                <i class="fa-solid fa-user-shield fs-5 text-info"></i>
              </div>
              <div>
                <h6 class="fw-bold text-white mb-0 small">{{ i18n.t('securitySSOTTitle') }}</h6>
                <p class="text-white-50 extra-small mb-0">{{ i18n.t('securitySSOTSub') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Left Footer -->
        <div class="pt-4 border-top border-white border-opacity-10 d-flex align-items-center justify-content-between text-white-50 extra-small">
          <div>&copy; 2026 QQBikes Management System</div>
          <div>Powered by <strong class="text-white">Orivex Technology</strong></div>
        </div>
      </div>

      <!-- RIGHT PANEL: 50% EQUAL WIDTH (col-12 col-lg-6) - CLEAN NO-CARD LOGIN FORM -->
      <div class="right-form-panel col-12 col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-between text-white position-relative z-1">
        
        <div class="my-auto w-100 max-w-550 mx-auto">
          <!-- Title & Subtitle (Plain text directly on panel - NO CARD) -->
          <div class="text-start mb-4">
            <h3 class="fw-black text-white font-heading tracking-tight mb-2 fs-2">
              {{ i18n.t('staffPortal') }}
            </h3>
            <p class="text-white-50 fs-6 mb-0">{{ i18n.t('secureAccessTitle') }}</p>
          </div>

          <!-- Segmented Mode Selector Buttons (Clean 100% width) -->
          <div class="segmented-control w-100 mb-4 p-1.5 rounded-4 d-flex gap-1">
            <button type="button" class="btn flex-fill rounded-3 text-white fw-bold py-3 transition-all text-nowrap"
                    [class.active-tab]="loginMode === 'PIN'"
                    (click)="loginMode = 'PIN'">
              <i class="fa-solid fa-key me-2 text-warning"></i> {{ i18n.t('quickPinAccess') }}
            </button>
            <button type="button" class="btn flex-fill rounded-3 text-white fw-bold py-3 transition-all text-nowrap"
                    [class.active-tab]="loginMode === 'CREDENTIALS'"
                    (click)="loginMode = 'CREDENTIALS'">
              <i class="fa-solid fa-id-card-clip me-2 text-cyan"></i> {{ i18n.t('credentialsAccess') }}
            </button>
          </div>

          <!-- PIN Form Section -->
          @if (loginMode === 'PIN') {
            <div class="mb-4">
              <label class="form-label text-white-50 fs-6 fw-semibold d-block mb-2">
                {{ i18n.t('employeePinLabel') }}
              </label>
              <div class="input-group input-group-lg shadow-sm">
                <span class="input-group-text bg-dark border-secondary border-opacity-50 text-cyan px-4">
                  <i class="fa-solid fa-lock fs-4 text-cyan"></i>
                </span>
                <input [type]="showPin ? 'text' : 'password'" maxlength="4"
                       class="form-control bg-dark text-cyan border-secondary border-opacity-50 text-center fw-extrabold fs-1 tracking-widest font-mono shadow-inner py-3"
                       placeholder="••••" [(ngModel)]="pinCode" (keyup.enter)="handlePinLogin()" />
                <button class="btn btn-dark border-secondary border-opacity-50 text-white-50 px-4" type="button" (click)="showPin = !showPin">
                  <i class="fa-solid fs-5" [class.fa-eye]="!showPin" [class.fa-eye-slash]="showPin"></i>
                </button>
              </div>

              <!-- Quick Interactive Demo Profiles -->
              <div class="mt-4 p-3.5 rounded-4 bg-dark bg-opacity-50 border border-white border-opacity-10">
                <div class="text-white-50 small fw-semibold mb-2.5">
                  <i class="fa-solid fa-bolt text-warning me-1.5"></i> {{ i18n.t('quickPinClickHelp') }}
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <button type="button" class="btn btn-dark w-100 border border-primary border-opacity-30 rounded-3 py-2 px-3 text-start d-flex align-items-center justify-content-between"
                            (click)="setPin('1111')">
                      <span>👑 <strong>1111</strong></span>
                      <span class="text-white-50 extra-small">Admin</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button type="button" class="btn btn-dark w-100 border border-info border-opacity-30 rounded-3 py-2 px-3 text-start d-flex align-items-center justify-content-between"
                            (click)="setPin('1234')">
                      <span>🚴 <strong>1234</strong></span>
                      <span class="text-white-50 extra-small">Gustavo</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button type="button" class="btn btn-dark w-100 border border-success border-opacity-30 rounded-3 py-2 px-3 text-start d-flex align-items-center justify-content-between"
                            (click)="setPin('2222')">
                      <span>🛠️ <strong>2222</strong></span>
                      <span class="text-white-50 extra-small">Fran</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button type="button" class="btn btn-dark w-100 border border-warning border-opacity-30 rounded-3 py-2 px-3 text-start d-flex align-items-center justify-content-between"
                            (click)="setPin('3333')">
                      <span>💻 <strong>3333</strong></span>
                      <span class="text-white-50 extra-small">Ahmet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button class="btn btn-gradient-primary btn-lg w-100 rounded-4 shadow-lg fw-bold text-white py-3.5 fs-5 transition-all"
                    (click)="handlePinLogin()" [disabled]="!pinCode || loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              } @else {
                <i class="fa-solid fa-right-to-bracket me-2"></i>
              }
              {{ i18n.t('authenticateBtn') }}
            </button>
          } @else {
            <!-- Credentials Form Section -->
            <div class="mb-3">
              <label class="form-label text-white-50 fs-6 fw-semibold mb-1">
                <i class="fa-solid fa-store text-cyan me-1.5"></i> {{ i18n.t('storeLocationLabel') }}
              </label>
              <select class="form-select form-select-lg bg-dark text-light border-secondary border-opacity-50 rounded-3 p-3 shadow-sm" [(ngModel)]="selectedStoreId">
                <option [value]="1">🏬 {{ i18n.t('malagaStoreOption') }}</option>
                <option [value]="2">🌴 {{ i18n.t('torremolinosStoreOption') }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="form-label text-white-50 fs-6 fw-semibold mb-1">
                <i class="fa-solid fa-user-gear text-cyan me-1.5"></i> {{ i18n.t('roleSelectionLabel') }}
              </label>
              <select class="form-select form-select-lg bg-dark text-light border-secondary border-opacity-50 rounded-3 p-3 shadow-sm" [(ngModel)]="selectedRole">
                <option value="ADMIN">🛡️ {{ i18n.t('adminRoleOption') }}</option>
                <option value="EMPLOYEE">💼 {{ i18n.t('employeeRoleOption') }}</option>
              </select>
            </div>

            <button class="btn btn-gradient-primary btn-lg w-100 rounded-4 shadow-lg fw-bold text-white py-3.5 fs-5 transition-all"
                    (click)="handleCredentialsLogin()" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              } @else {
                <i class="fa-solid fa-shield-cat me-2"></i>
              }
              {{ i18n.t('signInStaffSuite') }}
            </button>
          }

          <!-- Bottom Return Link -->
          <div class="text-start mt-4 border-top border-light border-opacity-10 pt-4">
            <a href="#/book" class="text-white-50 fs-6 text-decoration-none hover-cyan transition-all">
              <i class="fa-solid fa-arrow-left me-2"></i> {{ i18n.t('returnToPublicSite') }}
            </a>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .login-split-wrapper {
      background: radial-gradient(circle at 30% 30%, #111827 0%, #080c14 100%) !important;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      opacity: 0.3;
      animation: floatGlow 14s ease-in-out infinite alternate;
    }
    .orb-1 { width: 450px; height: 450px; background: #2563eb; top: -120px; left: -100px; }
    .orb-2 { width: 380px; height: 380px; background: #0284c7; bottom: -100px; right: 20%; animation-delay: -5s; }
    .orb-3 { width: 300px; height: 300px; background: #7c3aed; top: 30%; left: 35%; animation-delay: -9s; }

    @keyframes floatGlow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(40px, 50px) scale(1.18); }
    }

    .left-hero-panel {
      background: rgba(15, 23, 42, 0.45);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .right-form-panel {
      background: rgba(10, 14, 23, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .brand-emblem {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
    }

    .text-cyan { color: #38bdf8 !important; }
    .max-w-650 { max-width: 650px; }
    .max-w-550 { max-width: 550px; }

    .segmented-control {
      background: rgba(18, 26, 43, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    
    .active-tab {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }

    .active-lang {
      background: rgba(37, 99, 235, 0.85) !important;
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
