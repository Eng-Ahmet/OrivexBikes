import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-public-policies-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 1000px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 p-md-5 shadow-sm">
        <!-- Header & Nav Tabs -->
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary gap-3">
          <div>
            <span class="badge bg-primary text-white px-3 py-2 rounded-pill mb-2 shadow-sm">
              <i class="fa-solid fa-scale-balanced me-1"></i> Legal Compliance & Protection
            </span>
            <h1 class="fw-extrabold text-white font-heading mb-1">{{ title }}</h1>
            <p class="text-secondary small mb-0">Normativa Española y Europea | RGPD (UE 2016/679) & LOPDGDD 3/2018 | LSSI-CE 34/2002</p>
          </div>

          <div class="btn-group rounded-pill p-1 bg-secondary bg-opacity-20 border border-secondary">
            <a routerLink="/privacy" class="btn btn-sm rounded-pill text-white" [class.btn-primary]="policyType === 'privacy'" [class.btn-dark]="policyType !== 'privacy'">
              <i class="fa-solid fa-user-shield me-1"></i> Privacidad (GDPR)
            </a>
            <a routerLink="/terms" class="btn btn-sm rounded-pill text-white" [class.btn-primary]="policyType === 'terms'" [class.btn-dark]="policyType !== 'terms'">
              <i class="fa-solid fa-file-contract me-1"></i> Condición Contrato
            </a>
            <a routerLink="/rental-terms" class="btn btn-sm rounded-pill text-white" [class.btn-primary]="policyType === 'rental-terms'" [class.btn-dark]="policyType !== 'rental-terms'">
              <i class="fa-solid fa-lock me-1"></i> Seguridad Interna
            </a>
          </div>
        </div>

        <!-- SECTION 1: PRIVACY POLICY (POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS) -->
        <div *ngIf="policyType === 'privacy'" class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-primary border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-shield-halved text-primary me-2"></i> POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h5>
            <span class="small text-secondary">Responsable del tratamiento: QQBikes Málaga S.L. | CIF: B-93000000 | Paseo Marítimo 42, 29016 Málaga</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Objeto y Marco Normativo</h5>
          <p>
            La presente Política de Privacidad tiene por objeto informar a los clientes y usuarios sobre la forma en que QQBikes Málaga S.L. recopila, utiliza, conserva y protege sus datos personales, en estricto cumplimiento con el <strong>Reglamento (UE) 2016/679 (RGPD)</strong>, la <strong>Ley Orgánica 3/2018 (LOPDGDD)</strong> y la <strong>Ley 34/2002 (LSSI-CE)</strong>.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Principios del Tratamiento de Datos</h5>
          <p>
            El tratamiento de datos personales se rige por los principios de licitud, lealtad, transparencia, minimización de datos, exactitud, limitación del plazo de conservación, integridad y confidencialidad. No se solicitarán datos personales innecesarios para la prestación del servicio.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Categorías de Datos Tratados</h5>
          <ul class="list-unstyled ps-3">
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos Identificativos:</strong> Nombre, apellidos, DNI/NIE/Pasaporte, firma y documento oficial para la elaboración del contrato de alquiler.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Contacto:</strong> Teléfono de contacto (WhatsApp) y correo electrónico para confirmación de reserva y recepción de voucher.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Alquiler y Vehículo:</strong> Número de contrato (QQB-XXXXXX), modelo de bicicleta/patinete, depósito y estado del vehículo pre/post alquiler.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Datos de Pago:</strong> Operaciones procesadas mediante pasarelas de pago seguras (Stripe/TPV Redsys tokenizados). QQBikes <strong>nunca almacena números completos de tarjeta ni códigos CVC/CVV</strong>.</li>
            <li class="mb-2"><i class="fa-solid fa-check text-primary me-2"></i> <strong>Geolocalización GPS:</strong> Exclusivamente orientada a la recuperación de vehículos sustraídos, asistencia técnica y seguridad de la flota, bajo minimización de datos según directrices AEPD.</li>
          </ul>

          <h5 class="fw-bold text-white mb-2 mt-4">4. Fotografía e Imagen Promocional Independiente</h5>
          <p>
            Cualquier captura fotográfica de clientes con fines publicitarios o en redes sociales requerirá un <strong>consentimiento previo, explícito y separado</strong>. La negativa a conceder dicho consentimiento publicitario no afectará en modo alguno a la contratación del servicio de alquiler.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">5. Derechos de los Interesados</h5>
          <p>
            El usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad dirigiéndose por escrito a <strong class="text-white">privacy&#64;qqbikes.es</strong> o ante la Agencia Española de Protección de Datos (AEPD).
          </p>
        </div>

        <!-- SECTION 2: RENTAL CONTRACT CONDITIONS (CONDICIONES DEL CONTRATO DE ALQUILER) -->
        <div *ngIf="policyType === 'terms'" class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-warning border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-file-contract text-warning me-2"></i> CONDICIONES GENERALES DEL CONTRATO DE ALQUILER</h5>
            <span class="small text-secondary">Aceptación previa vinculante para el alquiler de bicicletas convencionales, e-bikes y patinetes eléctricos.</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Objeto y Capacidad para Contratar</h5>
          <p>
            El presente contrato regula el alquiler temporal de vehículos y equipamiento de transporte urbano. El arrendatario declara ser mayor de 16 años para patinetes eléctricos y 14 años para bicicletas, disponer de capacidad legal suficiente y utilizar la unidad conforme al Código de Tráfico de España.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Horarios y Devolución con Retraso</h5>
          <p>
            El vehículo debe devolverse en el establecimiento pactado antes de la hora límite indicada en la reserva. En caso de retraso no autorizado, se aplicará un suplemento de <strong>10 € por cada hora o fracción</strong>. Si el vehículo no se devuelve el mismo día sin comunicación previa, se considerará prolongación no autorizada y se reclamarán los costes de recuperación e indemnización por daños.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Estado del Vehículo y Fianza de Garantía</h5>
          <p>
            El cliente inspeccionará el vehículo antes de iniciar la marcha. Se requerirá una preautorización bancaria o fianza en concepto de garantía. La fianza será retenida temporalmente y liberada íntegramente tras verificar la devolución del vehículo sin daños causados por uso negligente o accidentes.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">4. Robos, Pérdidas y Tarifas de Referencia de Sustitución</h5>
          <p>
            En caso de sustracción o robo, el cliente deberá notificarlo de inmediato a la empresa y presentar la correspondiente denuncia ante la Policía Nacional o Guardia Civil. Las valoraciones máximas de sustitución orientativas por pérdida total son:
          </p>
          <ul class="list-unstyled ps-3">
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Bicicleta Convencional: hasta 300 €</li>
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Patinete Eléctrico: hasta 600 €</li>
            <li class="mb-1"><i class="fa-solid fa-chevron-right text-warning me-2"></i> Bicicleta Eléctrica (E-Bike): hasta 1.200 €</li>
          </ul>

          <h5 class="fw-bold text-white mb-2 mt-4">5. Prohibición de Alcohol, Drogas y Normas de Tráfico</h5>
          <p>
            Queda estrictamente prohibido conducir bajo los efectos del alcohol, drogas o medicamentos que mermen la capacidad de conducción. El cliente es el único responsable de las sanciones o multas impuestas por las autoridades de tráfico durante el periodo de alquiler.
          </p>
        </div>

        <!-- SECTION 3: INTERNAL SECURITY POLICY (POLÍTICA INTERNA DE SEGURIDAD) -->
        <div *ngIf="policyType === 'rental-terms'" class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-success border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-lock text-success me-2"></i> POLÍTICA INTERNA DE PROTECCIÓN DE DATOS Y SEGURIDAD</h5>
            <span class="small text-secondary">Protocolos de acceso restringido, cifrado de identidad, control de auditoría y gestión de incidentes.</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Principio de Mínimo Acceso (RBAC)</h5>
          <p>
            Los empleados y operadores de tienda disponen de permisos estrictamente acotados a la creación y gestión de contratos activos. No está permitida la descarga masiva de bases de datos, consulta no autorizada de historiales financieros ni exportación externa de datos de clientes.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Protección de Documentos de Identidad y Tarjetas</h5>
          <p>
            Los documentos de identidad (DNI/Pasaportes) son cifrados en reposo en la base de datos y accesibles únicamente previa autenticación reforzada. Los datos bancarios son tokenizados mediante pasarelas con certificación PCI-DSS Nivel 1.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Registro de Auditoría (Audit Logs)</h5>
          <p>
            El sistema registra automáticamente todas las acciones administrativas (creación de contratos, cobros, devoluciones de fianza, aprobaciones de reseñas y cambios de estado de vehículos) incluyendo usuario, timestamp y firma de operación para trazabilidad completa.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="mt-5 pt-3 border-top border-secondary d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span class="text-secondary small"><i class="fa-solid fa-circle-check text-success me-1"></i> QQBikes Legal Compliance Certified</span>

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
export class PublicPoliciesPageComponent implements OnInit {
  private router = inject(Router);

  title = 'Condiciones de Servicio';
  policyType = 'terms';

  ngOnInit() {
    this.updatePolicyType();
  }

  private updatePolicyType() {
    const url = this.router.url;
    if (url.includes('privacy')) {
      this.title = 'Política de Privacidad (RGPD / LOPDGDD)';
      this.policyType = 'privacy';
    } else if (url.includes('rental-terms')) {
      this.title = 'Política Interna de Datos y Seguridad';
      this.policyType = 'rental-terms';
    } else {
      this.title = 'Condiciones del Contrato de Alquiler';
      this.policyType = 'terms';
    }
  }
}
