// API Client Wrapper for QQBikes REST Backend

const API_BASE = '/api';

export const state = {
  activeStoreId: 1,
  activeRole: 'EMPLOYEE',
  token: null,
  currentUser: {
    username: 'ahmet',
    user_type: 'ADMIN',
    store_id: 1
  }
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-user-id': '1',
    'x-dev-username': state.currentUser.username,
    'x-dev-role': state.activeRole,
    'x-dev-store-id': String(state.activeStoreId)
  };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  return headers;
};

export const api = {
  async login(role, store_id) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, store_id })
    });
    return res.json();
  },

  async getStores() {
    const res = await fetch(`${API_BASE}/stores`);
    return res.json();
  },

  async getSettings() {
    const stores = await this.getStores();
    const store = Array.isArray(stores) ? stores.find((s) => s.id === state.activeStoreId) : null;
    return { initial_cash_float: store ? store.initial_cash_float : 150 };
  },

  async updateSettings(data) {
    return this.updateStoreConfig(state.activeStoreId, data.initial_cash_float);
  },

  async updateStoreConfig(storeId, initial_cash_float) {
    const res = await fetch(`${API_BASE}/stores/${storeId}/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ initial_cash_float })
    });
    return res.json();
  },

  async recordHistoricalCash(storeId, data) {
    const res = await fetch(`${API_BASE}/stores/${storeId}/historical-cash`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async addHistoricalEntry(amount, reason) {
    return this.recordHistoricalCash(state.activeStoreId, { amount, reason });
  },

  async getHistoricalCashLogs(storeId) {
    const res = await fetch(`${API_BASE}/stores/${storeId}/historical-cash`, { headers: getHeaders() });
    return res.json();
  },

  async getHistoricalEntries() {
    return this.getHistoricalCashLogs(state.activeStoreId);
  },

  async getVehicles(category = 'ALL', status = 'ALL', search = '') {
    const params = new URLSearchParams({
      store_id: state.activeStoreId,
      category,
      status,
      q: search
    });
    const res = await fetch(`${API_BASE}/vehicles?${params}`, { headers: getHeaders() });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.vehicles || []);
  },

  async getRentals(status = 'ALL', search = '') {
    const params = new URLSearchParams({
      store_id: state.activeStoreId,
      status,
      q: search
    });
    const res = await fetch(`${API_BASE}/rentals?${params}`, { headers: getHeaders() });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.contracts || []);
  },

  async createRental(data) {
    const res = await fetch(`${API_BASE}/rentals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async returnVehicle(id, data) {
    const res = await fetch(`${API_BASE}/rentals/${id}/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async extendRental(id, data) {
    const res = await fetch(`${API_BASE}/rentals/${id}/extend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getCurrentShift() {
    const res = await fetch(`${API_BASE}/shifts/current`, { headers: getHeaders() });
    return res.json();
  },

  async getShiftHistory() {
    const params = new URLSearchParams({ store_id: state.activeStoreId });
    const res = await fetch(`${API_BASE}/shifts/history?${params}`, { headers: getHeaders() });
    return res.json();
  },

  async getSchedules() {
    const params = new URLSearchParams({ store_id: state.activeStoreId });
    const res = await fetch(`${API_BASE}/shifts/schedules?${params}`, { headers: getHeaders() });
    return res.json();
  },

  async getRepairParts() {
    const res = await fetch(`${API_BASE}/repairs/parts`);
    return res.json();
  },

  async getRepairServices() {
    const res = await fetch(`${API_BASE}/repairs/services`);
    return res.json();
  },

  async getRepairWorkOrders() {
    const params = new URLSearchParams({ store_id: state.activeStoreId });
    const res = await fetch(`${API_BASE}/repairs/work-orders?${params}`);
    return res.json();
  },

  async createRepairWorkOrder(data) {
    const res = await fetch(`${API_BASE}/repairs/work-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createRepairTicket(data) {
    return this.createRepairWorkOrder(data);
  },

  async updateRepairWorkOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/repairs/work-orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async openShift(opening_cash) {
    const res = await fetch(`${API_BASE}/shifts/open`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ opening_cash })
    });
    return res.json();
  },

  async recordCashWithdrawal(amount, reason) {
    const res = await fetch(`${API_BASE}/shifts/withdrawal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, reason })
    });
    return res.json();
  },

  async closeShift(closing_cash, notes) {
    const res = await fetch(`${API_BASE}/shifts/close`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ closing_cash, notes })
    });
    return res.json();
  },

  async getDashboardReport() {
    const params = new URLSearchParams({ store_id: state.activeStoreId });
    const res = await fetch(`${API_BASE}/reports/dashboard?${params}`, { headers: getHeaders() });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
    return res.json();
  }
};
