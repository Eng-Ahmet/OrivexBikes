import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StateService } from './state.service';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private state = inject(StateService);
  private apiBase = '/api/v1';

  private getHeaders(withIdempotency = false): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Request-ID': `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      'x-dev-user-id': '1',
      'x-dev-username': this.state.currentUser().username,
      'x-dev-role': this.state.activeRole(),
      'x-dev-store-id': String(this.state.activeStoreId())
    });

    const token = this.state.token();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (withIdempotency) {
      headers = headers.set('Idempotency-Key', `idem-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
    }

    return headers;
  }

  async login(role: string, store_id: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/auth/login`, { role, store_id }));
  }

  async getStores(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/stores`));
  }

  async getSettings(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.apiBase}/settings`, { headers: this.getHeaders() }));
  }

  async updateSetting(key: string, value: any): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.apiBase}/settings/${key}`, { value }, { headers: this.getHeaders(true) })
    );
  }

  async getTariffs(): Promise<any> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(this.http.get(`${this.apiBase}/tariffs`, { headers: this.getHeaders(), params }));
  }

  async getVehicles(category = 'ALL', status = 'ALL', search = ''): Promise<any[]> {
    const params = new HttpParams()
      .set('store_id', String(this.state.activeStoreId()))
      .set('category', category)
      .set('status', status)
      .set('q', search);

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiBase}/vehicles`, { headers: this.getHeaders(), params })
    );
    return Array.isArray(res) ? res : res.vehicles || [];
  }

  async getRentals(status = 'ALL', search = ''): Promise<any[]> {
    const params = new HttpParams()
      .set('store_id', String(this.state.activeStoreId()))
      .set('status', status)
      .set('q', search);

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiBase}/rentals`, { headers: this.getHeaders(), params })
    );
    return Array.isArray(res) ? res : res.contracts || [];
  }

  async createRental(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/rentals`, data, { headers: this.getHeaders(true) })
    );
  }

  async returnVehicle(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/rentals/${id}/return`, data, { headers: this.getHeaders(true) })
    );
  }

  async extendRental(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/rentals/${id}/extend`, data, { headers: this.getHeaders(true) })
    );
  }

  async getCurrentShift(): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiBase}/shifts/current`, { headers: this.getHeaders() })
      );
      this.state.activeShift.set(res);
      return res;
    } catch (err) {
      this.state.activeShift.set(null);
      return null;
    }
  }

  async getShiftHistory(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiBase}/shifts/history`, { headers: this.getHeaders(), params })
    );
  }

  async getSchedules(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiBase}/shifts/schedules`, { headers: this.getHeaders(), params })
    );
  }

  async createSchedule(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/shifts/schedules`, { ...data, store_id: this.state.activeStoreId() }, { headers: this.getHeaders(true) })
    );
  }

  async updateSchedule(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.apiBase}/shifts/schedules/${id}`, data, { headers: this.getHeaders(true) })
    );
  }

  async deleteSchedule(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.apiBase}/shifts/schedules/${id}`, { headers: this.getHeaders(true) })
    );
  }

  async getEmployeeShiftStats(): Promise<any> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get(`${this.apiBase}/shifts/employee-stats`, { headers: this.getHeaders(), params })
    );
  }

  async getPaidTransactions(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiBase}/shifts/paid-transactions`, { headers: this.getHeaders(), params })
    );
  }

  async verifyPin(pin: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/auth/verify-pin`, { pin })
    );
  }

  async createStore(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/stores`, data, { headers: this.getHeaders(true) })
    );
  }

  async updateStore(id: number | string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.apiBase}/stores/${id}`, data, { headers: this.getHeaders(true) })
    );
  }

  async deleteStore(id: number | string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.apiBase}/stores/${id}`, { headers: this.getHeaders(true) })
    );
  }

  async openShift(opening_cash: number, pin_code?: string): Promise<any> {
    const res: any = await firstValueFrom(
      this.http.post(`${this.apiBase}/shifts/open`, { opening_cash, pin_code }, { headers: this.getHeaders(true) })
    );
    await this.getCurrentShift();
    return res;
  }

  async recordCashWithdrawal(amount: number, reason: string): Promise<any> {
    const res: any = await firstValueFrom(
      this.http.post(`${this.apiBase}/shifts/withdrawal`, { amount, reason }, { headers: this.getHeaders(true) })
    );
    await this.getCurrentShift();
    return res;
  }

  async closeShift(closing_cash: number, notes: string): Promise<any> {
    const res: any = await firstValueFrom(
      this.http.post(`${this.apiBase}/shifts/close`, { closing_cash, notes }, { headers: this.getHeaders(true) })
    );
    this.state.activeShift.set(null);
    return res;
  }

  async getRepairParts(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/repairs/parts`));
  }

  async getRepairServices(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/repairs/services`));
  }

  async getRepairWorkOrders(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiBase}/repairs/work-orders`, { params })
    );
  }

  async createRepairWorkOrder(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/repairs/work-orders`, data, { headers: this.getHeaders(true) })
    );
  }

  async updateRepairWorkOrderStatus(id: number | string, status: string, payment_method = 'CASH'): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.apiBase}/repairs/work-orders/${id}/status`, { status, payment_method }, { headers: this.getHeaders(true) })
    );
  }

  async getSettlements(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiBase}/settlements`, { headers: this.getHeaders(), params })
    );
  }

  async paySettlement(id: number | string, payment_method = 'CASH'): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiBase}/settlements/${id}/pay`, { payment_method }, { headers: this.getHeaders(true) })
    );
  }

  async getDashboardReport(): Promise<any> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(
      this.http.get(`${this.apiBase}/reports/dashboard`, { headers: this.getHeaders(), params })
    );
  }
}
