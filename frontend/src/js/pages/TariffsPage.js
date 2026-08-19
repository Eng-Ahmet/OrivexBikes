export async function renderTariffsPage(container) {
  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">🏷️ Official Vehicle Rental Price Tariffs (جدول الأسعار الرسمي)</h2>
        <p class="text-secondary small mb-0">Official 11-column rental tariff matrix across all vehicle categories and duration tiers</p>
      </div>
    </div>

    <!-- Official 11-Column Tariff Matrix Table -->
    <div class="card-glass p-3 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-dark table-hover table-bordered border-secondary align-middle mb-0 text-center" style="font-size: 0.85rem;">
          <thead class="table-dark text-secondary">
            <tr>
              <th scope="col" class="text-start">Vehículo (Category)</th>
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
              <td class="text-start fw-bold text-light">Bikes (Bicycles)</td>
              <td class="text-warning fw-bold">30 €</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-info">5 €</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-light">15 €</td>
              <td class="fw-bold text-success">20 €</td>
              <td class="text-light">15 €/día</td>
              <td class="text-light">10 €/día</td>
              <td class="text-light">8 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-light">E-Bikes (VISA)</td>
              <td class="text-warning fw-bold">100 €</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-info">15 €</td>
              <td class="fw-bold text-light">20 €</td>
              <td class="fw-bold text-light">25 €</td>
              <td class="fw-bold text-success">40 €</td>
              <td class="text-light">30 €/día</td>
              <td class="text-light">25 €/día</td>
              <td class="text-light">20 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-light">Scooters (E-Scooters)</td>
              <td class="text-warning fw-bold">50 €</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-light">10 €</td>
              <td class="fw-bold text-info">15 €</td>
              <td class="fw-bold text-light">20 €</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-success">40 €</td>
              <td class="text-light">30 €/día</td>
              <td class="text-light">25 €/día</td>
              <td class="text-light">20 €/día</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-light">XL Cars & Jeep</td>
              <td class="text-warning fw-bold">20 €</td>
              <td class="fw-bold text-light">15 €</td>
              <td class="fw-bold text-light">20 €</td>
              <td class="fw-bold text-info">30 €</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-light">S cars/Quads</td>
              <td class="text-warning fw-bold">20 €</td>
              <td class="fw-bold text-light">10 €</td>
              <td class="fw-bold text-light">15 €</td>
              <td class="fw-bold text-info">25 €</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
            </tr>
            <tr>
              <td class="text-start fw-bold text-light">Buggy's</td>
              <td class="text-warning fw-bold">20 €</td>
              <td class="text-muted">—</td>
              <td class="fw-bold text-light">5 €</td>
              <td class="fw-bold text-info">25 €</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
              <td class="text-muted">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
