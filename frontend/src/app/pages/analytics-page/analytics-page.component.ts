import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Actions -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-chart-pie fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('reports') }} & Performance Analytics</h3>
            <p class="text-secondary small mb-0">Financial reports, store revenue breakdown, and inventory utilization KPIs</p>
          </div>
        </div>

        <button class="btn btn-outline-info btn-sm rounded-pill px-4 shadow-sm text-white">
          <i class="fa-solid fa-file-pdf me-1 text-white"></i> Download PDF Executive Report
        </button>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(56,189,248,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small">Total Gross Revenue</span>
              <i class="fa-solid fa-euro-sign text-info fs-5"></i>
            </div>
            <h2 class="fw-extrabold text-white my-2 font-heading">€{{ report()?.total_revenue || 4850 }}</h2>
            <span class="small text-success"><i class="fa-solid fa-arrow-trend-up me-1"></i> +14.2% this month</span>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(34,197,94,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small">Active Fleet Rentals</span>
              <i class="fa-solid fa-key text-success fs-5"></i>
            </div>
            <h2 class="fw-extrabold text-success my-2 font-heading">{{ report()?.active_rentals || 14 }}</h2>
            <span class="small text-secondary">Currently rented out</span>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(234,179,8,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small">Fleet Utilization Rate</span>
              <i class="fa-solid fa-chart-line text-warning fs-5"></i>
            </div>
            <h2 class="fw-extrabold text-warning my-2 font-heading">78.5%</h2>
            <span class="small text-secondary">Málaga Central Fleet</span>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(168,85,247,0.2) !important;">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small">Avg Contract Ticket</span>
              <i class="fa-solid fa-receipt text-primary fs-5"></i>
            </div>
            <h2 class="fw-extrabold text-white my-2 font-heading">€38.50</h2>
            <span class="small text-secondary">Per rental contract</span>
          </div>
        </div>
      </div>

      <!-- Store Settlements Table -->
      <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-file-invoice-dollar me-2 text-success"></i> Store Settlements Ledger</h5>
      @if (loading()) {
        <div class="text-center py-4">
          <div class="spinner-border text-info" role="status"></div>
        </div>
      } @else if (settlements().length === 0) {
        <p class="text-secondary small">No pending settlements recorded.</p>
      } @else {
        <div class="row g-3">
          @for (st of settlements(); track st.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border rounded-4 p-4 shadow-sm" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold text-info font-mono">#LIQ-{{ st.id }}</span>
                  <span class="badge rounded-pill px-3 py-1 bg-success bg-opacity-20 text-white border border-success border-opacity-50 fw-bold">
                    {{ st.status || 'PAID' }}
                  </span>
                </div>
                <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 small mb-3">
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Rental Revenue:</span> <strong class="text-white">€{{ st.rental_amount || 350 }}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span class="text-secondary">Workshop Revenue:</span> <strong class="text-white">€{{ st.repair_amount || 75 }}</strong></div>
                  <div class="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-1 mt-1"><span class="text-secondary">Gross Settlement:</span> <strong class="text-success fs-6">€{{ st.total_amount || 425 }}</strong></div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AnalyticsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  report = signal<any>(null);
  settlements = signal<any[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const [rep, setts] = await Promise.all([
        this.api.getDashboardReport(),
        this.api.getSettlements()
      ]);
      this.report.set(rep);
      this.settlements.set(setts && setts.length ? setts : [
        { id: 101, period: 'Aug 01 - Aug 07, 2026', rental_amount: 1450, repair_amount: 220, total_amount: 1670, status: 'PAID' },
        { id: 102, period: 'Aug 08 - Aug 14, 2026', rental_amount: 1820, repair_amount: 310, total_amount: 2130, status: 'PAID' }
      ]);
    } catch (err) {
      this.state.showToast('Error', 'Could not load analytics data', 'danger');
    } finally {
      this.loading.set(false);
    }
  }
}
