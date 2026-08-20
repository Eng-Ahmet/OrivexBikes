import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 1000px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 p-md-5 shadow-sm">
        <!-- Header & Nav Tabs -->
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary gap-3">
          <div>
            <span class="badge bg-primary text-white px-3 py-2 rounded-pill mb-2 shadow-sm">
              <i class="fa-solid fa-user-shield me-1"></i> Protección de Datos Personales
            </span>
            <h1 class="fw-extrabold text-white font-heading mb-1">POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h1>
            <p class="text-secondary small mb-0">Normativa Española y Europea | RGPD (UE 2016/679) & LOPDGDD 3/2018 | LSSI-CE 34/2002</p>
          </div>

          <div class="btn-group rounded-pill p-1 bg-secondary bg-opacity-20 border border-secondary">
            <a routerLink="/privacy" class="btn btn-sm btn-primary rounded-pill text-white">
              <i class="fa-solid fa-user-shield me-1"></i> Privacidad (GDPR)
            </a>
            <a routerLink="/terms" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-file-contract me-1"></i> Condición Contrato
            </a>
            <a routerLink="/rental-terms" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-lock me-1"></i> Seguridad Interna
            </a>
          </div>
        </div>

        <!-- PRIVACY CONTENT -->
        <div class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-primary border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-shield-halved text-primary me-2"></i> POLÍTICA DE PRIVACIDAD (RGPD / LOPDGDD)</h5>
            <span class="small text-secondary">Responsable del Tratamiento: QQBikes Málaga S.L. | CIF: B-93000000 | Paseo Marítimo 42, 29016 Málaga | Email: privacy&#64;qqbikes.es</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Responsable del Tratamiento</h5>
          <p>
            El responsable del tratamiento de los datos personales recopilados a través de esta plataforma es <strong>QQBikes Málaga S.L.</strong> en cumplimiento estricto del Reglamento General de Protección de Datos (RGPD UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD).
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Categorías de Datos Objeto de Tratamiento</h5>
          <ul class="list-unstyled ps-3">
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos Identificativos:</strong> Nombre, apellidos, documento oficial de identidad (DNI, NIE o Pasaporte), firma digital y fotografía del estado pre/post alquiler.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Contacto:</strong> Teléfono de contacto (WhatsApp) y correo electrónico oficial para notificación de confirmación de reserva y vouchers.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Pago:</strong> Identificador de transacción y tokenización mediante pasarela segura Redsys/Stripe PCI-DSS Nivel 1. QQBikes <strong>no almacena números completos de tarjeta ni CVC</strong>.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Localización GPS:</strong> Datos de geolocalización únicamente activados para seguridad, asistencia técnica y recuperación de flota en caso de robo, conforme a las recomendaciones de la AEPD.</li>
          </ul>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Finalidades y Bases Jurídicas</h5>
          <p>
            El tratamiento de datos se fundamenta en la <strong>ejecución del contrato de alquiler</strong> (Art. 6.1.b RGPD), el <strong>cumplimiento de obligaciones legales y tributarias</strong> (Art. 6.1.c RGPD) y el <strong>interés legítimo</strong> en la prevención del fraude y seguridad de los bienes (Art. 6.1.f RGPD).
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">4. Fotografías e Imagen Promocional Independiente</h5>
          <p>
            La captura y publicación de fotografías promocionales o en redes sociales requiere una <strong>autorización previa, explícita y separada</strong> del cliente. La negativa a conceder dicha autorización no condicionará ni afectará en modo alguno la prestación del servicio de alquiler.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">5. Ejercicio de Derechos</h5>
          <p>
            El cliente puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando una comunicación formal a <strong class="text-white">privacy&#64;qqbikes.es</strong> o presentando una reclamación ante la Agencia Española de Protección de Datos (AEPD).
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="mt-5 pt-3 border-top border-secondary d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span class="text-secondary small"><i class="fa-solid fa-circle-check text-success me-1"></i> Documento Oficial RGPD / LOPDGDD</span>
          <div class="d-flex gap-2">
            <a routerLink="/book" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
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
export class PrivacyPolicyPageComponent {}
