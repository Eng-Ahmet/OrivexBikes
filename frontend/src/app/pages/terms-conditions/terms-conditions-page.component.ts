import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-conditions-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 1000px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 p-md-5 shadow-sm">
        <!-- Header & Nav Tabs -->
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary gap-3">
          <div>
            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2 shadow-sm fw-bold">
              <i class="fa-solid fa-file-contract me-1"></i> Contrato de Alquiler
            </span>
            <h1 class="fw-extrabold text-white font-heading mb-1">CONDICIONES GENERALES DEL CONTRATO DE ALQUILER</h1>
            <p class="text-secondary small mb-0">Normativa Española de Consumidores y Usuarios | QQBikes Málaga S.L.</p>
          </div>

          <div class="btn-group rounded-pill p-1 bg-secondary bg-opacity-20 border border-secondary">
            <a routerLink="/privacy" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-user-shield me-1"></i> Privacidad (GDPR)
            </a>
            <a routerLink="/terms" class="btn btn-sm btn-warning text-dark fw-bold rounded-pill">
              <i class="fa-solid fa-file-contract me-1"></i> Condición Contrato
            </a>
            <a routerLink="/rental-terms" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-lock me-1"></i> Seguridad Interna
            </a>
          </div>
        </div>

        <!-- TERMS CONTENT -->
        <div class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-warning border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-bicycle text-warning me-2"></i> CONDICIONES DE CONTRATACIÓN Y USO DE VEHÍCULOS</h5>
            <span class="small text-secondary">Aceptación previa obligatoria para alquiler de bicicletas convencionales, e-bikes y patinetes eléctricos.</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Objeto y Capacidad Legal</h5>
          <p>
            Las presentes condiciones regulan el alquiler temporal de bicicletas urbanas, bicicletas eléctricas (E-Bikes) y patinetes eléctricos. El usuario declara ser mayor de 16 años para patinetes eléctricos y 14 años para bicicletas, disponer de capacidad legal suficiente y utilizar la unidad conforme al Código de Tráfico de España.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Horarios y Suplemento por Retraso</h5>
          <p>
            La devolución del vehículo debe realizarse en el establecimiento y hora pactados. En caso de retraso sin comunicación previa, se aplicará un suplemento previamente informado de <strong>10 € por cada hora o fracción</strong>. La no devolución el día contratado se considerará prolongación no autorizada con responsabilidad por costes de recuperación e indemnizaciones legalmente exigibles.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Estado del Vehículo y Fianza de Garantía</h5>
          <p>
            El cliente revisará el vehículo antes de iniciar la marcha. Se requerirá una fianza o preautorización bancaria para garantizar el correcto uso de los equipos. La fianza será devuelta o liberada íntegramente tras comprobar el estado del vehículo sin daños derivados de uso negligente.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">4. Tarifas Máximas de Referencia por Pérdida o Destrucción</h5>
          <p>
            En caso de sustracción, robo o pérdida del vehículo por imprudencia del arrendatario, se fijan los siguientes importes de referencia para reposición de unidades:
          </p>
          <ul class="list-unstyled ps-3">
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Bicicleta Convencional: hasta 300 €</li>
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Patinete Eléctrico: hasta 600 €</li>
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Bicicleta Eléctrica (E-Bike): hasta 1.200 €</li>
          </ul>

          <h5 class="fw-bold text-white mb-2 mt-4">5. Prohibiciones y Normas de Tráfico</h5>
          <p>
            Queda prohibido conducir bajo los efectos del alcohol, drogas o medicamentos, transportar pasajeros no autorizados o manipular el motor y la batería. El arrendatario es responsable directo de las sanciones administrativas o multas de tráfico impuestas durante el alquiler.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="mt-5 pt-3 border-top border-secondary d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span class="text-secondary small"><i class="fa-solid fa-circle-check text-warning me-1"></i> Condiciones Validadas para Consumidores en España</span>
          <div class="d-flex gap-2">
            <a routerLink="/book" class="btn btn-warning text-dark fw-bold rounded-pill px-4 shadow-sm">
              <i class="fa-solid fa-calendar-check me-1"></i> Proceed to Online Booking
            </a>
            <a routerLink="/home" class="btn btn-outline-light rounded-pill px-4">
              <i class="fa-solid fa-house me-1"></i> Home Page
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TermsConditionsPageComponent {}
