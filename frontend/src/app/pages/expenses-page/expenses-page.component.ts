import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Page Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="h3 fw-bold text-white mb-1">
            <i class="fa-solid fa-file-invoice-dollar me-2 text-warning"></i>Store Operating Expenses
          </h2>
          <p class="text-secondary mb-0">Record, track, and audit store operating costs (Rent, Electricity, Maintenance, Supplies) with strict financial reversal voiding log enforcement.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadExpenses()">
            <i class="fa-solid fa-rotate me-1"></i>Refresh
          </button>
          <button class="btn btn-warning btn-sm px-3 fw-bold text-dark" (click)="openCreateModal()">
            <i class="fa-solid fa-plus me-1"></i>Record Operating Expense
          </button>
        </div>
      </div>

      <!-- Expense Summary KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card bg-dark border-secondary shadow-sm">
            <div class="card-body py-3 d-flex align-items-center justify-content-between">
              <div>
                <span class="text-secondary small fw-bold">Active Operating Expenses</span>
                <h3 class="fw-bold text-white mb-0 mt-1">€{{ totalActiveAmount.toFixed(2) }}</h3>
              </div>
              <div class="icon-box-circle bg-warning bg-opacity-20 text-warning p-3" style="width: 48px; height: 48px;">
                <i class="fa-solid fa-receipt fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark border-secondary shadow-sm">
            <div class="card-body py-3 d-flex align-items-center justify-content-between">
              <div>
                <span class="text-secondary small fw-bold">Active Entries Count</span>
                <h3 class="fw-bold text-info mb-0 mt-1">{{ activeCount }}</h3>
              </div>
              <div class="icon-box-circle bg-info bg-opacity-20 text-info p-3" style="width: 48px; height: 48px;">
                <i class="fa-solid fa-list-check fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark border-secondary shadow-sm">
            <div class="card-body py-3 d-flex align-items-center justify-content-between">
              <div>
                <span class="text-secondary small fw-bold">Voided Reversals</span>
                <h3 class="fw-bold text-danger mb-0 mt-1">{{ voidedCount }}</h3>
              </div>
              <div class="icon-box-circle bg-danger bg-opacity-20 text-danger p-3" style="width: 48px; height: 48px;">
                <i class="fa-solid fa-ban fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Filter & Table Card -->
      <div class="card bg-dark border-secondary shadow-sm">
        <div class="card-header bg-dark border-secondary d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
          <h5 class="fw-bold text-white mb-0 fs-6">Expense Entries Audit Register</h5>
          <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm bg-dark text-white border-secondary" [(ngModel)]="statusFilter" (change)="loadExpenses()">
              <option value="ALL">All Statuses (Active & Voided)</option>
              <option value="ACTIVE">Active Only</option>
              <option value="VOIDED">Voided Only</option>
            </select>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-dark table-hover align-middle mb-0">
              <thead class="table-dark text-secondary small">
                <tr>
                  <th class="ps-3">ID</th>
                  <th>Date</th>
                  <th>Store</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th class="pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (exp of expenses; track exp.id) {
                  <tr [ngClass]="{'opacity-50 text-decoration-line-through': exp.status === 'VOIDED'}">
                    <td class="ps-3 font-mono text-secondary">#{{ exp.id }}</td>
                    <td class="fw-bold text-white">{{ exp.date }}</td>
                    <td><span class="badge bg-secondary font-mono">{{ state.getStoreName(exp.store_id) }}</span></td>
                    <td>
                      <span class="badge" [ngClass]="getCategoryBadgeClass(exp.category)">
                        {{ exp.category }}
                      </span>
                    </td>
                    <td class="text-light">{{ exp.description }}</td>
                    <td><span class="badge bg-dark border border-secondary text-info">{{ exp.payment_method }}</span></td>
                    <td class="fw-bold text-white">€{{ exp.amount.toFixed(2) }}</td>
                    <td>
                      <span class="badge" [ngClass]="exp.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'">
                        {{ exp.status }}
                      </span>
                    </td>
                    <td class="pe-3 text-end">
                      @if (exp.status === 'ACTIVE') {
                        <button class="btn btn-outline-danger btn-sm rounded-pill" (click)="openVoidModal(exp)">
                          <i class="fa-solid fa-ban me-1"></i>Void Entry
                        </button>
                      } @else {
                        <span class="text-danger small" [title]="exp.void_reason"><i class="fa-solid fa-circle-info me-1"></i>Voided: {{ exp.void_reason }}</span>
                      }
                    </td>
                  </tr>
                }
                @if (expenses.length === 0) {
                  <tr>
                    <td colspan="9" class="text-center py-4 text-secondary">No operating expense entries recorded yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create Expense Modal -->
      @if (showCreateModal) {
        <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-secondary shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold">
                  <i class="fa-solid fa-file-invoice-dollar text-warning me-2"></i>Record Store Operating Expense
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="showCreateModal = false"></button>
              </div>
              <div class="modal-body">
                <form (ngSubmit)="saveExpense()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold">Target Store Branch *</label>
                    <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="createForm.store_id" name="store_id" required>
                      @for (st of state.stores(); track st.id) {
                        <option [value]="st.id">{{ st.name }} ({{ st.code }})</option>
                      }
                    </select>
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Category *</label>
                      <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="createForm.category" name="category" required>
                        <option value="RENT">RENT (Premises)</option>
                        <option value="ELECTRICITY">ELECTRICITY & Power</option>
                        <option value="MAINTENANCE">MAINTENANCE & Fleet Parts</option>
                        <option value="SUPPLIES">SUPPLIES & Water</option>
                        <option value="INTERNET">INTERNET & Telecom</option>
                        <option value="OTHER">OTHER Costs</option>
                      </select>
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Amount (€) *</label>
                      <input type="number" step="0.01" class="form-control bg-dark text-white border-secondary" [(ngModel)]="createForm.amount" name="amount" required min="0.01">
                    </div>
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Expense Date *</label>
                      <input type="date" class="form-control bg-dark text-white border-secondary" [(ngModel)]="createForm.date" name="date" required>
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small fw-bold">Payment Method *</label>
                      <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="createForm.payment_method" name="payment_method" required>
                        <option value="CASH">CASH (Register Till)</option>
                        <option value="CARD">CARD (Credit/Debit)</option>
                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold">Description / Justification Notes *</label>
                    <textarea class="form-control bg-dark text-white border-secondary" rows="3" [(ngModel)]="createForm.description" name="description" required placeholder="e.g. Purchased spare e-bike brake pads and cleaning wipes"></textarea>
                  </div>
                  <div class="modal-footer border-secondary px-0 pb-0 pt-3">
                    <button type="button" class="btn btn-outline-secondary" (click)="showCreateModal = false">Cancel</button>
                    <button type="submit" class="btn btn-warning text-dark fw-bold px-4">
                      <i class="fa-solid fa-check me-1"></i>Record Expense Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Void Expense Reversal Modal -->
      @if (showVoidModal) {
        <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-danger shadow-lg">
              <div class="modal-header border-danger bg-danger bg-opacity-10">
                <h5 class="modal-title fw-bold text-danger">
                  <i class="fa-solid fa-ban me-2"></i>Void Financial Expense Entry (Immutable Audit)
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="showVoidModal = false"></button>
              </div>
              <div class="modal-body">
                <div class="alert alert-warning bg-warning bg-opacity-10 text-warning border-warning small mb-3">
                  <i class="fa-solid fa-triangle-exclamation me-1"></i>
                  Financial records cannot be hard-deleted. Voiding will transition this entry to <strong>VOIDED</strong> and create an immutable audit reversal event.
                </div>
                <div class="mb-3">
                  <span class="text-secondary small d-block">Target Expense Entry:</span>
                  <div class="fw-bold text-white">#{{ targetExpense?.id }} - {{ targetExpense?.description }} (€{{ targetExpense?.amount.toFixed(2) }})</div>
                </div>
                <div class="mb-3">
                  <label class="form-label text-white small fw-bold">Mandatory Justification / Void Reason *</label>
                  <textarea class="form-control bg-dark text-white border-secondary" rows="3" [(ngModel)]="voidReason" required placeholder="State the accounting reason for voiding this expense entry..."></textarea>
                </div>
                <div class="modal-footer border-secondary px-0 pb-0 pt-3">
                  <button type="button" class="btn btn-outline-secondary" (click)="showVoidModal = false">Cancel</button>
                  <button type="button" class="btn btn-danger fw-bold px-4" (click)="confirmVoid()">
                    <i class="fa-solid fa-ban me-1"></i>Confirm Reversal Void
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ExpensesPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  expenses: any[] = [];
  statusFilter = 'ALL';

  showCreateModal = false;
  createForm: any = {
    store_id: 1,
    category: 'SUPPLIES',
    amount: 50,
    date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    description: ''
  };

  showVoidModal = false;
  targetExpense: any = null;
  voidReason = '';

  async ngOnInit() {
    await this.loadExpenses();
  }

  async loadExpenses() {
    try {
      this.expenses = await this.api.getExpenses(this.statusFilter);
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to load expenses', 'danger');
    }
  }

  get totalActiveAmount(): number {
    return this.expenses.filter(e => e.status === 'ACTIVE').reduce((sum, e) => sum + e.amount, 0);
  }

  get activeCount(): number {
    return this.expenses.filter(e => e.status === 'ACTIVE').length;
  }

  get voidedCount(): number {
    return this.expenses.filter(e => e.status === 'VOIDED').length;
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'RENT': return 'bg-danger';
      case 'ELECTRICITY': return 'bg-warning text-dark';
      case 'MAINTENANCE': return 'bg-info text-dark';
      case 'SUPPLIES': return 'bg-primary';
      case 'INTERNET': return 'bg-secondary';
      default: return 'bg-dark border border-secondary text-white';
    }
  }

  openCreateModal() {
    this.createForm = {
      store_id: this.state.activeStoreId() || 1,
      category: 'SUPPLIES',
      amount: 50,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH',
      description: ''
    };
    this.showCreateModal = true;
  }

  async saveExpense() {
    try {
      await this.api.createExpense(this.createForm);
      this.state.showToast('Success', 'Operating expense recorded successfully', 'success');
      this.showCreateModal = false;
      await this.loadExpenses();
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to create expense entry', 'danger');
    }
  }

  openVoidModal(exp: any) {
    this.targetExpense = exp;
    this.voidReason = '';
    this.showVoidModal = true;
  }

  async confirmVoid() {
    if (!this.voidReason.trim()) {
      this.state.showToast('Validation Error', 'Mandatory void reason is required', 'warning');
      return;
    }

    try {
      await this.api.voidExpense(this.targetExpense.id, this.voidReason);
      this.state.showToast('Success', 'Expense record voided successfully', 'success');
      this.showVoidModal = false;
      await this.loadExpenses();
    } catch (e: any) {
      this.state.showToast('Error', e?.error?.error || 'Failed to void expense record', 'danger');
    }
  }
}
