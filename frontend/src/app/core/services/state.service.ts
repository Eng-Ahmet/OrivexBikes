import { Injectable, signal } from '@angular/core';

export interface User {
  id?: number;
  username: string;
  user_type: 'ADMIN' | 'EMPLOYEE';
  store_id: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  activeStoreId = signal<number>(1);
  activeRole = signal<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  token = signal<string | null>(localStorage.getItem('qqbikes_token'));
  currentUser = signal<User>({
    username: 'ahmet',
    user_type: 'ADMIN',
    store_id: 1
  });

  activeShift = signal<any | null>(null);
  stores = signal<any[]>([]);
  toasts = signal<ToastMessage[]>([]);

  setActiveStore(storeId: number) {
    if (this.activeRole() === 'EMPLOYEE' && this.currentUser().store_id) {
      // Employees are locked to their assigned store
      this.activeStoreId.set(this.currentUser().store_id);
      return;
    }
    this.activeStoreId.set(storeId);
  }

  getStoreName(storeId: number): string {
    const matched = this.stores().find(s => s.id === storeId);
    if (matched) return matched.name;
    return storeId === 2 ? 'Torremolinos Central Hub' : 'Málaga Beach Campsite Store';
  }

  setActiveRole(role: 'ADMIN' | 'EMPLOYEE') {
    this.activeRole.set(role);
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
