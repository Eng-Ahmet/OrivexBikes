import { api } from '../api.js';

export async function renderSchedulesPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2>📅 Weekly Roster Schedule - Málaga Office</h2>
        <p class="page-desc">Official staff shift roster (Lunes - Domingo) for Ahmet, Fran, Gustavo, & Abdallah</p>
      </div>
    </div>

    <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
      <h3 style="margin-bottom: 1rem;">Málaga Store Roster (L - D)</h3>
      <div id="scheduleGrid" class="schedule-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;"></div>
    </div>
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
    const dayCard = document.createElement('div');
    dayCard.className = 'glass-panel';
    dayCard.style.cssText = 'padding: 1rem; border-radius: var(--radius-sm); background: rgba(15, 23, 42, 0.7);';

    let shiftsHtml = '';
    if (dayShifts.length === 0) {
      shiftsHtml = `<div style="font-size: 0.8rem; color: var(--text-dim);">No shifts scheduled</div>`;
    } else {
      dayShifts.forEach(s => {
        const isAhmet = s.employee_name.includes('Ahmet');
        const isFran = s.employee_name.includes('Fran');
        const isGus = s.employee_name.includes('Gustavo');
        const isAbdallah = s.employee_name.includes('Abdallah');

        let badgeColor = 'var(--accent-blue)';
        if (isAhmet) badgeColor = 'var(--accent-cyan)';
        if (isFran) badgeColor = 'var(--accent-amber)';
        if (isGus) badgeColor = 'var(--accent-emerald)';
        if (isAbdallah) badgeColor = '#a855f7';

        shiftsHtml += `
          <div style="margin-top: 0.75rem; padding: 0.65rem; background: rgba(30, 41, 59, 0.8); border-radius: var(--radius-sm); border-left: 3px solid ${badgeColor};">
            <div style="font-weight: 700; font-size: 0.9rem; color: #FFFFFF;">${s.employee_name}</div>
            <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; margin-top: 2px;">⏰ ${s.start_time} - ${s.end_time}</div>
            ${s.task_note ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">📝 ${s.task_note}</div>` : ''}
          </div>
        `;
      });
    }

    dayCard.innerHTML = `
      <div style="font-weight: 800; font-size: 1rem; color: var(--text-main); border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem;">
        ${day.name}
      </div>
      ${shiftsHtml}
    `;

    grid.appendChild(dayCard);
  });
}
