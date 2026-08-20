import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-security-policy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" style="max-width: 1000px;">
      <div class="card bg-dark border-secondary-subtle rounded-4 p-4 p-md-5 shadow-sm">
        <!-- Header & Nav Tabs -->
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary gap-3">
          <div>
            <span class="badge bg-success text-white px-3 py-2 rounded-pill mb-2 shadow-sm">
              <i class="fa-solid fa-lock me-1"></i> Seguridad y Auditoría
            </span>
            <h1 class="fw-extrabold text-white font-heading mb-1">POLÍTICA INTERNA DE PROTECCIÓN Y SEGURIDAD DE DATOS</h1>
            <p class="text-secondary small mb-0">Protocolos de Control de Acceso, Cifrado y Auditoría de Información | QQBikes Málaga S.L.</p>
          </div>

          <div class="btn-group rounded-pill p-1 bg-secondary bg-opacity-20 border border-secondary">
            <a routerLink="/privacy" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-user-shield me-1"></i> Privacidad (GDPR)
            </a>
            <a routerLink="/terms" class="btn btn-sm btn-dark rounded-pill text-white">
              <i class="fa-solid fa-file-contract me-1"></i> Condición Contrato
            </a>
            <a routerLink="/rental-terms" class="btn btn-sm btn-success rounded-pill text-white fw-bold">
              <i class="fa-solid fa-lock me-1"></i> Seguridad Interna
            </a>
          </div>
        </div>

        <!-- SECURITY CONTENT -->
        <div class="text-secondary leading-relaxed">
          <div class="alert alert-dark border-success border-opacity-50 text-light rounded-4 p-3 mb-4">
            <h5 class="fw-bold text-white mb-1"><i class="fa-solid fa-shield-halved text-success me-2"></i> POLÍTICA INTERNA DE SEGURIDAD Y PROTECCIÓN DE DATOS</h5>
            <span class="small text-secondary">Normas de acceso restringido, cifrado de identidad, control de auditoría y gestión de incidentes.</span>
          </div>

          <h5 class="fw-bold text-white mb-2">1. Principio de Mínimo Acceso y Roles (RBAC)</h5>
          <p>
            Cada perfil en QQBikes (Administrador vs. Empleado de mostrador) dispone de permisos estrictamente delimitados a las funciones de su puesto. Los empleados de mostrador sólo pueden crear reservas, verificar contratos y registrar entregas o devoluciones. No se permite la descarga masiva de bases de datos de clientes ni el acceso a configuraciones críticas.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">2. Protección de Documentos de Identidad</h5>
          <p>
            Los documentos oficiales de identidad (DNI, NIE o Pasaporte) requeridos para el contrato de alquiler son almacenados de forma cifrada en la base de datos y aislados de las APIs públicas. QQBikes prohíbe expresamente el envío de copias de documentos mediante canales de mensajería no seguros o almacenamiento en dispositivos personales.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">3. Tokenización y Datos de Tarjetas Bancarias</h5>
          <p>
            Los datos bancarios de clientes son procesados directamente por pasarelas de pago certificadas bajo la norma PCI-DSS Nivel 1. La aplicación almacena únicamente tokens de operación, ID de transacción e importe sin acceder a números de tarjeta ni códigos CVC/CVV.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">4. Registro de Auditoría (Audit Trails)</h5>
          <p>
            El sistema genera registros inmutables de auditoría para cada transacción crítica: apertura y cierre de contratos, cobro o liberación de fianzas, modificaciones de estado de vehículos, aprobación de reseñas y gestión de tickets de soporte, incluyendo identificación del operador, timestamp y código de firma.
          </p>

          <h5 class="fw-bold text-white mb-2 mt-4">5. Gestión de Incidentes y Brechas de Seguridad</h5>
          <p>
            Ante cualquier sospecha de brecha o acceso no autorizado a datos personales, el personal notificará inmediatamente al equipo de seguridad de QQBikes para iniciar el protocolo de contención, evaluación de riesgo y notificación a la Agencia Española de Protección de Datos (AEPD) en el plazo legal de 72 horas.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="mt-5 pt-3 border-top border-secondary d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span class="text-secondary small"><i class="fa-solid fa-circle-check text-success me-1"></i> Protocolos de Seguridad Verificados</span>
          <div class="d-flex gap-2">
            <a routerLink="/book" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm">
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
export class SecurityPolicyPageComponent {}
