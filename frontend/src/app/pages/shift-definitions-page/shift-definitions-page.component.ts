import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shift-definitions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-business-time text-info me-2"></i> Shift Definitions & Schedules
          </h3>
          <p class="text-secondary small mb-0">Configure standard shift templates and assign shift slots to employees</p>
        </div>

        <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="fa-solid fa-plus-circle"></i>
          <span>Create Shift Template</span>
        </button>
      </div>

      <!-- Shift Templates Grid -->
      <div class="row g-3 mb-4">
        @for (def of shiftDefinitions(); track def.id) {
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card bg-dark bg-gradient border-secondary rounded-4 p-4 shadow-lg h-100 position-relative overflow-hidden" style="background-color: #121824 !important;">
              <div class="position-absolute top-0 start-0 bottom-0" [style.width]="'6px'" [style.background-color]="def.color_code || '#38bdf8'"></div>
              <div class="ps-2">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-white mb-0">{{ def.name }}</h5>
                  <span class="badge bg-secondary text-light px-2 py-1 small">{{ def.location }}</span>
                </div>
                <div class="fs-4 fw-extrabold text-info font-mono mb-3">
                  <i class="fa-regular fa-clock me-1"></i> {{ def.start_time }} &mdash; {{ def.end_time }}
                </div>
                <div class="text-secondary small mb-3">
                  <div><i class="fa-solid fa-mug-hot me-1 text-warning"></i> Break Duration: <strong>{{ def.break_duration_minutes }} mins</strong></div>
                  <div><i class="fa-solid fa-users me-1 text-primary"></i> Required Headcount: <strong>{{ def.required_headcount }} staff</strong></div>
                </div>
                <div class="d-flex flex-wrap gap-1">
                  @for (day of def.working_days; track day) {
                    <span class="badge bg-dark border border-secondary text-info px-2 py-1 font-mono">{{ day }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Shift Assignments List -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 p-4 shadow-lg" style="background-color: #121824 !important;">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="fw-bold text-white mb-0"><i class="fa-solid fa-calendar-check me-2 text-success"></i> Active Shift Assignments</h5>
          <button class="btn btn-outline-info btn-sm rounded-pill px-3" (click)="openAssignModal()">
            <i class="fa-solid fa-user-plus me-1"></i> Assign Shift Slot
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th>Date</th>
                <th>Employee</th>
                <th>Shift Time</th>
                <th>Break</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (asn of assignments(); track asn.id) {
                <tr>
                  <td class="font-mono text-info fw-bold">{{ asn.date }}</td>
                  <td class="fw-bold text-white">{{ asn.employee_name }}</td>
                  <td class="font-mono text-light">{{ asn.start_time }} &mdash; {{ asn.end_time }}</td>
                  <td class="text-secondary small">{{ asn.break_duration_minutes }} mins</td>
                  <td>
                    <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">{{ asn.status }}</span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-4 text-secondary">No shift assignments recorded yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal for Creating Shift Template -->
      @if (showCreateModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-business-time me-2"></i> Create Shift Template</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showCreateModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="saveShiftDefinition()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Shift Name</label>
                    <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="newDef.name" name="name" required placeholder="e.g. Morning Shift" />
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label text-secondary small">Start Time</label>
                      <input type="time" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="newDef.start_time" name="start_time" required />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary small">End Time</label>
                      <input type="time" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="newDef.end_time" name="end_time" required />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Break Duration (Minutes)</label>
                    <input type="number" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="newDef.break_duration_minutes" name="break_duration_minutes" required />
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showCreateModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Save Template</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal for Assigning Shift to Employee -->
      @if (showAssignModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info"><i class="fa-solid fa-user-plus me-2"></i> Assign Shift Slot</h5>
                <button type="button" class="btn-close btn-close-white" (click)="showAssignModal.set(false)"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="saveAssignment()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Employee</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="assignForm.employee_id" name="employee_id" required>
                      @for (emp of employees(); track emp.id) {
                        <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }} ({{ emp.job_title }})</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Shift Template</label>
                    <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="assignForm.shift_id" name="shift_id" required>
                      @for (def of shiftDefinitions(); track def.id) {
                        <option [value]="def.id">{{ def.name }} ({{ def.start_time }} - {{ def.end_time }})</option>
                      }
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-secondary small">Date</label>
                    <input type="date" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="assignForm.date" name="date" required />
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="showAssignModal.set(false)">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Assign Slot</button>
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
export class ShiftDefinitionsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  shiftDefinitions = signal<any[]>([]);
  assignments = signal<any[]>([]);
  employees = signal<any[]>([]);

  showCreateModal = signal<boolean>(false);
  showAssignModal = signal<boolean>(false);

  newDef: any = { name: '', start_time: '09:00', end_time: '17:00', break_duration_minutes: 60 };
  assignForm: any = { employee_id: 1, shift_id: 1, date: new Date().toISOString().split('T')[0] };

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const [defs, asns, emps] = await Promise.all([
      this.api.getShiftDefinitions(),
      this.api.getShiftAssignments(),
      this.api.getEmployees()
    ]);
    this.shiftDefinitions.set(defs);
    this.assignments.set(asns);
    this.employees.set(emps);
  }

  openCreateModal() {
    this.newDef = { name: '', start_time: '09:00', end_time: '17:00', break_duration_minutes: 60 };
    this.showCreateModal.set(true);
  }

  async saveShiftDefinition() {
    try {
      await this.api.createShiftDefinition(this.newDef);
      this.state.showToast('Shift Created', `Shift template ${this.newDef.name} created`, 'success');
      this.showCreateModal.set(false);
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to save shift template', 'danger');
    }
  }

  openAssignModal() {
    this.assignForm = {
      employee_id: this.employees().length ? this.employees()[0].id : 1,
      shift_id: this.shiftDefinitions().length ? this.shiftDefinitions()[0].id : 1,
      date: new Date().toISOString().split('T')[0]
    };
    this.showAssignModal.set(true);
  }

  async saveAssignment() {
    try {
      await this.api.assignShiftToEmployee(this.assignForm.shift_id, this.assignForm.employee_id, this.assignForm.date);
      this.state.showToast('Shift Assigned', 'Shift slot assigned successfully', 'success');
      this.showAssignModal.set(false);
      await this.loadData();
    } catch (err) {
      this.state.showToast('Error', 'Failed to assign shift', 'danger');
    }
  }
}
