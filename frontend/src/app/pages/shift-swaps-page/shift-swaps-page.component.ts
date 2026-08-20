import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shift-swaps-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-right-left text-info me-2"></i> Shift Swap & Exchange Workflow
          </h3>
          <p class="text-secondary small mb-0">Two-tier approval: peer employee acceptance followed by manager final approval</p>
        </div>

        <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="openSwapModal()">
          <i class="fa-solid fa-repeat"></i>
          <span>Request Shift Swap</span>
        </button>
      </div>

      <!-- Shift Swaps Table -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Date</th>
                <th>Requester</th>
                <th>Target Peer</th>
                <th>Reason</th>
                <th>Status Workflow</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (swap of shiftSwaps(); track swap.id) {
                <tr>
                  <td class="ps-4 font-mono text-info fw-bold">{{ swap.shift_date }}</td>
                  <td class="fw-bold text-white">{{ swap.requester_name }}</td>
                  <td class="fw-bold text-light">{{ swap.target_name }}</td>
                  <td class="text-secondary small" style="max-width: 220px;">{{ swap.reason }}</td>
                  <td>
                    @if (swap.status === 'PENDING_EMPLOYEE') {
                      <span class="badge bg-warning text-dark px-3 py-1 rounded-pill">AWAITING PEER ACCEPT</span>
                    } @else if (swap.status === 'PENDING_MANAGER') {
                      <span class="badge bg-info text-dark px-3 py-1 rounded-pill">AWAITING MANAGER APPROVAL</span>
                    } @else if (swap.status === 'APPROVED') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">APPROVED & SWAPPED</span>
                    } @else {
                      <span class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 rounded-pill">{{ swap.status }}</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    @if (swap.status === 'PENDING_EMPLOYEE') {
                      <button class="btn btn-outline-success btn-sm rounded-pill me-1" (click)="peerRespond(swap, 'ACCEPT')">Peer Accept</button>
                      <button class="btn btn-outline-danger btn-sm rounded-pill" (click)="peerRespond(swap, 'REJECT')">Peer Reject</button>
                    } @else if (swap.status === 'PENDING_MANAGER') {
                      <button class="btn btn-success btn-sm rounded-pill me-1" (click)="managerReview(swap, 'APPROVED')">Manager Approve</button>
                      <button class="btn btn-outline-danger btn-sm rounded-pill" (click)="managerReview(swap, 'REJECTED')">Manager Reject</button>
                    } @else {
                      <span class="text-secondary small font-mono">Completed</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-5 text-secondary">No shift swap requests found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Shift Swap Request Modal -->
      @if (showModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-right-left me-2"></i> Request Shift Exchange</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="submitSwapRequest()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Requester Staff</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.requester_employee_id" name="requester_employee_id">
                      @for (emp of employees(); track emp.id) {
                        <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }}</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Target Employee to Swap With</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.target_employee_id" name="target_employee_id">
                      @for (emp of employees(); track emp.id) {
                        <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }} ({{ emp.job_title }})</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Shift Date</label>
                    <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="form.shift_date" name="shift_date" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Reason for Swap</label>
                    <textarea class="form-control bg-dark text-light border-secondary" rows="2" [(ngModel)]="form.reason" name="reason" placeholder="Reason for exchange..." required></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Send Swap Request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ShiftSwapsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  shiftSwaps = signal<any[]>([]);
  employees = signal<any[]>([]);
  showModal = signal<boolean>(false);

  form: any = {
    requester_employee_id: 1,
    target_employee_id: 2,
    original_shift_id: 1,
    target_shift_id: 2,
    shift_date: new Date().toISOString().split('T')[0],
    reason: ''
  };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const [swaps, emps] = await Promise.all([
      this.api.getShiftSwapRequests(),
      this.api.getEmployees()
    ]);
    this.shiftSwaps.set(swaps);
    this.employees.set(emps);
  }

  openSwapModal() {
    this.form = {
      requester_employee_id: this.employees().length ? this.employees()[0].id : 1,
      target_employee_id: this.employees().length > 1 ? this.employees()[1].id : 2,
      original_shift_id: 1,
      target_shift_id: 2,
      shift_date: new Date().toISOString().split('T')[0],
      reason: ''
    };
    this.showModal.set(true);
  }

  async submitSwapRequest() {
    try {
      await this.api.createShiftSwapRequest(this.form);
      this.state.showToast('Swap Requested', 'Shift swap request sent to peer', 'success');
      this.showModal.set(false);
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to submit shift swap request', 'danger');
    }
  }

  async peerRespond(swap: any, action: 'ACCEPT' | 'REJECT') {
    try {
      await this.api.respondShiftSwapRequest(swap.id, action);
      this.state.showToast('Peer Response Recorded', `Swap request ${action.toLowerCase()}ed`, 'info');
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to respond to swap request', 'danger');
    }
  }

  async managerReview(swap: any, status: 'APPROVED' | 'REJECTED') {
    try {
      await this.api.managerReviewShiftSwapRequest(swap.id, status);
      this.state.showToast('Manager Approval', `Shift swap ${status.toLowerCase()}`, status === 'APPROVED' ? 'success' : 'warning');
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to review swap request', 'danger');
    }
  }
}
