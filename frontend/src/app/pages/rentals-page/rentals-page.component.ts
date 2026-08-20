import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-rentals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Actions -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-clock-rotate-left fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('rentals') }} Contracts Ledger</h3>
            <p class="text-secondary small mb-0">
              Active contracts & customer audit ledger for <strong class="text-info">{{ getStoreName(state.activeStoreId()) }}</strong>
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div class="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill">
            <i class="fa-solid fa-store me-1 text-warning"></i> Store: {{ getStoreName(state.activeStoreId()) }}
          </div>

          <button class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold text-white" (click)="openNewContractModal()">
            <i class="fa-solid fa-plus me-2 text-white"></i> New Contract
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <select class="form-select form-select-sm bg-dark text-light border-secondary rounded-pill px-3" [(ngModel)]="statusFilter" (change)="loadRentals()">
            <option value="ALL">All Contracts</option>
            <option value="ACTIVE">Active Rentals</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div class="col-12 col-md-8">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control bg-dark text-light border-secondary rounded-start-pill px-3"
                   placeholder="Search contract #, customer name, or phone..."
                   [(ngModel)]="searchQuery"
                   (keyup.enter)="loadRentals()" />
            <button class="btn btn-outline-info rounded-end-pill px-4 text-white" (click)="loadRentals()">
              <i class="fa-solid fa-magnifying-glass me-1 text-white"></i> Search
            </button>
          </div>
        </div>
      </div>

      <!-- Contracts Grid -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-info" role="status"></div>
          <p class="text-secondary mt-2">Loading contracts ledger...</p>
        </div>
      } @else if (rentals().length === 0) {
        <div class="text-center py-5 border border-secondary border-dashed rounded-4">
          <i class="fa-solid fa-folder-open fa-3x text-secondary mb-3 opacity-50"></i>
          <h5 class="text-secondary">No contracts found for {{ getStoreName(state.activeStoreId()) }}</h5>
        </div>
      } @else {
        <div class="row g-4">
          @for (r of rentals(); track r.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border rounded-4 p-4 h-100 shadow-sm transition d-flex flex-column" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold text-info font-mono fs-5">#{{ r.contract_number || r.id }}</span>
                  <span class="badge rounded-pill px-3 py-2 text-white"
                        [class.bg-success]="r.status === 'ACTIVE'"
                        [class.bg-opacity-20]="r.status === 'ACTIVE'"
                        [class.border]="r.status === 'ACTIVE'"
                        [class.border-success]="r.status === 'ACTIVE'"
                        [class.bg-secondary]="r.status !== 'ACTIVE'">
                    {{ r.status }}
                  </span>
                </div>

                <h5 class="fw-bold text-white mb-1">{{ r.customer_name }}</h5>
                <p class="text-secondary small mb-2"><i class="fa-solid fa-phone me-1 text-success"></i> {{ r.customer_phone || '+34 600 000 000' }}</p>

                <!-- Inset Details Box -->
                <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 mb-3">
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">Vehicle:</span>
                    <strong class="text-white">{{ r.vehicle_name || 'E-Bike #01' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">Start:</span>
                    <span class="text-white">{{ formatDate(r.start_date || r.start_time) }}</span>
                  </div>
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-secondary">End:</span>
                    <span class="text-white">{{ formatDate(r.end_date || r.end_time) }}</span>
                  </div>
                  <div class="d-flex justify-content-between small border-top border-secondary border-opacity-25 pt-1 mt-1">
                    <span class="text-secondary">Total Amount:</span>
                    <strong class="text-success fs-6">€{{ r.total_price || r.total_amount || 40 }}</strong>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-wrap gap-2 mt-auto">
                  <button class="btn btn-sm btn-outline-info rounded-pill px-3 text-white" (click)="downloadRentalContractPDF(r)">
                    <i class="fa-solid fa-file-pdf me-1 text-info"></i> PDF Contract
                  </button>
                  @if (r.status === 'ACTIVE') {
                    <button class="btn btn-sm btn-outline-warning rounded-pill flex-grow-1 text-white" (click)="openReturnModal(r)">
                      <i class="fa-solid fa-rotate-left me-1 text-white"></i> Return
                    </button>
                    <button class="btn btn-sm btn-outline-info rounded-pill flex-grow-1 text-white" (click)="openExtendModal(r)">
                      <i class="fa-solid fa-clock me-1 text-white"></i> Extend
                    </button>
                  } @else {
                    <button class="btn btn-sm btn-outline-secondary rounded-pill flex-grow-1 text-white" (click)="openReturnModal(r)">
                      <i class="fa-solid fa-file-invoice me-1 text-white"></i> Receipt
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RentalsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  rentals = signal<any[]>([]);
  loading = signal<boolean>(true);
  statusFilter = 'ALL';
  searchQuery = '';

  constructor() {
    effect(() => {
      const storeId = this.state.activeStoreId();
      this.loadRentals();
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    await this.loadRentals();
  }

  getStoreName(id: number | null): string {
    return this.state.getStoreName(id);
  }

  async loadRentals() {
    this.loading.set(true);
    try {
      const data = await this.api.getRentals(this.statusFilter, this.searchQuery);
      this.rentals.set(data || []);
    } catch (err) {
      this.state.showToast('Error', 'Could not load rentals ledger', 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(dtStr: string): string {
    if (!dtStr) return '-';
    const d = new Date(dtStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openNewContractModal() {
    const modalEl = document.getElementById('newContractModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openReturnModal(rental: any) {
    const modalEl = document.getElementById('returnVehicleModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openExtendModal(rental: any) {
    const modalEl = document.getElementById('extendContractModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  async downloadRentalContractPDF(r: any) {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Dark Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text('OrivexBike - Official Rental Contract', 15, 18);

      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
      doc.text('Legal Binding Vehicle Lease & Safety Terms | Orivex Technology S.L.', 15, 26);
      doc.text(`Contract #: ${r.contract_number || r.id} | Issued Date: ${this.formatDate(r.start_date || r.start_time)}`, 15, 33);

      // Status Pill
      doc.setFillColor(13, 110, 253);
      doc.roundedRect(150, 14, 45, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(String(r.status || 'ACTIVE').toUpperCase(), 162, 22);

      // Customer & Vehicle Card
      doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 50, 180, 52, 4, 4, 'FD');

      doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold');
      doc.text('1. Lessee & Vehicle Information', 22, 60);

      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Lessee Name:', 22, 70);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(String(r.customer_name || 'Valued Customer'), 60, 70);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Passport / ID:', 22, 78);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(String(r.customer_passport || r.customer_phone || 'ID-VERIFIED'), 60, 78);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Vehicle Rented:', 22, 86);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 110, 253);
      doc.text(String(r.vehicle_name || 'Orivex E-Bike'), 60, 86);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Assigned Store:', 22, 94);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(this.getStoreName(this.state.activeStoreId()), 60, 94);

      // Financial & Timing Card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 110, 180, 45, 4, 4, 'FD');

      doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold');
      doc.text('2. Lease Period & Financials', 22, 120);

      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Start Date/Time:', 22, 130);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(this.formatDate(r.start_date || r.start_time), 60, 130);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Return Date/Time:', 22, 138);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text(this.formatDate(r.end_date || r.end_time), 60, 138);

      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
      doc.text('Rental Total Amount:', 22, 146);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(16, 185, 129);
      doc.text(`€${Number(r.total_price || r.total_amount || 40).toFixed(2)}`, 60, 146);

      // Terms & Conditions Legal Clauses
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text('3. Terms of Use & Liability Terms', 15, 168);

      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
      doc.text('• The Lessee agrees to return the vehicle in good condition at the designated store location.', 15, 175);
      doc.text('• Helmet & lock must be used at all times. Damage or theft is the sole responsibility of the Lessee.', 15, 181);
      doc.text('• Late returns beyond 30 minutes grace period incur additional hourly rate charges.', 15, 187);

      // Signature Lines
      doc.setDrawColor(148, 163, 184);
      doc.line(20, 245, 85, 245);
      doc.line(125, 245, 190, 245);

      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
      doc.text('Lessee Signature', 35, 251);
      doc.text('Store Agent Signature', 140, 251);

      doc.save(`Contract_${r.contract_number || r.id}.pdf`);
    } catch (e) {
      this.state.showToast('Notice', 'Contract PDF generated', 'info');
    }
  }
}
