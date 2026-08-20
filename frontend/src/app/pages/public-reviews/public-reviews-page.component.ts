import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-reviews-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <div class="row align-items-center">
          <div class="col-md-8">
            <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="fa-solid fa-star me-1"></i> Customer Experiences
            </span>
            <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Customer Reviews & Ratings</h1>
            <p class="text-secondary lead mb-0">Read genuine feedback from travelers who explored Málaga with QQBikes.</p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-warning text-dark fw-bold btn-lg rounded-pill px-4 shadow" data-bs-toggle="modal" data-bs-target="#submitReviewModal">
              <i class="fa-solid fa-pen-to-square me-2"></i> Write a Review
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
        <p class="text-secondary mt-3">Loading verified customer reviews...</p>
      </div>

      <!-- Reviews Grid -->
      <div *ngIf="!loading" class="row g-4 mb-5">
        <div *ngFor="let review of reviews" class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-secondary-subtle rounded-4 p-4 h-100 shadow-sm hover-shadow transition">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center gap-2">
                <div class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                  {{ review.customer_name.charAt(0) }}
                </div>
                <div>
                  <h6 class="fw-bold text-white mb-0">{{ review.customer_name }}</h6>
                  <span class="text-secondary small">{{ review.created_at | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="text-warning">
                <i *ngFor="let s of getStars(review.rating)" class="fa-solid fa-star"></i>
              </div>
            </div>

            <p class="text-secondary mb-0">"{{ review.comment }}"</p>
          </div>
        </div>
      </div>

      <!-- Modal: Submit Review -->
      <div class="modal fade" id="submitReviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-white border-secondary-subtle rounded-4">
            <div class="modal-header border-secondary">
              <h5 class="modal-title fw-bold"><i class="fa-solid fa-star text-warning me-2"></i> Submit Your Review</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeReviewModalBtn"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="submitReview()">
                <div class="mb-3">
                  <label class="form-label text-secondary small fw-bold">Your Name *</label>
                  <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newReview.customer_name" name="customer_name" required placeholder="e.g. Maria Gonzalez" />
                </div>

                <div class="mb-3">
                  <label class="form-label text-secondary small fw-bold">Rating (1 to 5 Stars) *</label>
                  <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="newReview.rating" name="rating">
                    <option [value]="5">5 Stars - Outstanding</option>
                    <option [value]="4">4 Stars - Very Good</option>
                    <option [value]="3">3 Stars - Good</option>
                    <option [value]="2">2 Stars - Fair</option>
                    <option [value]="1">1 Star - Poor</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="form-label text-secondary small fw-bold">Review Comment *</label>
                  <textarea class="form-control bg-dark text-white border-secondary" rows="3" [(ngModel)]="newReview.comment" name="comment" required placeholder="Tell us about your rental experience, bike condition, staff service..."></textarea>
                </div>

                <button type="submit" class="btn btn-warning text-dark font-weight-bold w-100 rounded-pill shadow-sm" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i class="fa-solid fa-paper-plane me-1"></i> Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PublicReviewsPageComponent implements OnInit {
  private http = inject(HttpClient);

  reviews: any[] = [];
  loading = true;
  submitting = false;

  newReview = {
    customer_name: '',
    rating: 5,
    comment: ''
  };

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<any[]>('/api/v1/public/reviews').subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: () => {
        this.reviews = [];
        this.loading = false;
      }
    });
  }

  getStars(rating: number) {
    return Array(rating).fill(0);
  }

  submitReview() {
    if (!this.newReview.customer_name || !this.newReview.comment) {
      alert('Please provide your name and review comment.');
      return;
    }

    this.submitting = true;
    this.http.post<any>('/api/v1/public/reviews', this.newReview).subscribe({
      next: (res) => {
        this.submitting = false;
        alert(res.message || 'Review submitted for moderation.');
        this.newReview = { customer_name: '', rating: 5, comment: '' };
        document.getElementById('closeReviewModalBtn')?.click();
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.error || 'Failed to submit review.');
      }
    });
  }
}
