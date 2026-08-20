import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-overtime-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-user-clock text-warning me-2"></i> Overtime Approval Queue
          </h3>
          <p class="text-secondary small mb-0">Review, approve, reject, or modify overtime hours accumulated by staff</p>
        </div>

        <div class="badge bg-warning bg-opacity-20 text-white border border-warning px-3 py-2 rounded-pill font-mono nowrap">
          Pending Overtime Requests: {{ pendingCount() }}
        </div>
      </div>

      <!-- Overtime Queue Table -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Date & Employee</th>
                <th>Regular Hours</th>
                <th>Accumulated Overtime</th>
                <th>Reason / Context</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ot of overtimeRecords(); track ot.id) {
                <tr>
                  <td class="ps-4">
                    <div class="fw-bold text-white">{{ ot.employee_name }}</div>
                    <div class="text-info small font-mono">{{ ot.date }}</div>
                  </td>
                  <td class="font-mono text-secondary">{{ ot.regular_hours }} hrs</td>
                  <td class="font-mono fs-5 fw-extrabold text-warning">+{{ ot.overtime_hours }} hrs</td>
                  <td class="text-light small" style="max-width: 260px;">{{ ot.reason || 'Work extended beyond shift' }}</td>
                  <td>
                    @if (ot.status === 'PENDING') {
                      <span class="badge bg-warning text-dark px-3 py-1 rounded-pill">PENDING REVIEW</span>
                    } @else if (ot.status === 'APPROVED') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">APPROVED</span>
                    } @else {
                      <span class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 rounded-pill">REJECTED</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    @if (ot.status === 'PENDING') {
                      <button class="btn btn-success btn-sm rounded-pill me-1 shadow-sm" (click)="review(ot, 'APPROVED')">
                        <i class="fa-solid fa-check me-1"></i> Approve
                      </button>
                      <button class="btn btn-outline-danger btn-sm rounded-pill shadow-sm" (click)="review(ot, 'REJECTED')">
                        <i class="fa-solid fa-xmark me-1"></i> Reject
                      </button>
                    } @else {
                      <span class="text-secondary small font-mono">Reviewed</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-5 text-secondary">
                    <i class="fa-solid fa-user-clock fa-2x mb-2 d-block"></i>
                    No overtime approval requests found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class OvertimePageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  overtimeRecords = signal<any[]>([]);

  async ngOnInit() {
    await this.loadOvertime();
  }

  async loadOvertime() {
    const list = await this.api.getOvertimeRecords();
    this.overtimeRecords.set(list);
  }

  pendingCount() {
    return this.overtimeRecords().filter(o => o.status === 'PENDING').length;
  }

  async review(ot: any, status: 'APPROVED' | 'REJECTED') {
    try {
      await this.api.reviewOvertime(ot.id, status, ot.overtime_hours, `Manager ${status.toLowerCase()} overtime record`);
      this.state.showToast('Overtime Reviewed', `Overtime record ${status.toLowerCase()}`, status === 'APPROVED' ? 'success' : 'warning');
      await this.loadOvertime();
    } catch (err) {
      this.state.showToast('Error', 'Failed to review overtime record', 'danger');
    }
  }
}
