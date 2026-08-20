import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-payroll-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header Bar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-money-check-dollar text-success me-2"></i> Monthly Payroll Processing
          </h3>
          <p class="text-secondary small mb-0">Calculated strictly from approved attendance hours & rate snapshots with immutable locking</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-info rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="openPeriodModal()">
            <i class="fa-solid fa-calendar-plus"></i>
            <span>New Payroll Period</span>
          </button>
          @if (activePeriod()) {
            <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" [disabled]="activePeriod()?.status === 'LOCKED'" (click)="calculatePayroll()">
              <i class="fa-solid fa-calculator"></i>
              <span>Calculate Payroll</span>
            </button>
            <button class="btn btn-danger rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" [disabled]="activePeriod()?.status === 'LOCKED'" (click)="lockPeriod()">
              <i class="fa-solid fa-lock"></i>
              <span>Lock Period (Immutable)</span>
            </button>
          }
        </div>
      </div>

      <!-- Payroll Period Selector Bar -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 p-3 mb-4 shadow-lg" style="background-color: #121824 !important;">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <label class="form-label text-secondary small fw-semibold">Select Payroll Period</label>
            <select class="form-select bg-dark text-light border-secondary" [ngModel]="selectedPeriodId()" (ngModelChange)="onPeriodChange($event)">
              @for (p of payrollPeriods(); track p.id) {
                <option [value]="p.id">{{ p.period_name }} ({{ p.start_date }} &mdash; {{ p.end_date }}) &bull; [{{ p.status }}]</option>
              }
            </select>
          </div>
          @if (activePeriod()) {
            <div class="col-12 col-md-7 d-flex align-items-center justify-content-end gap-3 text-end">
              <div>
                <div class="text-secondary small">Total Gross Payroll</div>
                <div class="fs-4 fw-extrabold text-success font-mono">€{{ totalGrossPay().toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-secondary small">Total Net Payroll</div>
                <div class="fs-4 fw-extrabold text-info font-mono">€{{ totalNetPay().toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-secondary small">Period Status</div>
                <span class="badge px-3 py-2 rounded-pill font-mono fs-6"
                      [class.bg-danger]="activePeriod()?.status === 'LOCKED'"
                      [class.bg-success]="activePeriod()?.status === 'PAID'"
                      [class.bg-warning]="activePeriod()?.status === 'PENDING_REVIEW'"
                      [class.bg-secondary]="activePeriod()?.status === 'DRAFT'">
                  {{ activePeriod()?.status }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Payroll Records Table -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden mb-4" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Employee</th>
                <th>Snapshot Rates</th>
                <th>Approved Hours (Reg / OT)</th>
                <th>Gross Reg Pay</th>
                <th>Gross OT Pay</th>
                <th>Adjustments</th>
                <th>Net Payable Amount</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (rec of payrollRecords(); track rec.id) {
                <tr>
                  <td class="ps-4 fw-bold text-white">
                    {{ rec.employee_name }}
                    <div class="text-secondary small font-mono">{{ rec.payment_method }}</div>
                  </td>
                  <td class="font-mono text-light">
                    <div>Base: €{{ rec.snapshot_hourly_rate.toFixed(2) }}/h</div>
                    <div class="text-warning small">OT: €{{ rec.snapshot_overtime_rate.toFixed(2) }}/h</div>
                  </td>
                  <td class="font-mono">
                    <div class="text-info fw-bold">{{ rec.total_regular_hours }}h Reg</div>
                    @if (rec.total_overtime_hours > 0) {
                      <div class="text-warning fw-bold">+{{ rec.total_overtime_hours }}h OT</div>
                    }
                  </td>
                  <td class="font-mono text-light">€{{ rec.gross_regular_pay.toFixed(2) }}</td>
                  <td class="font-mono text-warning">€{{ rec.gross_overtime_pay.toFixed(2) }}</td>
                  <td class="font-mono">
                    @if (rec.total_adjustments_bonuses > 0) {
                      <div class="text-success small">+€{{ rec.total_adjustments_bonuses.toFixed(2) }} Bonus</div>
                    }
                    @if (rec.total_adjustments_deductions > 0) {
                      <div class="text-danger small">-€{{ rec.total_adjustments_deductions.toFixed(2) }} Ded.</div>
                    }
                    @if (rec.total_adjustments_bonuses === 0 && rec.total_adjustments_deductions === 0) {
                      <span class="text-secondary small">&mdash;</span>
                    }
                  </td>
                  <td class="font-mono fs-5 fw-extrabold text-success">
                    €{{ rec.net_pay.toFixed(2) }}
                  </td>
                  <td>
                    @if (rec.status === 'LOCKED') {
                      <span class="badge bg-danger bg-opacity-25 text-danger border border-danger px-3 py-1 rounded-pill"><i class="fa-solid fa-lock me-1"></i> LOCKED</span>
                    } @else if (rec.status === 'PAID') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill"><i class="fa-solid fa-check me-1"></i> PAID</span>
                    } @else {
                      <span class="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-1 rounded-pill">{{ rec.status }}</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-outline-info btn-sm rounded-pill me-1" (click)="openBreakdownDrawer(rec)">
                      <i class="fa-solid fa-receipt me-1"></i> Breakdown
                    </button>
                    @if (rec.status !== 'LOCKED' && rec.status !== 'PAID') {
                      <button class="btn btn-success btn-sm rounded-pill shadow-sm" (click)="markAsPaid(rec)">
                        <i class="fa-solid fa-money-bill-check me-1"></i> Mark Paid
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center py-5 text-secondary">
                    <i class="fa-solid fa-calculator fa-2x mb-2 d-block"></i>
                    No payroll records generated for this period. Click "Calculate Payroll" above.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Payroll Period Modal -->
      @if (showPeriodModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-calendar-plus me-2"></i> Create Payroll Period</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showPeriodModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="savePayrollPeriod()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Period Name</label>
                    <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="periodForm.period_name" name="period_name" placeholder="e.g. September 2026 Payroll" required />
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small">Start Date</label>
                      <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="periodForm.start_date" name="start_date" required />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small">End Date</label>
                      <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="periodForm.end_date" name="end_date" required />
                    </div>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showPeriodModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Create Period</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Detailed Breakdown & Adjustment Drawer / Modal -->
      @if (selectedRecord()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85);">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-success">
                  <i class="fa-solid fa-receipt me-2"></i> Payroll Breakdown & Audited Line Items &mdash; {{ selectedRecord()?.employee_name }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="selectedRecord.set(null)"></button>
              </div>
              <div class="modal-body p-4">
                <div class="row g-3 mb-4">
                  <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-dark border border-secondary text-center">
                      <div class="text-secondary small">Hourly Rate Snapshot</div>
                      <div class="fs-5 fw-bold text-white font-mono">€{{ selectedRecord()?.snapshot_hourly_rate?.toFixed(2) }}/h</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-dark border border-secondary text-center">
                      <div class="text-secondary small">Gross Earnings</div>
                      <div class="fs-5 fw-bold text-success font-mono">€{{ selectedRecord()?.gross_pay?.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 rounded-3 bg-dark border border-secondary text-center">
                      <div class="text-secondary small">Net Payable Amount</div>
                      <div class="fs-5 fw-bold text-info font-mono">€{{ selectedRecord()?.net_pay?.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>

                <h6 class="fw-bold text-white border-bottom border-secondary pb-2 mb-3"><i class="fa-solid fa-list-check me-2 text-info"></i> Payroll Line Items (PayrollItem)</h6>
                <div class="table-responsive mb-4">
                  <table class="table table-dark table-sm align-middle">
                    <thead>
                      <tr class="text-secondary small border-bottom border-secondary">
                        <th>Type</th>
                        <th>Description</th>
                        <th>Hours / Qty</th>
                        <th>Unit Rate</th>
                        <th class="text-end">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of selectedRecord()?.items; track item.id) {
                        <tr>
                          <td><span class="badge bg-secondary border border-secondary">{{ item.item_type }}</span></td>
                          <td class="text-light small">{{ item.description }}</td>
                          <td class="font-mono">{{ item.hours_or_qty }}h</td>
                          <td class="font-mono">€{{ item.unit_rate.toFixed(2) }}</td>
                          <td class="font-mono fw-bold text-success text-end">€{{ item.total_amount.toFixed(2) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <h6 class="fw-bold text-white border-bottom border-secondary pb-2 mb-3"><i class="fa-solid fa-plus-minus me-2 text-warning"></i> Payroll Adjustments (PayrollAdjustment)</h6>
                <div class="table-responsive mb-3">
                  <table class="table table-dark table-sm align-middle">
                    <thead>
                      <tr class="text-secondary small border-bottom border-secondary">
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Reason / Explanation</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (adj of selectedRecord()?.adjustments; track adj.id) {
                        <tr>
                          <td>
                            @if (adj.type === 'BONUS') {
                              <span class="badge bg-success text-white">BONUS</span>
                            } @else {
                              <span class="badge bg-danger text-white">{{ adj.type }}</span>
                            }
                          </td>
                          <td class="font-mono fw-bold" [class.text-success]="adj.type === 'BONUS'" [class.text-danger]="adj.type !== 'BONUS'">
                            {{ adj.type === 'BONUS' ? '+' : '-' }}€{{ adj.amount.toFixed(2) }}
                          </td>
                          <td class="text-light small">{{ adj.reason }}</td>
                          <td class="font-mono text-secondary small">{{ adj.created_at | date:'short' }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="4" class="text-center text-secondary small py-2">No adjustments added for this payroll record.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Add Adjustment Form (If NOT locked) -->
                @if (selectedRecord()?.status !== 'LOCKED' && selectedRecord()?.status !== 'PAID') {
                  <div class="p-3 bg-dark rounded-3 border border-secondary mt-3">
                    <h6 class="fw-bold text-info mb-2 small"><i class="fa-solid fa-plus me-1"></i> Add Audited Payroll Adjustment</h6>
                    <div class="row g-2 align-items-center">
                      <div class="col-md-3">
                        <select class="form-select form-select-sm bg-dark text-light border-secondary" [(ngModel)]="adjForm.type">
                          <option value="BONUS">BONUS (+)</option>
                          <option value="DEDUCTION">DEDUCTION (-)</option>
                          <option value="ADVANCE">ADVANCE (-)</option>
                        </select>
                      </div>
                      <div class="col-md-3">
                        <input type="number" step="10" class="form-control form-control-sm bg-dark text-light border-secondary font-mono" placeholder="Amount €" [(ngModel)]="adjForm.amount" />
                      </div>
                      <div class="col-md-4">
                        <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary" placeholder="Reason (Mandatory)" [(ngModel)]="adjForm.reason" />
                      </div>
                      <div class="col-md-2 text-end">
                        <button class="btn btn-primary btn-sm rounded-pill w-100 fw-bold" (click)="saveAdjustment()">Add</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div class="modal-footer border-secondary">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="selectedRecord.set(null)">Close</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PayrollPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  payrollPeriods = signal<any[]>([]);
  selectedPeriodId = signal<number>(1);
  payrollRecords = signal<any[]>([]);
  selectedRecord = signal<any | null>(null);

  showPeriodModal = signal<boolean>(false);
  periodForm: any = { period_name: '', start_date: '2026-08-01', end_date: '2026-08-31' };
  adjForm: any = { type: 'BONUS', amount: 50, reason: '' };

  async ngOnInit() {
    await this.loadPeriods();
  }

  async loadPeriods() {
    const list = await this.api.getPayrollPeriods();
    this.payrollPeriods.set(list);
    if (list.length > 0) {
      this.selectedPeriodId.set(list[0].id);
      await this.loadRecordsForPeriod(list[0].id);
    }
  }

  activePeriod() {
    return this.payrollPeriods().find(p => p.id === this.selectedPeriodId());
  }

  async onPeriodChange(newId: any) {
    const id = Number(newId);
    this.selectedPeriodId.set(id);
    await this.loadRecordsForPeriod(id);
  }

  async loadRecordsForPeriod(periodId: number) {
    const records = await this.api.getPayrollRecords(periodId);
    this.payrollRecords.set(records);
  }

  totalGrossPay() {
    return this.payrollRecords().reduce((sum, r) => sum + (r.gross_pay || 0), 0);
  }

  totalNetPay() {
    return this.payrollRecords().reduce((sum, r) => sum + (r.net_pay || 0), 0);
  }

  openPeriodModal() {
    this.periodForm = { period_name: 'September 2026 Payroll', start_date: '2026-09-01', end_date: '2026-09-30' };
    this.showPeriodModal.set(true);
  }

  async savePayrollPeriod() {
    try {
      const res = await this.api.createPayrollPeriod(this.periodForm.period_name, this.periodForm.start_date, this.periodForm.end_date);
      this.state.showToast('Period Created', `Payroll period ${this.periodForm.period_name} created`, 'success');
      this.showPeriodModal.set(false);
      await this.loadPeriods();
    } catch (err) {
      this.state.showToast('Error', 'Failed to create payroll period', 'danger');
    }
  }

  async calculatePayroll() {
    if (!this.selectedPeriodId()) return;
    try {
      await this.api.calculatePayrollForPeriod(this.selectedPeriodId());
      this.state.showToast('Payroll Calculated', 'Calculated monthly payroll from approved attendance hours', 'success');
      await this.loadRecordsForPeriod(this.selectedPeriodId());
    } catch (err: any) {
      this.state.showToast('Calculation Error', err?.error?.error || 'Failed to calculate payroll', 'danger');
    }
  }

  async lockPeriod() {
    if (!this.selectedPeriodId()) return;
    try {
      await this.api.lockPayrollPeriod(this.selectedPeriodId());
      this.state.showToast('Period Locked', 'Payroll period is now locked and immutable', 'info');
      await this.loadPeriods();
    } catch (err) {
      this.state.showToast('Error', 'Failed to lock payroll period', 'danger');
    }
  }

  openBreakdownDrawer(rec: any) {
    this.selectedRecord.set(rec);
    this.adjForm = { type: 'BONUS', amount: 50, reason: '' };
  }

  async saveAdjustment() {
    if (!this.selectedRecord() || !this.adjForm.reason) {
      this.state.showToast('Validation Error', 'Adjustment reason is mandatory', 'warning');
      return;
    }
    try {
      await this.api.addPayrollAdjustment(this.selectedRecord().id, this.adjForm.type, this.adjForm.amount, this.adjForm.reason);
      this.state.showToast('Adjustment Added', `Added ${this.adjForm.type} adjustment`, 'success');
      await this.loadRecordsForPeriod(this.selectedPeriodId());
      const updatedRec = this.payrollRecords().find(r => r.id === this.selectedRecord().id);
      this.selectedRecord.set(updatedRec);
    } catch (err: any) {
      this.state.showToast('Adjustment Error', err?.error?.error || 'Failed to add adjustment', 'danger');
    }
  }

  async markAsPaid(rec: any) {
    try {
      await this.api.updatePayrollRecordStatus(rec.id, 'PAID', rec.payment_method, `TRX-${Date.now()}`);
      this.state.showToast('Marked Paid', `Payroll for ${rec.employee_name} marked as PAID`, 'success');
      await this.loadRecordsForPeriod(this.selectedPeriodId());
    } catch (err) {
      this.state.showToast('Error', 'Failed to mark payroll as paid', 'danger');
    }
  }
}
