import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-fingerprint text-info me-2"></i> Attendance & Clocking System
          </h3>
          <p class="text-secondary small mb-0">Record clock-in/clock-out times, calculate worked & regular/overtime hours</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-success rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="handleClockIn()">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Clock In Now</span>
          </button>
          <button class="btn btn-warning rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="handleClockOut()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Clock Out</span>
          </button>
        </div>
      </div>

      <!-- Attendance Table Card -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Date & Employee</th>
                <th>Scheduled</th>
                <th>Actual Clock In / Out</th>
                <th>Worked Hours</th>
                <th>Regular vs OT</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (att of attendanceRecords(); track att.id) {
                <tr>
                  <td class="ps-4">
                    <div class="fw-bold text-white">{{ att.employee_name }}</div>
                    <div class="text-info small font-mono"><i class="fa-solid fa-calendar me-1"></i> {{ att.date }}</div>
                  </td>
                  <td class="font-mono text-secondary small">
                    {{ att.scheduled_start }} &mdash; {{ att.scheduled_end }}
                  </td>
                  <td class="font-mono text-light">
                    @if (att.actual_clock_in) {
                      <span class="text-success"><i class="fa-solid fa-play me-1"></i>{{ formatTime(att.actual_clock_in) }}</span>
                    } @else {
                      <span class="text-secondary">&mdash;</span>
                    }
                    <span class="mx-1">&bull;</span>
                    @if (att.actual_clock_out) {
                      <span class="text-danger"><i class="fa-solid fa-stop me-1"></i>{{ formatTime(att.actual_clock_out) }}</span>
                    } @else {
                      <span class="badge bg-success bg-opacity-25 text-success">ONGOING</span>
                    }
                  </td>
                  <td class="font-mono fw-bold text-white fs-6">
                    {{ att.total_worked_hours }} hrs
                  </td>
                  <td class="font-mono">
                    <span class="text-info fw-bold">{{ att.regular_hours }}h Reg</span>
                    @if (att.overtime_hours > 0) {
                      <span class="badge bg-warning bg-opacity-10 text-warning border border-warning ms-1">+{{ att.overtime_hours }}h OT</span>
                    }
                  </td>
                  <td>
                    @if (att.status === 'PRESENT') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">PRESENT</span>
                    } @else if (att.status === 'LATE') {
                      <span class="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-1 rounded-pill">LATE ({{ att.late_minutes }}m)</span>
                    } @else if (att.status === 'VACATION' || att.status === 'SICK_LEAVE') {
                      <span class="badge bg-info bg-opacity-10 text-info border border-info px-3 py-1 rounded-pill">{{ att.status }}</span>
                    } @else {
                      <span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-1 rounded-pill">{{ att.status }}</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-outline-info btn-sm rounded-pill" (click)="openAdjustModal(att)">
                      <i class="fa-solid fa-sliders me-1"></i> Adjust
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-secondary">
                    <i class="fa-solid fa-fingerprint fa-2x mb-2 d-block"></i>
                    No attendance records found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Adjustment Modal -->
      @if (showAdjustModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-sliders me-2"></i> Adjust Attendance Hours</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showAdjustModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="saveAdjustment()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Regular Hours</label>
                    <input type="number" step="0.5" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="adjustForm.regular_hours" name="regular_hours" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Overtime Hours</label>
                    <input type="number" step="0.5" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="adjustForm.overtime_hours" name="overtime_hours" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Attendance Status</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="adjustForm.status" name="status">
                      <option value="PRESENT">PRESENT</option>
                      <option value="LATE">LATE</option>
                      <option value="EARLY_LEAVE">EARLY LEAVE</option>
                      <option value="SICK_LEAVE">SICK LEAVE</option>
                      <option value="VACATION">VACATION</option>
                      <option value="MANUALLY_ADJUSTED">MANUALLY ADJUSTED</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Adjustment Explanation Notes</label>
                    <textarea class="form-control bg-dark text-light border-secondary" rows="2" [(ngModel)]="adjustForm.notes" name="notes" placeholder="Reason for admin adjustment..."></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showAdjustModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Save Adjustment</button>
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
export class AttendancePageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  attendanceRecords = signal<any[]>([]);
  showAdjustModal = signal<boolean>(false);
  selectedRecord = signal<any | null>(null);
  adjustForm: any = { regular_hours: 8, overtime_hours: 0, status: 'PRESENT', notes: '' };

  async ngOnInit() {
    await this.loadAttendance();
  }

  async loadAttendance() {
    const list = await this.api.getAttendanceRecords();
    this.attendanceRecords.set(list);
  }

  formatTime(isoStr?: string): string {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async handleClockIn() {
    try {
      await this.api.clockIn();
      this.state.showToast('Clocked In', 'Attendance clock-in recorded successfully', 'success');
      await this.loadAttendance();
    } catch (err: any) {
      this.state.showToast('Clock In Error', err?.error?.error || 'Failed to clock in', 'danger');
    }
  }

  async handleClockOut() {
    try {
      await this.api.clockOut();
      this.state.showToast('Clocked Out', 'Attendance clock-out recorded successfully', 'info');
      await this.loadAttendance();
    } catch (err: any) {
      this.state.showToast('Clock Out Error', err?.error?.error || 'Failed to clock out', 'danger');
    }
  }

  openAdjustModal(att: any) {
    this.selectedRecord.set(att);
    this.adjustForm = {
      regular_hours: att.regular_hours,
      overtime_hours: att.overtime_hours,
      status: att.status,
      notes: att.notes || ''
    };
    this.showAdjustModal.set(true);
  }

  async saveAdjustment() {
    if (!this.selectedRecord()) return;
    try {
      await this.api.adjustAttendance(this.selectedRecord().id, this.adjustForm);
      this.state.showToast('Attendance Adjusted', 'Attendance record updated', 'success');
      this.showAdjustModal.set(false);
      await this.loadAttendance();
    } catch (err) {
      this.state.showToast('Error', 'Failed to adjust attendance', 'danger');
    }
  }
}
