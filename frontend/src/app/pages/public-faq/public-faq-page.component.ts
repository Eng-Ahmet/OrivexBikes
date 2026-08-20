import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-public-faq-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 900px;">
      <!-- Header -->
      <div class="bg-dark bg-gradient text-white p-4 p-md-5 rounded-4 shadow-sm mb-4 border border-secondary-subtle">
        <span class="badge bg-secondary px-3 py-2 rounded-pill mb-2">
          <i class="fa-solid fa-circle-question me-1"></i> Frequently Asked Questions
        </span>
        <h1 class="display-5 fw-extrabold font-heading text-white mb-2">Help & FAQ Center</h1>
        <p class="text-secondary lead mb-0">Find quick answers to common questions regarding rental rules, deposits, and guided tours by Orivex Technology.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status"></div>
        <p class="text-secondary mt-3">Loading FAQ items...</p>
      </div>

      <!-- Accordion Grid -->
      <div *ngIf="!loading" class="accordion accordion-flush" id="faqAccordion">
        <div *ngFor="let faq of faqs; let i = index" class="accordion-item bg-dark text-white border-secondary-subtle rounded-4 mb-3 overflow-hidden shadow-sm">
          <h2 class="accordion-header" [id]="'heading' + i">
            <button class="accordion-button bg-dark text-white shadow-none collapsed px-4 py-3 fw-bold" type="button" data-bs-toggle="collapse" [attr.data-bs-target]="'#collapse' + i">
              <span class="badge bg-primary text-white me-3">{{ faq.category }}</span>
              {{ faq.question }}
            </button>
          </h2>
          <div [id]="'collapse' + i" class="accordion-collapse collapse" [attr.data-bs-parent]="'#faqAccordion'">
            <div class="accordion-body text-secondary px-4 py-3 border-top border-secondary">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Still Have Questions CTA -->
      <div class="card bg-secondary bg-opacity-10 border-secondary rounded-4 p-4 text-center mt-5">
        <h4 class="fw-bold text-white mb-2">Still have questions?</h4>
        <p class="text-secondary mb-3">Our friendly team in Málaga is available daily to assist you with custom booking requests.</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/support" class="btn btn-primary rounded-pill px-4">
            <i class="fa-solid fa-headset me-1"></i> Contact Support
          </a>
          <a routerLink="/book" class="btn btn-outline-light rounded-pill px-4">
            <i class="fa-solid fa-calendar-check me-1"></i> Book Online
          </a>
        </div>
      </div>
    </div>
  `
})
export class PublicFaqPageComponent implements OnInit {
  private http = inject(HttpClient);

  faqs: any[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<any[]>('/api/v1/public/faqs').subscribe({
      next: (data) => {
        this.faqs = (Array.isArray(data) && data.length > 0) ? data : this.getFallbackFaqs();
        this.loading = false;
      },
      error: () => {
        this.faqs = this.getFallbackFaqs();
        this.loading = false;
      }
    });
  }

  private getFallbackFaqs() {
    return [
      { id: 1, category: 'Rentals', question: 'What documents are required to rent a bike or scooter?', answer: 'You need a valid passport, national ID card, or EU driver license, plus a credit or debit card for the security deposit.' },
      { id: 2, category: 'Deposits', question: 'How is the security deposit collected and returned?', answer: 'Deposits (€50 to €150 depending on vehicle) are pre-authorized on your card or paid in cash at counter pickup and released immediately upon vehicle return.' },
      { id: 3, category: 'Tours', question: 'Are safety helmets and locks included in the rental price?', answer: 'Yes! All rentals and guided tours include complimentary helmets, heavy-duty locks, and front/rear LED lights.' },
      { id: 4, category: 'Payment', question: 'Can I pay cash at the store counter?', answer: 'Absolutely. You can reserve online for free and choose "Pay at Counter" using cash or credit card upon arrival.' }
    ];
  }
}
