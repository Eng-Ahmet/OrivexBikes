import { api } from '../api.js';

export async function renderSettingsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Store & Staff Management</h2>
        <p class="page-desc">Configure campsite store parameters & employee accounts</p>
      </div>
    </div>

    <div class="card glass-panel">
      <h3>Users & Assigned Roles</h3>
      <p class="section-desc">Simplified 2-Role System (\`ADMIN\` and \`EMPLOYEE\`) direct store binding.</p>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Assigned Store</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const users = await api.getUsers();
  const tbody = container.querySelector('#usersTableBody');
  tbody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td><strong>${u.username}</strong><br><small style="color: var(--text-dim);">${u.email}</small></td>
      <td><span class="status-badge ${u.user_type === 'ADMIN' ? 'status-AVAILABLE' : 'status-RENTED'}">${u.user_type}</span></td>
      <td>${u.store_name || 'Store #' + u.store_id}</td>
      <td><span style="color: var(--accent-emerald);">Active</span></td>
    `;
    tbody.appendChild(tr);
  });
}
