import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

export interface CalendarDaySlot {
  day_code: string;
  day_name: string;
  date_label: string;
  shifts: {
    id: number;
    employee_name: string;
    role: 'ADMIN' | 'EMPLOYEE' | 'TOUR_GUIDE';
    type: 'STORE_COUNTER' | 'GUIDED_TOUR' | 'MAINTENANCE';
    title: string;
    start_time: string;
    end_time: string;
    status: 'CONFIRMED' | 'PENDING';
  }[];
}

@Component({
  selector: 'app-schedules-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Action Controls -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-calendar-days fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('schedules') }}</h3>
            <p class="text-secondary small mb-0">
              Weekly staff schedule for <strong class="text-info">{{ state.getStoreName(state.activeStoreId()) }}</strong>
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center flex-wrap gap-2">
          <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
            <i class="fa-solid fa-store me-1 text-warning"></i> Store: {{ getStoreName(state.activeStoreId()) }}
          </div>

          @if (state.activeRole() === 'ADMIN') {
            <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-bold text-white" (click)="showNewSlotModal = true">
              <i class="fa-solid fa-plus me-1 text-white"></i> Add Shift Slot
            </button>
          }
        </div>
      </div>

      <!-- Add New Shift Modal / Form -->
      @if (showNewSlotModal) {
        <div class="card bg-dark border border-info rounded-4 p-4 mb-4 shadow-lg">
          <h5 class="fw-bold text-info mb-3"><i class="fa-solid fa-calendar-plus me-2"></i> Schedule Staff Duty</h5>
          <div class="row g-3">
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Employee Name</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="newSlot.employee_name" />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Day of Week</label>
              <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="newSlot.day_code">
                <option value="L">Lunes (Mon)</option>
                <option value="M">Martes (Tue)</option>
                <option value="X">Miércoles (Wed)</option>
                <option value="J">Jueves (Thu)</option>
                <option value="V">Viernes (Fri)</option>
                <option value="S">Sábado (Sat)</option>
                <option value="D">Domingo (Sun)</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Start Time</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="10:00" [(ngModel)]="newSlot.start_time" />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">End Time</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="17:30" [(ngModel)]="newSlot.end_time" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small">Duty Title / Notes</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="Turno Mañana" [(ngModel)]="newSlot.title" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small">Shift Type</label>
              <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="newSlot.type">
                <option value="STORE_COUNTER">Store Counter</option>
                <option value="GUIDED_TOUR">Guided Tour</option>
                <option value="MAINTENANCE">Fleet Maintenance</option>
              </select>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showNewSlotModal = false">Cancel</button>
            <button class="btn btn-info btn-sm rounded-pill px-4 fw-bold text-white" (click)="addShiftSlot()">Save Schedule Slot</button>
          </div>
        </div>
      }

      <!-- Edit Existing Shift Modal / Form (Admin Only) -->
      @if (showEditSlotModal && activeEditSlot) {
        <div class="card bg-dark border border-warning rounded-4 p-4 mb-4 shadow-lg">
          <h5 class="fw-bold text-warning mb-3"><i class="fa-solid fa-pen-to-square me-2"></i> Edit Shift Slot #{{ activeEditSlot.id }}</h5>
          <div class="row g-3">
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Employee Name</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.employee_name" />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Day of Week</label>
              <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.day_code">
                <option value="L">Lunes (Mon)</option>
                <option value="M">Martes (Tue)</option>
                <option value="X">Miércoles (Wed)</option>
                <option value="J">Jueves (Thu)</option>
                <option value="V">Viernes (Fri)</option>
                <option value="S">Sábado (Sat)</option>
                <option value="D">Domingo (Sun)</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">Start Time</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.start_time" />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label text-secondary small">End Time</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.end_time" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small">Duty Title / Notes</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.title" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small">Shift Type</label>
              <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="activeEditSlot.type">
                <option value="STORE_COUNTER">Store Counter</option>
                <option value="GUIDED_TOUR">Guided Tour</option>
                <option value="MAINTENANCE">Fleet Maintenance</option>
              </select>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showEditSlotModal = false">Cancel</button>
            <button class="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-white" (click)="saveEditShiftSlot()">Update Shift</button>
          </div>
        </div>
      }

      <!-- Interactive 7-Day Weekly Calendar Grid -->
      <div class="row g-3">
        @for (day of weeklyCalendar(); track day.day_code) {
          <div class="col-12 col-md-6 col-lg-3 col-xl">
            <div class="card border rounded-4 shadow-sm h-100 d-flex flex-column" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <!-- Day Header -->
              <div class="card-header bg-dark bg-opacity-80 border-bottom border-secondary border-opacity-25 p-3 text-center">
                <h6 class="fw-bold text-white mb-0 font-heading">{{ day.day_name }}</h6>
                <span class="text-secondary small d-block" style="font-size: 0.75rem;">{{ day.date_label }}</span>
              </div>

              <!-- Day Content / Shift Slots -->
              <div class="card-body p-2 d-flex flex-column gap-2 flex-grow-1">
                @if (day.shifts.length === 0) {
                  <div class="text-center py-4 my-auto">
                    <i class="fa-solid fa-moon text-secondary opacity-40 fs-4 mb-2"></i>
                    <p class="text-secondary small mb-0" style="font-size: 0.75rem;">No shifts scheduled</p>
                  </div>
                } @else {
                  @for (sh of day.shifts; track sh.id) {
                    <div class="p-3 rounded-3 border transition position-relative"
                         [class.bg-primary]="sh.type === 'STORE_COUNTER'"
                         [class.bg-warning]="sh.type === 'GUIDED_TOUR'"
                         [class.bg-info]="sh.type === 'MAINTENANCE'"
                         style="border-color: rgba(255,255,255,0.2) !important;">
                      
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <strong class="text-white fs-6 font-heading">{{ sh.employee_name }}</strong>
                        
                        <div class="d-flex align-items-center gap-1">
                          <span class="badge bg-dark bg-opacity-60 text-white rounded-pill px-2 me-1" style="font-size: 0.65rem;">
                            {{ sh.type === 'STORE_COUNTER' ? 'Store' : sh.type === 'GUIDED_TOUR' ? 'Tour' : 'Mantenimiento' }}
                          </span>

                          @if (state.activeRole() === 'ADMIN') {
                            <button class="btn btn-sm btn-link text-white p-0 me-1 opacity-75 hover-opacity-100" (click)="openEditSlotModal(sh)" title="Edit Shift">
                              <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn btn-sm btn-link text-white p-0 opacity-75 hover-opacity-100" (click)="deleteShiftSlot(sh.id)" title="Delete Shift">
                              <i class="fa-solid fa-trash-can"></i>
                            </button>
                          }
                        </div>
                      </div>

                      <div class="text-white fw-bold small mt-1" style="font-size: 0.85rem;">
                        <i class="fa-solid fa-clock me-1 text-white opacity-80"></i> {{ sh.start_time }} - {{ sh.end_time }}
                      </div>
                      <div class="fw-semibold text-white opacity-90 mt-1" style="font-size: 0.78rem;">
                        {{ sh.title }}
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SchedulesPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  showNewSlotModal = false;
  showEditSlotModal = false;
  activeEditSlot: any = null;

  newSlot = {
    employee_name: 'Ahmet',
    day_code: 'L',
    start_time: '10:00',
    end_time: '17:30',
    title: 'Turno Mañana',
    type: 'STORE_COUNTER'
  };

  weeklyCalendar = signal<CalendarDaySlot[]>([]);

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      this.loadStoreSchedule(storeId);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadStoreSchedule(this.state.activeStoreId());
  }

  getStoreName(id: number): string {
    return id === 2 ? 'Camping Mijas Resort Store' : 'Málaga Central Beach Store';
  }

  async loadStoreSchedule(storeId: number) {
    const dayMeta: { [key: string]: { name: string; date: string } } = {
      'L': { name: 'Lunes', date: 'Aug 18' },
      'M': { name: 'Martes', date: 'Aug 19' },
      'X': { name: 'Miércoles', date: 'Aug 20' },
      'J': { name: 'Jueves', date: 'Aug 21' },
      'V': { name: 'Viernes', date: 'Aug 22' },
      'S': { name: 'Sábado', date: 'Aug 23' },
      'D': { name: 'Domingo', date: 'Aug 24' }
    };

    const daysOrder = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    try {
      const fetchedShifts = await this.api.getSchedules();
      
      const grid: CalendarDaySlot[] = daysOrder.map(code => ({
        day_code: code,
        day_name: dayMeta[code].name,
        date_label: dayMeta[code].date,
        shifts: (fetchedShifts || []).filter((s: any) => s.day_code === code)
      }));

      this.weeklyCalendar.set(grid);
    } catch (err) {
      // Fallback
    }
  }

  async addShiftSlot() {
    try {
      await this.api.createSchedule(this.newSlot);
      this.state.showToast('Slot Added', `Schedule slot added for ${this.newSlot.employee_name}`, 'success');
      this.showNewSlotModal = false;
      await this.loadStoreSchedule(this.state.activeStoreId());
    } catch (err) {
      this.state.showToast('Error', 'Could not create schedule slot', 'danger');
    }
  }

  openEditSlotModal(slot: any) {
    this.activeEditSlot = { ...slot };
    this.showEditSlotModal = true;
  }

  async saveEditShiftSlot() {
    if (!this.activeEditSlot) return;
    try {
      await this.api.updateSchedule(this.activeEditSlot.id, this.activeEditSlot);
      this.state.showToast('Shift Updated', `Updated shift for ${this.activeEditSlot.employee_name}`, 'success');
      this.showEditSlotModal = false;
      this.activeEditSlot = null;
      await this.loadStoreSchedule(this.state.activeStoreId());
    } catch (err) {
      this.state.showToast('Error', 'Could not update shift slot', 'danger');
    }
  }

  async deleteShiftSlot(id: number) {
    try {
      await this.api.deleteSchedule(id);
      this.state.showToast('Shift Deleted', 'Schedule slot removed', 'warning');
      await this.loadStoreSchedule(this.state.activeStoreId());
    } catch (err) {
      this.state.showToast('Error', 'Could not delete shift slot', 'danger');
    }
  }
}
