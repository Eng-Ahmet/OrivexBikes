import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-leave-requests-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-plane-departure text-info me-2"></i> Leave & Absence Requests
          </h3>
          <p class="text-secondary small mb-0">Manage vacation holidays, sick leave, and personal time-off requests</p>
        </div>

        <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="openRequestModal()">
          <i class="fa-solid fa-plus"></i>
          <span>Submit Leave Request</span>
        </button>
      </div>

      <!-- Leave Requests List -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Employee</th>
                <th>Leave Type</th>
                <th>Dates & Duration</th>
                <th>Paid Status</th>
                <th>Reason</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (req of leaveRequests(); track req.id) {
                <tr>
                  <td class="ps-4 fw-bold text-white">{{ req.employee_name }}</td>
                  <td>
                    <span class="badge bg-secondary border border-secondary text-info px-3 py-1 rounded-pill">
                      {{ req.leave_type }}
                    </span>
                  </td>
                  <td>
                    <div class="font-mono text-light fw-bold">{{ req.start_date }} &mdash; {{ req.end_date }}</div>
                    <div class="text-secondary small font-mono">{{ req.days_count }} days ({{ req.hours_count }} hrs)</div>
                  </td>
                  <td>
                    @if (req.is_paid) {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success">PAID LEAVE</span>
                    } @else {
                      <span class="badge bg-secondary bg-opacity-25 text-secondary">UNPAID</span>
                    }
                  </td>
                  <td class="text-secondary small" style="max-width: 220px;">{{ req.reason }}</td>
                  <td>
                    @if (req.status === 'PENDING') {
                      <span class="badge bg-warning text-dark px-3 py-1 rounded-pill">PENDING</span>
                    } @else if (req.status === 'APPROVED') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">APPROVED</span>
                    } @else {
                      <span class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 rounded-pill">REJECTED</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    @if (req.status === 'PENDING') {
                      <button class="btn btn-success btn-sm rounded-pill me-1" (click)="review(req, 'APPROVED')">Approve</button>
                      <button class="btn btn-outline-danger btn-sm rounded-pill" (click)="review(req, 'REJECTED')">Reject</button>
                    } @else {
                      <span class="text-secondary small">Processed</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-secondary">No leave requests found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Submit Leave Request Modal -->
      @if (showModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-plane-departure me-2"></i> Submit Leave Request</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="submitRequest()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Employee</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.employee_id" name="employee_id">
                      @for (emp of employees(); track emp.id) {
                        <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }} ({{ emp.job_title }})</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Leave Type</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.leave_type" name="leave_type">
                      <option value="ANNUAL">Annual Vacation Holiday</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="UNPAID">Unpaid Leave</option>
                      <option value="PERSONAL">Personal Leave</option>
                      <option value="EMERGENCY">Emergency Leave</option>
                    </select>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small">Start Date</label>
                      <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="form.start_date" name="start_date" required />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small">End Date</label>
                      <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="form.end_date" name="end_date" required />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Reason for Leave</label>
                    <textarea class="form-control bg-dark text-light border-secondary" rows="2" [(ngModel)]="form.reason" name="reason" placeholder="State reason..." required></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Submit Request</button>
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
export class LeaveRequestsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  leaveRequests = signal<any[]>([]);
  employees = signal<any[]>([]);
  showModal = signal<boolean>(false);

  form: any = {
    employee_id: 1,
    leave_type: 'ANNUAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const [reqs, emps] = await Promise.all([
      this.api.getLeaveRequests(),
      this.api.getEmployees()
    ]);
    this.leaveRequests.set(reqs);
    this.employees.set(emps);
  }

  openRequestModal() {
    this.form = {
      employee_id: this.employees().length ? this.employees()[0].id : 1,
      leave_type: 'ANNUAL',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: ''
    };
    this.showModal.set(true);
  }

  async submitRequest() {
    try {
      await this.api.createLeaveRequest(this.form);
      this.state.showToast('Request Submitted', 'Leave request submitted', 'success');
      this.showModal.set(false);
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to submit leave request', 'danger');
    }
  }

  async review(req: any, status: 'APPROVED' | 'REJECTED') {
    try {
      await this.api.reviewLeaveRequest(req.id, status);
      this.state.showToast('Leave Reviewed', `Leave request ${status.toLowerCase()} and attendance linked`, 'info');
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to review leave request', 'danger');
    }
  }
}
