// API Client Wrapper for QQBikes REST Backend with Proxy & CORS support

const API_BASE = '/api';

export const state = {
  activeStoreId: 1,
  activeRole: 'EMPLOYEE',
  token: null,
  currentUser: {
    username: 'Sofia Employee',
    user_type: 'EMPLOYEE',
    store_id: 1
  }
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-user-id': '2',
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

  async addVehicle(data) {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...data, store_id: state.activeStoreId })
    });
    return res.json();
  },

  async updateVehicleStatus(id, status) {
    const res = await fetch(`${API_BASE}/vehicles/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
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

  async getCurrentShift() {
    const res = await fetch(`${API_BASE}/shifts/current`, { headers: getHeaders() });
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
