import { api } from '../api.js';

export async function renderSettingsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">⚙️ Store Settings & Staff Directory</h2>
        <p class="text-secondary small mb-0">Manage 2-role permissions (ADMIN / EMPLOYEE) & campsite locations</p>
      </div>
    </div>

    <div class="card-glass p-3 shadow-sm">
      <h4 class="fw-bold text-info fs-6 mb-3">👥 Active Staff Members & Access Roles</h4>
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col">Staff User</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Assigned Store</th>
              <th scope="col">Permission Role</th>
            </tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tableBody = container.querySelector('#usersTableBody');
  const users = await api.getUsers();

  tableBody.innerHTML = '';
  if (!users || users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary py-4">No user accounts found.</td></tr>`;
    return;
  }

  users.forEach(u => {
    const tr = document.createElement('tr');
    const isAdmin = u.user_type === 'ADMIN';

    tr.innerHTML = `
      <td class="fw-bold text-light">${u.first_name} ${u.last_name} (@${u.username})</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${u.store_name || 'Málaga Beach Campsite Store'}</td>
      <td>
        <span class="badge ${isAdmin ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-secondary'} rounded-pill">
          ${isAdmin ? '⚡ ADMIN MANAGER' : '👤 COUNTER STAFF'}
        </span>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}
