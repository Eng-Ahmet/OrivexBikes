import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService, User } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header Bar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1">
            <i class="fa-solid fa-id-card text-info me-2"></i> Employee Management & HR
          </h3>
          <p class="text-secondary small mb-0">Manage staff profiles, contract types, hourly pay rates, and status</p>
        </div>

        <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="fa-solid fa-user-plus"></i>
          <span>Add New Employee</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 p-3 mb-4 shadow-lg" style="background-color: #121824 !important;">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark border-secondary text-secondary"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Search by name, email, code or role..." [(ngModel)]="searchQuery" />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm bg-dark text-light border-secondary" [(ngModel)]="selectedStatus">
              <option value="ALL">All Employment Statuses</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="INACTIVE">Inactive Staff</option>
              <option value="ARCHIVED">Archived Staff</option>
            </select>
          </div>
          <div class="col-6 col-md-4 text-end text-secondary small">
            Total Staff: <strong class="text-white font-mono">{{ filteredEmployees().length }}</strong>
          </div>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="card bg-dark bg-gradient border-secondary rounded-4 shadow-lg overflow-hidden" style="background-color: #121824 !important;">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-secondary small text-uppercase border-bottom border-secondary">
                <th class="ps-4">Code & Employee</th>
                <th>Job Title & Dept</th>
                <th>Contract</th>
                <th>Rates (Normal / OT)</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filteredEmployees(); track emp.id) {
                <tr>
                  <td class="ps-4">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px; font-size: 0.9rem;">
                        {{ emp.first_name.charAt(0) }}{{ emp.last_name.charAt(0) }}
                      </div>
                      <div>
                        <div class="fw-bold text-white">{{ emp.first_name }} {{ emp.last_name }}</div>
                        <div class="text-secondary small font-mono">{{ emp.employee_code }} &bull; {{ emp.phone }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold text-light">{{ emp.job_title }}</div>
                    <div class="text-info small">{{ emp.department }}</div>
                  </td>
                  <td>
                    <span class="badge bg-secondary border border-secondary text-light px-2 py-1 rounded-pill small">
                      {{ emp.contract_type }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-success font-mono">€{{ emp.hourly_rate.toFixed(2) }}/h</div>
                    <div class="text-warning small font-mono">OT: €{{ emp.overtime_rate.toFixed(2) }}/h</div>
                  </td>
                  <td>
                    @if (emp.employment_status === 'ACTIVE') {
                      <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-pill">ACTIVE</span>
                    } @else {
                      <span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-1 rounded-pill">{{ emp.employment_status }}</span>
                    }
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-outline-info btn-sm rounded-pill me-1" (click)="viewDetails(emp)">
                      <i class="fa-solid fa-eye me-1"></i> Details
                    </button>
                    <button class="btn btn-outline-primary btn-sm rounded-pill me-1" (click)="openEditModal(emp)">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    @if (emp.employment_status === 'ACTIVE') {
                      <button class="btn btn-outline-danger btn-sm rounded-pill" (click)="toggleStatus(emp, 'INACTIVE')">
                        <i class="fa-solid fa-user-slash"></i>
                      </button>
                    } @else {
                      <button class="btn btn-outline-success btn-sm rounded-pill" (click)="toggleStatus(emp, 'ACTIVE')">
                        <i class="fa-solid fa-user-check"></i>
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-5 text-secondary">
                    <i class="fa-solid fa-user-clock fa-2x mb-2 d-block"></i>
                    No employee records found matching filter criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Employee Modal -->
      @if (showModal()) {
        <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.75);">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content bg-dark text-light border-secondary rounded-4 shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title fw-bold text-info">
                  <i class="fa-solid fa-user-gear me-2"></i> {{ editingEmp() ? 'Edit Employee Profile' : 'Add New Employee' }}
                </h5>
                <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
              </div>
              <div class="modal-body p-4">
                <form (ngSubmit)="saveEmployee()">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">First Name</label>
                      <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.first_name" name="first_name" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Last Name</label>
                      <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.last_name" name="last_name" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Email</label>
                      <input type="email" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.email" name="email" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Phone Number</label>
                      <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.phone" name="phone" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Job Title</label>
                      <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.job_title" name="job_title" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Department</label>
                      <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="form.department" name="department" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Hourly Base Pay Rate (€/h)</label>
                      <input type="number" step="0.5" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="form.hourly_rate" name="hourly_rate" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Overtime Rate (€/h)</label>
                      <input type="number" step="0.5" class="form-control bg-dark text-light border-secondary font-mono" [(ngModel)]="form.overtime_rate" name="overtime_rate" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Contract Type</label>
                      <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.contract_type" name="contract_type">
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="TEMPORARY">Temporary</option>
                        <option value="FREELANCE">Freelance</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-secondary small">Payment Method</label>
                      <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="form.payment_method" name="payment_method">
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CASH">Cash</option>
                        <option value="CHECK">Check</option>
                      </select>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">Save Employee</button>
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
export class EmployeesPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  employees = signal<any[]>([]);
  searchQuery = '';
  selectedStatus = 'ALL';
  showModal = signal<boolean>(false);
  editingEmp = signal<any | null>(null);

  form: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department: 'Store Operations',
    hourly_rate: 12.00,
    overtime_rate: 18.00,
    contract_type: 'FULL_TIME',
    payment_method: 'BANK_TRANSFER'
  };

  async ngOnInit() {
    await this.loadEmployees();
  }

  async loadEmployees() {
    const list = await this.api.getEmployees();
    this.employees.set(list);
  }

  filteredEmployees() {
    return this.employees().filter(e => {
      const matchQuery = !this.searchQuery ||
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (e.employee_code || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (e.job_title || '').toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchStatus = this.selectedStatus === 'ALL' || e.employment_status === this.selectedStatus;
      return matchQuery && matchStatus;
    });
  }

  openCreateModal() {
    this.editingEmp.set(null);
    this.form = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      department: 'Store Operations',
      hourly_rate: 12.00,
      overtime_rate: 18.00,
      contract_type: 'FULL_TIME',
      payment_method: 'BANK_TRANSFER'
    };
    this.showModal.set(true);
  }

  openEditModal(emp: any) {
    this.editingEmp.set(emp);
    this.form = { ...emp };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async saveEmployee() {
    try {
      if (this.editingEmp()) {
        await this.api.updateEmployee(this.editingEmp().id, this.form);
        this.state.showToast('Employee Updated', `Updated profile for ${this.form.first_name}`, 'success');
      } else {
        await this.api.createEmployee(this.form);
        this.state.showToast('Employee Created', `Created new employee profile for ${this.form.first_name}`, 'success');
      }
      this.closeModal();
      await this.loadEmployees();
    } catch (err) {
      this.state.showToast('Error', 'Failed to save employee profile', 'danger');
    }
  }

  async toggleStatus(emp: any, status: string) {
    await this.api.setEmployeeStatus(emp.id, status);
    this.state.showToast('Status Updated', `${emp.first_name} is now ${status}`, 'info');
    await this.loadEmployees();
  }

  viewDetails(emp: any) {
    this.state.showToast('Employee Info', `${emp.first_name} ${emp.last_name} (${emp.job_title}) - Rate: €${emp.hourly_rate}/h`, 'info');
  }
}
