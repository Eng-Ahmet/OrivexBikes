import { api } from '../api.js';

export async function renderSchedulesPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">📅 Weekly Roster Schedule - Málaga Office</h2>
        <p class="text-secondary small mb-0">Official staff shift roster (Lunes - Domingo) for Ahmet, Fran, Gustavo, & Abdallah</p>
      </div>
    </div>

    <!-- Bootstrap 7-Day Responsive Grid -->
    <div id="scheduleGrid" class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3"></div>
  `;

  const grid = container.querySelector('#scheduleGrid');
  const schedules = await api.getSchedules();

  const daysOrder = [
    { code: 'L', name: 'Lunes (Monday)' },
    { code: 'M', name: 'Martes (Tuesday)' },
    { code: 'X', name: 'Miércoles (Wednesday)' },
    { code: 'J', name: 'Jueves (Thursday)' },
    { code: 'V', name: 'Viernes (Friday)' },
    { code: 'S', name: 'Sábado (Saturday)' },
    { code: 'D', name: 'Domingo (Sunday)' }
  ];

  grid.innerHTML = '';

  daysOrder.forEach(day => {
    const dayShifts = schedules.filter(s => s.day_code === day.code);
    const col = document.createElement('div');
    col.className = 'col';

    let shiftsHtml = '';
    if (dayShifts.length === 0) {
      shiftsHtml = `<div class="text-secondary small">No shifts scheduled</div>`;
    } else {
      dayShifts.forEach(s => {
        const isAhmet = s.employee_name.includes('Ahmet');
        const isFran = s.employee_name.includes('Fran');
        const isGus = s.employee_name.includes('Gustavo');
        const isAbdallah = s.employee_name.includes('Abdallah');

        let borderClass = 'border-info';
        if (isAhmet) borderClass = 'border-info';
        if (isFran) borderClass = 'border-warning';
        if (isGus) borderClass = 'border-success';
        if (isAbdallah) borderClass = 'border-primary';

        shiftsHtml += `
          <div class="bg-dark bg-opacity-75 p-2 rounded border border-secondary border-opacity-25 border-start border-3 ${borderClass} mb-2">
            <div class="fw-bold text-light small">${s.employee_name}</div>
            <div class="text-info small font-monospace fw-semibold">⏰ ${s.start_time} - ${s.end_time}</div>
            ${s.task_note ? `<div class="text-secondary" style="font-size: 0.75rem;">📝 ${s.task_note}</div>` : ''}
          </div>
        `;
      });
    }

    col.innerHTML = `
      <div class="card-glass p-3 h-100">
        <h6 class="fw-bold text-light border-bottom border-secondary pb-2 mb-2">${day.name}</h6>
        ${shiftsHtml}
      </div>
    `;

    grid.appendChild(col);
  });
}
