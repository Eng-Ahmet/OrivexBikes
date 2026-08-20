import { Injectable, signal } from '@angular/core';

export interface User {
  id?: number;
  username: string;
  first_name?: string;
  last_name?: string;
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
  token = signal<string | null>(localStorage.getItem('qqbikes_token'));
  
  currentUser = signal<User>(this.loadSavedUser());
  activeRole = signal<'ADMIN' | 'EMPLOYEE'>(this.loadSavedRole());
  activeStoreId = signal<number | null>(this.loadSavedStoreId());

  activeShift = signal<any | null>(null);
  stores = signal<any[]>([]);
  toasts = signal<ToastMessage[]>([]);

  private loadSavedUser(): User {
    try {
      const saved = localStorage.getItem('qqbikes_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      username: 'miguel',
      first_name: 'Miguel',
      last_name: 'Manager',
      user_type: 'ADMIN',
      store_id: 1
    };
  }

  private loadSavedRole(): 'ADMIN' | 'EMPLOYEE' {
    const saved = localStorage.getItem('qqbikes_active_role');
    if (saved === 'ADMIN' || saved === 'EMPLOYEE') return saved;
    return this.currentUser()?.user_type || 'ADMIN';
  }

  private loadSavedStoreId(): number | null {
    const saved = localStorage.getItem('qqbikes_active_store_id');
    if (saved === 'all' || saved === 'null') return null;
    if (saved && !isNaN(Number(saved))) return Number(saved);
    return this.currentUser()?.store_id || null;
  }

  setCurrentUser(user: User) {
    this.currentUser.set(user);
    try {
      localStorage.setItem('qqbikes_user', JSON.stringify(user));
    } catch (e) {}
    if (user.user_type) {
      this.setActiveRole(user.user_type);
    }
    if (user.store_id) {
      this.setActiveStore(user.store_id);
    }
  }

  setActiveStore(storeId: number | null) {
    if (this.activeRole() === 'EMPLOYEE' && this.currentUser()?.store_id) {
      // Employees are locked to their assigned store
      storeId = this.currentUser().store_id;
    }
    this.activeStoreId.set(storeId);
    if (storeId === null) {
      localStorage.setItem('qqbikes_active_store_id', 'all');
    } else {
      localStorage.setItem('qqbikes_active_store_id', String(storeId));
    }
  }

  getStoreName(storeId: number | null): string {
    if (storeId === null) return 'All Stores Context';
    const matched = this.stores().find(s => s.id === storeId);
    if (matched) return matched.name;
    if (storeId === 1) return 'Málaga Beach Campsite Store';
    if (storeId === 2) return 'Torremolinos Central Hub';
    if (storeId === 3) return 'Marbella Port & Marina Hub';
    return `Store #${storeId}`;
  }

  setActiveRole(role: 'ADMIN' | 'EMPLOYEE') {
    this.activeRole.set(role);
    localStorage.setItem('qqbikes_active_role', role);
  }

  logout() {
    this.token.set(null);
    localStorage.removeItem('qqbikes_token');
    localStorage.removeItem('qqbikes_user');
    localStorage.removeItem('qqbikes_active_role');
    localStorage.removeItem('qqbikes_active_store_id');
    this.showToast('Logged Out', 'You have been signed out successfully.', 'info');
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

