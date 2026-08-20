import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shifts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Actions -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-briefcase fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('shifts') }} & Till Operations</h3>
            <p class="text-secondary small mb-0">Store till management, PIN authentication, signed contracts count, and cash reconciliation for <strong class="text-info">{{ getStoreName(state.activeStoreId()) }}</strong></p>
          </div>
        </div>

        <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
          <i class="fa-solid fa-store me-1 text-warning"></i> Store: {{ getStoreName(state.activeStoreId()) }}
        </div>
      </div>

      <!-- Real-Time Employee Performance & Financial Counters Grid -->
      <div class="row g-3 mb-4">
        <!-- Signed Contracts Counter -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-3 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(56,189,248,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="text-secondary small">Signed Contracts (عقود موقعة)</span>
              <i class="fa-solid fa-file-contract text-info"></i>
            </div>
            <h3 class="fw-extrabold text-white my-1 font-heading">{{ stats()?.shift_contracts_count || 0 }} <span class="fs-6 text-secondary font-sans">Shift</span></h3>
            <div class="text-secondary small" style="font-size: 0.75rem;">
              <i class="fa-solid fa-calendar-day me-1 text-info"></i> Full Day Total: <strong class="text-white">{{ stats()?.today_contracts_count || 0 }} Contracts</strong>
            </div>
          </div>
        </div>

        <!-- Revenue Inflow (المدخول) -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-3 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(34,197,94,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="text-secondary small">Revenue Inflow (المدخول)</span>
              <i class="fa-solid fa-arrow-down-left-and-arrow-up-right text-success"></i>
            </div>
            <h3 class="fw-extrabold text-success my-1 font-heading">€{{ stats()?.shift_inflow || 0 }} <span class="fs-6 text-secondary font-sans">Shift</span></h3>
            <div class="text-secondary small" style="font-size: 0.75rem;">
              <i class="fa-solid fa-calendar-day me-1 text-success"></i> Full Day Total: <strong class="text-success">€{{ stats()?.today_inflow || 0 }}</strong>
            </div>
          </div>
        </div>

        <!-- Cash Outflow / Expenses (المخرج) -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-3 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(239,68,68,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="text-secondary small">Outflow / Withdrawals (المخرج)</span>
              <i class="fa-solid fa-hand-holding-dollar text-danger"></i>
            </div>
            <h3 class="fw-extrabold text-danger my-1 font-heading">€{{ stats()?.shift_outflow || 0 }} <span class="fs-6 text-secondary font-sans">Shift</span></h3>
            <div class="text-secondary small" style="font-size: 0.75rem;">
              <i class="fa-solid fa-calendar-day me-1 text-danger"></i> Full Day Total: <strong class="text-danger">€{{ stats()?.today_outflow || 0 }}</strong>
            </div>
          </div>
        </div>

        <!-- Net Shift Cash Balance -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-3 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(234,179,8,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="text-secondary small">Net Till Cash Balance</span>
              <i class="fa-solid fa-cash-register text-warning"></i>
            </div>
            <h3 class="fw-extrabold text-warning my-1 font-heading">€{{ stats()?.net_shift_balance || configuredFloat() }}</h3>
            <div class="text-secondary small" style="font-size: 0.75rem;">
              Float €{{ stats()?.shift_opening_float || configuredFloat() }} + Inflow €{{ stats()?.shift_inflow || 0 }} - Outflow €{{ stats()?.shift_outflow || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- End-of-Day Paid Transactions Review Sheet (جدول مدفوعات آخر النهار للمراجعة) -->
      <div class="card border rounded-4 p-4 mb-4 shadow-sm" style="background: #161e2e !important; border-color: rgba(34,197,94,0.2) !important;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom border-secondary border-opacity-25 pb-2">
          <div>
            <h5 class="fw-bold text-white mb-0 font-heading"><i class="fa-solid fa-receipt text-success me-2"></i> End-of-Day Paid Transactions Audit Sheet (مدفوعات اليوم للمراجعة)</h5>
            <span class="text-secondary small">Staff end-of-day audit review for confirmed rental contract payments & workshop repair orders</span>
          </div>

          <button class="btn btn-outline-success btn-sm rounded-pill px-3 text-white" (click)="loadPaidTransactions()">
            <i class="fa-solid fa-rotate me-1 text-white"></i> Refresh Audit Sheet
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0 small">
            <thead>
              <tr class="text-secondary text-uppercase" style="font-size: 0.75rem;">
                <th>Ref Code / Order</th>
                <th>Payment Type</th>
                <th>Customer Name</th>
                <th>Vehicle / Service</th>
                <th class="text-end">Amount Paid (€)</th>
                <th>Method</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              @if (paidTransactions().length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-4 text-secondary">No paid transactions recorded today for {{ getStoreName(state.activeStoreId()) }}.</td>
                </tr>
              } @else {
                @for (tx of paidTransactions(); track tx.id) {
                  <tr>
                    <td class="fw-bold text-info font-mono">{{ tx.code }}</td>
                    <td>
                      <span class="badge rounded-pill px-2 py-1 text-white" [class.bg-primary]="tx.type === 'RENTAL_CONTRACT'" [class.bg-warning]="tx.type !== 'RENTAL_CONTRACT'">
                        {{ tx.type === 'RENTAL_CONTRACT' ? 'Rental Contract' : 'Repair Work Order' }}
                      </span>
                    </td>
                    <td class="fw-semibold text-white">{{ tx.customer_name }}</td>
                    <td class="text-light">{{ tx.vehicle_name || 'Vehicle Unit' }}</td>
                    <td class="text-end fw-extrabold text-success fs-6">€{{ tx.amount.toFixed(2) }}</td>
                    <td class="text-secondary small"><i class="fa-solid fa-credit-card me-1 text-info"></i> {{ tx.payment_method }}</td>
                    <td class="text-center">
                      <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 rounded-pill px-3 py-1 fw-bold">
                        <i class="fa-solid fa-lock me-1 text-white"></i> {{ tx.status }}
                      </span>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Active Shift Box / Open Shift Form -->
      @if (state.activeShift()) {
        <div class="card border rounded-4 p-4 mb-4 shadow-sm" style="background: #161e2e !important; border-color: rgba(56,189,248,0.2) !important;">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div>
              <span class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 px-3 py-2 rounded-pill mb-2 fw-bold">
                <i class="fa-solid fa-circle-check me-1 text-white"></i> Active Cash Shift OPEN
              </span>
              <h4 class="fw-bold text-white mb-0 font-heading">Shift Employee: {{ state.activeShift()?.employee_name || 'Staff' }} (Till Float: €{{ state.activeShift()?.opening_cash || configuredFloat() }})</h4>
              <span class="text-secondary small">Opened at {{ formatDate(state.activeShift()?.start_time || state.activeShift()?.opened_at) }}</span>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-outline-warning rounded-pill px-3 shadow-sm text-white" (click)="showWithdrawalModal = true">
                <i class="fa-solid fa-hand-holding-dollar me-1 text-white"></i> Cash Withdrawal
              </button>
              <button class="btn btn-danger rounded-pill px-4 shadow-sm fw-bold text-white" (click)="showCloseShiftModal = true">
                <i class="fa-solid fa-lock me-1 text-white"></i> Close Shift
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="card border rounded-4 p-4 mb-4 text-center shadow-sm" style="background: #161e2e !important; border-color: rgba(56,189,248,0.3) !important;">
          <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span class="badge bg-info bg-opacity-20 text-white border border-info px-3 py-2 rounded-pill fw-bold">
              <i class="fa-solid fa-sliders me-1 text-white"></i> Admin Configured Till Float: €{{ configuredFloat() }}.00
            </span>
          </div>
          <h4 class="fw-bold text-white mb-2 font-heading">Open Store Cash Shift</h4>
          <p class="text-secondary small mb-4">Enter your 4-digit Employee PIN Code (1234 Gustavo, 2222 Fran, 3333 Ahmet, 4444 Abdallah, 1111 Admin) to open the till with the pre-configured float.</p>

          <div class="row justify-content-center g-3">
            <div class="col-12 col-md-6 col-lg-5">
              <label class="form-label text-secondary small">Employee PIN Code (رمز الدخول)</label>
              <div class="input-group input-group-lg mb-2">
                <span class="input-group-text bg-dark text-info border-secondary"><i class="fa-solid fa-key"></i></span>
                <input type="password" maxlength="4" class="form-control bg-dark text-light border-secondary text-center fw-bold font-mono fs-4"
                       placeholder="4-Digit PIN" [(ngModel)]="pinCode" (keyup.enter)="handleOpenShift()" />
              </div>
            </div>

            <div class="col-12 col-md-6 col-lg-5 d-flex align-items-end">
              <button class="btn btn-success btn-lg w-100 rounded-pill shadow-sm fw-bold text-white py-3 mb-2" (click)="handleOpenShift()" [disabled]="!pinCode">
                <i class="fa-solid fa-lock-open me-2 text-white"></i> Open Shift (€{{ configuredFloat() }} Float)
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Withdrawal Form -->
      @if (showWithdrawalModal) {
        <div class="card bg-dark border border-warning rounded-4 p-4 mb-4 shadow-lg">
          <h5 class="fw-bold text-warning mb-3"><i class="fa-solid fa-hand-holding-dollar me-2"></i> Register Till Cash Withdrawal</h5>
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label text-secondary small">Amount (€)</label>
              <input type="number" class="form-control bg-dark text-light border-secondary" [(ngModel)]="withdrawalAmount" />
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label text-secondary small">Reason / Notes</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Supplier payout, change replenishment..." [(ngModel)]="withdrawalReason" />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showWithdrawalModal = false">Cancel</button>
            <button class="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-white" (click)="handleWithdrawal()">Save Withdrawal</button>
          </div>
        </div>
      }

      <!-- Close Shift Form -->
      @if (showCloseShiftModal) {
        <div class="card bg-dark border border-danger rounded-4 p-4 mb-4 shadow-lg">
          <h5 class="fw-bold text-danger mb-3"><i class="fa-solid fa-lock me-2"></i> Close Shift & Till Audit</h5>
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label text-secondary small">Actual Cash Counted (€)</label>
              <input type="number" class="form-control bg-dark text-light border-secondary fw-bold" [(ngModel)]="closingCash" />
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label text-secondary small">Shift Audit Notes</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Remarks regarding discrepancy or cash deposit..." [(ngModel)]="closeNotes" />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showCloseShiftModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm rounded-pill px-4 fw-bold text-white" (click)="handleCloseShift()">Confirm Close Shift</button>
          </div>
        </div>
      }

      <!-- Shift History Log Table -->
      <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-clock-rotate-left me-2 text-info"></i> Shift History Log</h5>
      @if (loadingHistory()) {
        <div class="text-center py-4">
          <div class="spinner-border text-info" role="status"></div>
        </div>
      } @else if (history().length === 0) {
        <p class="text-secondary small">No shift logs recorded for {{ getStoreName(state.activeStoreId()) }}.</p>
      } @else {
        <div class="row g-3">
          @for (s of history(); track s.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border rounded-4 p-3 shadow-sm" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold text-info font-mono">Shift #{{ s.id }}</span>
                  <span class="badge rounded-pill px-3 py-1 text-white"
                        [class.bg-success]="s.status === 'OPEN'"
                        [class.bg-opacity-20]="s.status === 'OPEN'"
                        [class.border]="s.status === 'OPEN'"
                        [class.border-success]="s.status === 'OPEN'"
                        [class.bg-secondary]="s.status !== 'OPEN'">
                    {{ s.status }}
                  </span>
                </div>
                <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 small mb-2">
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Employee:</span> <strong class="text-white">{{ s.employee_name || 'Staff' }}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Opened:</span> <span class="text-white">{{ formatDate(s.start_time || s.opened_at) }}</span></div>
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Closed:</span> <span class="text-white">{{ formatDate(s.end_time || s.closed_at) }}</span></div>
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Initial Float:</span> <strong class="text-white">€{{ s.opening_cash }}</strong></div>
                  <div class="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-1 mt-1"><span class="text-secondary">Closing Count:</span> <strong class="text-success">€{{ s.closing_cash || '-' }}</strong></div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ShiftsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  pinCode = '';
  closingCash = 0;
  closeNotes = '';
  withdrawalAmount = 0;
  withdrawalReason = '';

  showWithdrawalModal = false;
  showCloseShiftModal = false;

  history = signal<any[]>([]);
  stats = signal<any>(null);
  paidTransactions = signal<any[]>([]);
  configuredFloat = signal<number>(150);
  loadingHistory = signal<boolean>(true);

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      untracked(() => {
        this.loadStoreConfiguredFloat();
        this.api.getCurrentShift();
        this.loadHistory();
        this.loadEmployeeStats();
        this.loadPaidTransactions();
      });
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    await this.loadStoreConfiguredFloat();
    await this.api.getCurrentShift();
    await this.loadHistory();
    await this.loadEmployeeStats();
    await this.loadPaidTransactions();
  }

  getStoreName(id: number): string {
    return id === 2 ? 'Camping Mijas Resort' : 'Málaga Central Beach';
  }

  async loadStoreConfiguredFloat() {
    try {
      const stores = await this.api.getStores();
      const current = stores.find((s: any) => s.id === this.state.activeStoreId());
      if (current && current.initial_cash_float !== undefined) {
        this.configuredFloat.set(current.initial_cash_float);
      }
    } catch (err) {
      // Fallback
    }
  }

  async loadEmployeeStats() {
    try {
      const res = await this.api.getEmployeeShiftStats();
      this.stats.set(res);
    } catch (err) {
      // Fallback
    }
  }

  async loadPaidTransactions() {
    try {
      const txs = await this.api.getPaidTransactions();
      this.paidTransactions.set(txs || []);
    } catch (err) {
      // Fallback
    }
  }

  async loadHistory() {
    this.loadingHistory.set(true);
    try {
      const logs = await this.api.getShiftHistory();
      this.history.set(logs || []);
    } catch (err) {
      this.state.showToast('Error', 'Could not load shift history', 'danger');
    } finally {
      this.loadingHistory.set(false);
    }
  }

  async handleOpenShift() {
    try {
      await this.api.openShift(this.configuredFloat(), this.pinCode);
      this.state.showToast('Shift Opened', `Till opened with pre-configured float €${this.configuredFloat()}`, 'success');
      this.pinCode = '';
      await this.loadHistory();
      await this.loadEmployeeStats();
      await this.loadPaidTransactions();
    } catch (err: any) {
      this.state.showToast('Shift Prohibited', err?.error?.error || 'A shift is already active or invalid PIN code', 'danger');
    }
  }

  async handleWithdrawal() {
    if (this.withdrawalAmount <= 0) return;
    try {
      await this.api.recordCashWithdrawal(this.withdrawalAmount, this.withdrawalReason);
      this.state.showToast('Withdrawal Recorded', `€${this.withdrawalAmount} recorded`, 'warning');
      this.showWithdrawalModal = false;
      this.withdrawalAmount = 0;
      this.withdrawalReason = '';
      await this.loadHistory();
      await this.loadEmployeeStats();
    } catch (err) {
      this.state.showToast('Error', 'Failed to record withdrawal', 'danger');
    }
  }

  async handleCloseShift() {
    try {
      await this.api.closeShift(this.closingCash, this.closeNotes);
      this.state.showToast('Shift Closed', 'Till audit completed', 'success');
      this.showCloseShiftModal = false;
      await this.loadHistory();
      await this.loadEmployeeStats();
      await this.loadPaidTransactions();
    } catch (err) {
      this.state.showToast('Error', 'Failed to close shift', 'danger');
    }
  }

  formatDate(dtStr: string): string {
    if (!dtStr) return '-';
    return new Date(dtStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
