import { t } from '../i18n.js';

export async function renderTariffsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-tags text-info me-2"></i> ${t('tariffs_title')}</h2>
        <p class="text-secondary small mb-0">Official 11-column fleet pricing table for all rental vehicles and durations.</p>
      </div>
    </div>

    <!-- Official 11-Column Fleet Tariff Table -->
    <div class="card-glass p-3 mb-4 shadow-sm">
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0 text-center" style="font-size: 0.8rem;">
          <thead class="table-dark text-secondary align-middle">
            <tr>
              <th scope="col" class="text-start">Vehicle Category</th>
              <th scope="col">Depósito</th>
              <th scope="col">20 min</th>
              <th scope="col">30 min</th>
              <th scope="col">1 hora</th>
              <th scope="col">2 horas</th>
              <th scope="col">5 horas</th>
              <th scope="col">1 día</th>
              <th scope="col">+3 días</th>
              <th scope="col">+1 semana</th>
              <th scope="col">+2 semanas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-bicycle me-1"></i> Bikes</td>
              <td class="text-warning fw-semibold">30 €</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold">5 €</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold">15 €</td>
              <td class="fw-semibold text-success">20 €</td>
              <td class="fw-semibold">15 €/día</td>
              <td class="fw-semibold">10 €/día</td>
              <td class="fw-semibold text-info">8 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-bolt me-1"></i> E-Bikes (VISA)</td>
              <td class="text-warning fw-semibold">100 €</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold">15 €</td>
              <td class="fw-semibold">20 €</td>
              <td class="fw-semibold">25 €</td>
              <td class="fw-semibold text-success">40 €</td>
              <td class="fw-semibold">30 €/día</td>
              <td class="fw-semibold">25 €/día</td>
              <td class="fw-semibold text-info">20 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-bolt-lightning me-1"></i> Scooters</td>
              <td class="text-warning fw-semibold">50 €</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold">10 €</td>
              <td class="fw-semibold">15 €</td>
              <td class="fw-semibold">20 €</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold text-success">40 €</td>
              <td class="fw-semibold">30 €/día</td>
              <td class="fw-semibold">25 €/día</td>
              <td class="fw-semibold text-info">20 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-car me-1"></i> XL Cars & Jeep</td>
              <td class="text-warning fw-semibold">20 €</td>
              <td class="fw-semibold">15 €</td>
              <td class="fw-semibold">20 €</td>
              <td class="fw-semibold">30 €</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-car-side me-1"></i> Quads & S Cars</td>
              <td class="text-warning fw-semibold">20 €</td>
              <td class="fw-semibold">10 €</td>
              <td class="fw-semibold">15 €</td>
              <td class="fw-semibold">25 €</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-info"><i class="fa-solid fa-truck-monster me-1"></i> Buggys</td>
              <td class="text-warning fw-semibold">20 €</td>
              <td class="text-secondary">—</td>
              <td class="fw-semibold">5 €</td>
              <td class="fw-semibold">25 €</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
              <td class="text-secondary">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
