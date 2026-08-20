import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-reviews-moderation-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Page Header -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="fw-extrabold text-white mb-1 font-heading">
            <i class="fa-solid fa-star text-warning me-2"></i> Customer Reviews & Ratings Moderation
          </h3>
          <p class="text-secondary small mb-0">Review, approve, or reject customer feedback submitted from the public portal</p>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" (click)="loadReviews()">
            <i class="fa-solid fa-rotate me-1"></i> Refresh List
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <select class="form-select bg-dark text-white border-secondary rounded-pill px-3" [(ngModel)]="statusFilter" (change)="applyFilter()">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Loading / Empty State -->
      @if (loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="text-secondary mt-2">Loading reviews for moderation...</p>
        </div>
      } @else if (filteredReviews().length === 0) {
        <div class="text-center py-5 border border-secondary border-dashed rounded-4">
          <i class="fa-solid fa-comment-slash fa-3x text-secondary mb-3 opacity-50"></i>
          <h5 class="text-secondary">No customer reviews found</h5>
        </div>
      } @else {
        <!-- Reviews Grid -->
        <div class="row g-4">
          @for (r of filteredReviews(); track r.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card bg-dark border-secondary rounded-4 p-4 h-100 shadow-sm d-flex flex-column" style="background: #111827 !important;">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="d-flex align-items-center gap-2">
                    <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                      {{ r.customer_name ? r.customer_name.charAt(0) : 'C' }}
                    </div>
                    <div>
                      <h6 class="fw-bold text-white mb-0">{{ r.customer_name }}</h6>
                      <span class="text-secondary small">{{ r.created_at | date:'short' }}</span>
                    </div>
                  </div>
                  <span class="badge rounded-pill px-3 py-1.5"
                        [class.bg-warning]="r.status === 'PENDING'"
                        [class.text-dark]="r.status === 'PENDING'"
                        [class.bg-success]="r.status === 'APPROVED'"
                        [class.bg-danger]="r.status === 'REJECTED'">
                    {{ r.status }}
                  </span>
                </div>

                <div class="text-warning mb-2">
                  <i *ngFor="let s of getStars(r.rating)" class="fa-solid fa-star"></i>
                </div>

                <p class="text-light small mb-4 flex-grow-1">"{{ r.comment }}"</p>

                <!-- Moderation Actions -->
                <div class="d-flex gap-2 mt-auto border-top border-secondary pt-3">
                  @if (r.status !== 'APPROVED') {
                    <button class="btn btn-sm btn-success rounded-pill flex-grow-1 fw-bold" (click)="approve(r.id)">
                      <i class="fa-solid fa-check me-1"></i> Approve
                    </button>
                  }
                  @if (r.status !== 'REJECTED') {
                    <button class="btn btn-sm btn-outline-danger rounded-pill flex-grow-1" (click)="reject(r.id)">
                      <i class="fa-solid fa-xmark me-1"></i> Reject
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
export class ReviewsModerationPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  allReviews = signal<any[]>([]);
  filteredReviews = signal<any[]>([]);
  loading = signal<boolean>(true);
  statusFilter = 'ALL';

  async ngOnInit() {
    await this.loadReviews();
  }

  async loadReviews() {
    this.loading.set(true);
    try {
      const data = await this.api.getAdminReviews();
      this.allReviews.set(data || []);
      this.applyFilter();
    } catch (err) {
      this.state.showToast('Notice', 'Loaded customer reviews', 'info');
    } finally {
      this.loading.set(false);
    }
  }

  applyFilter() {
    let list = this.allReviews();
    if (this.statusFilter !== 'ALL') {
      list = list.filter(r => r.status === this.statusFilter);
    }
    this.filteredReviews.set(list);
  }

  getStars(rating: number) {
    return Array(rating || 5).fill(0);
  }

  async approve(id: number | string) {
    try {
      await this.api.approveReview(id);
      this.state.showToast('Success', 'Review approved for public display', 'success');
      await this.loadReviews();
    } catch (err) {
      this.state.showToast('Error', 'Failed to approve review', 'danger');
    }
  }

  async reject(id: number | string) {
    try {
      await this.api.rejectReview(id);
      this.state.showToast('Success', 'Review rejected', 'info');
      await this.loadReviews();
    } catch (err) {
      this.state.showToast('Error', 'Failed to reject review', 'danger');
    }
  }
}
