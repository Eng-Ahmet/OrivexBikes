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
      'x-dev-username': this.state.currentUser()?.username || 'miguel',
      'x-dev-role': this.state.activeRole()
    });

    const activeStoreId = this.state.activeStoreId();
    if (activeStoreId !== null) {
      headers = headers.set('X-Store-Context', String(activeStoreId));
      headers = headers.set('x-dev-store-id', String(activeStoreId));
    }

    const token = this.state.token();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (withIdempotency) {
      headers = headers.set('Idempotency-Key', `idem-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
    }

    return headers;
  }

  async getMe(): Promise<any> {
    try {
      const res = await firstValueFrom(this.http.get(`${this.apiBase}/auth/me`, { headers: this.getHeaders() }));
      if (res) {
        this.state.setCurrentUser(res as any);
      }
      return res;
    } catch (err) {
      return null;
    }
  }

  async login(role: string, store_id: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/auth/login`, { role, store_id }));
  }

  // --- Multi-Store & Branches ---
  async getStores(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/stores`, { headers: this.getHeaders() }));
  }

  async getStoreById(id: number): Promise<any> {
    return firstValueFrom(this.http.get(`${this.apiBase}/stores/${id}`, { headers: this.getHeaders() }));
  }

  async createStore(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/stores`, data, { headers: this.getHeaders() }));
  }

  async updateStore(id: number, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiBase}/stores/${id}`, data, { headers: this.getHeaders() }));
  }

  async setStoreStatus(id: number, is_active: boolean): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiBase}/stores/${id}/status`, { is_active }, { headers: this.getHeaders() }));
  }

  async deleteStore(id: number | string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiBase}/stores/${id}`, { headers: this.getHeaders() }));
  }

  async getStorePnl(id?: number | null, from?: string, to?: string): Promise<any> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    const storePath = id ? `${this.apiBase}/stores/${id}/pnl` : `${this.apiBase}/stores/pnl`;
    return firstValueFrom(this.http.get(storePath, { headers: this.getHeaders(), params }));
  }

  // --- Transfers ---
  async transferEmployee(id: number, target_store_id: number, reason?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/employees/${id}/transfer`, { target_store_id, reason }, { headers: this.getHeaders() }));
  }

  async transferVehicle(id: number, target_store_id: number, reason?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/vehicles/${id}/transfer`, { target_store_id, reason }, { headers: this.getHeaders() }));
  }

  // --- Operating Expenses & Financial Audits ---
  async getExpenses(status?: string): Promise<any[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/expenses`, { headers: this.getHeaders(), params }));
  }

  async createExpense(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/expenses`, data, { headers: this.getHeaders(true) }));
  }

  async voidExpense(id: number, void_reason: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/expenses/${id}/void`, { void_reason }, { headers: this.getHeaders() }));
  }


  async getSettings(): Promise<any> {
    return firstValueFrom(this.http.get(`${this.apiBase}/settings`, { headers: this.getHeaders() }));
  }

  async updateSetting(key: string, value: any): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.apiBase}/settings/${key}`, { value }, { headers: this.getHeaders(true) })
    );
  }

  async getTariffs(storeId?: number): Promise<any> {
    const targetStoreId = storeId || this.state.activeStoreId();
    const params = new HttpParams().set('store_id', String(targetStoreId));
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

  // --- HR & EMPLOYEE MANAGEMENT ---
  async getEmployees(status = 'ALL'): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId())).set('status', status);
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/employees`, { headers: this.getHeaders(), params }));
  }

  async getEmployeeById(id: number | string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.apiBase}/employees/${id}`, { headers: this.getHeaders() }));
  }

  async createEmployee(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/employees`, { ...data, store_id: this.state.activeStoreId() }, { headers: this.getHeaders(true) }));
  }

  async updateEmployee(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiBase}/employees/${id}`, data, { headers: this.getHeaders(true) }));
  }

  async setEmployeeStatus(id: number | string, status: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiBase}/employees/${id}/status`, { status }, { headers: this.getHeaders(true) }));
  }

  // --- SHIFT DEFINITIONS & ASSIGNMENTS ---
  async getShiftDefinitions(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/shift-definitions/templates`, { headers: this.getHeaders(), params }));
  }

  async createShiftDefinition(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/shift-definitions/templates`, { ...data, store_id: this.state.activeStoreId() }, { headers: this.getHeaders(true) }));
  }

  async getShiftAssignments(date?: string, employeeId?: number): Promise<any[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/shift-definitions/assignments`, { headers: this.getHeaders(), params }));
  }

  async assignShiftToEmployee(shift_id: number, employee_id: number, date: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/shift-definitions/assignments`, { shift_id, employee_id, date }, { headers: this.getHeaders(true) }));
  }

  // --- ATTENDANCE ---
  async getAttendanceRecords(startDate?: string, endDate?: string, employeeId?: number): Promise<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/attendance`, { headers: this.getHeaders(), params }));
  }

  async clockIn(employee_id?: number, notes?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/attendance/clock-in`, { employee_id, notes }, { headers: this.getHeaders(true) }));
  }

  async clockOut(employee_id?: number, notes?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/attendance/clock-out`, { employee_id, notes }, { headers: this.getHeaders(true) }));
  }

  async adjustAttendance(id: number | string, data: any): Promise<any> {
    return firstValueFrom(this.http.put(`${this.apiBase}/attendance/${id}/adjust`, data, { headers: this.getHeaders(true) }));
  }

  // --- OVERTIME ---
  async getOvertimeRecords(employeeId?: number, status = 'ALL'): Promise<any[]> {
    let params = new HttpParams().set('status', status);
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/overtime`, { headers: this.getHeaders(), params }));
  }

  async reviewOvertime(id: number | string, status: string, approved_hours?: number, notes?: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/overtime/${id}/review`, { status, approved_hours, notes }, { headers: this.getHeaders(true) }));
  }

  // --- LEAVE REQUESTS ---
  async getLeaveRequests(employeeId?: number, status = 'ALL'): Promise<any[]> {
    let params = new HttpParams().set('status', status);
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/leave-requests`, { headers: this.getHeaders(), params }));
  }

  async createLeaveRequest(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/leave-requests`, data, { headers: this.getHeaders(true) }));
  }

  async reviewLeaveRequest(id: number | string, status: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/leave-requests/${id}/review`, { status }, { headers: this.getHeaders(true) }));
  }

  // --- SHIFT SWAPS ---
  async getShiftSwapRequests(employeeId?: number, status = 'ALL'): Promise<any[]> {
    let params = new HttpParams().set('status', status);
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/shift-swaps`, { headers: this.getHeaders(), params }));
  }

  async createShiftSwapRequest(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/shift-swaps`, data, { headers: this.getHeaders(true) }));
  }

  async respondShiftSwapRequest(id: number | string, action: 'ACCEPT' | 'REJECT'): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/shift-swaps/${id}/respond`, { action }, { headers: this.getHeaders(true) }));
  }

  async managerReviewShiftSwapRequest(id: number | string, status: 'APPROVED' | 'REJECTED'): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/shift-swaps/${id}/review`, { status }, { headers: this.getHeaders(true) }));
  }

  // --- PAYROLL ---
  async getPayrollPeriods(): Promise<any[]> {
    const params = new HttpParams().set('store_id', String(this.state.activeStoreId()));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/payroll/periods`, { headers: this.getHeaders(), params }));
  }

  async createPayrollPeriod(period_name: string, start_date: string, end_date: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/payroll/periods`, { period_name, start_date, end_date, store_id: this.state.activeStoreId() }, { headers: this.getHeaders(true) }));
  }

  async calculatePayrollForPeriod(periodId: number | string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/payroll/periods/${periodId}/calculate`, {}, { headers: this.getHeaders(true) }));
  }

  async lockPayrollPeriod(periodId: number | string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/payroll/periods/${periodId}/lock`, { status: 'LOCKED' }, { headers: this.getHeaders(true) }));
  }

  async getPayrollRecords(payrollPeriodId?: number, employeeId?: number): Promise<any[]> {
    let params = new HttpParams();
    if (payrollPeriodId) params = params.set('payroll_period_id', String(payrollPeriodId));
    if (employeeId) params = params.set('employee_id', String(employeeId));
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/payroll/records`, { headers: this.getHeaders(), params }));
  }

  async addPayrollAdjustment(recordId: number | string, type: string, amount: number, reason: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/payroll/records/${recordId}/adjustments`, { type, amount, reason }, { headers: this.getHeaders(true) }));
  }

  async updatePayrollRecordStatus(recordId: number | string, status: string, payment_method = 'BANK_TRANSFER', transaction_ref = ''): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiBase}/payroll/records/${recordId}/status`, { status, payment_method, transaction_ref }, { headers: this.getHeaders(true) }));
  }

  // --- REVIEWS MODERATION ---
  async getAdminReviews(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiBase}/admin/reviews`, { headers: this.getHeaders() }));
  }

  async approveReview(id: number | string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiBase}/admin/reviews/${id}/approve`, {}, { headers: this.getHeaders(true) }));
  }

  async rejectReview(id: number | string): Promise<any> {
    return firstValueFrom(this.http.patch(`${this.apiBase}/admin/reviews/${id}/reject`, {}, { headers: this.getHeaders(true) }));
  }
}

