import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
      @for (t of state.toasts(); track t.id) {
        <div class="toast show align-items-center text-white border-0 shadow-lg mb-2 rounded-3"
             [ngClass]="{
               'bg-success': t.type === 'success',
               'bg-danger': t.type === 'danger',
               'bg-warning text-dark': t.type === 'warning',
               'bg-info': t.type === 'info'
             }"
             role="alert">
          <div class="d-flex">
            <div class="toast-body">
              <strong>{{ t.title }}</strong>
              <div class="small mt-1">{{ t.message }}</div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="state.removeToast(t.id)"></button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  state = inject(StateService);
}
