import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { I18nService } from '../../core/services/i18n.service';

export interface XiaomiPart {
  id: number;
  name: string;
  part_price: number;
  labor_price: number;
  total_price: number;
}

export interface BikeServiceItem {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-repairs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-dark bg-gradient border-secondary-subtle rounded-4 p-4 shadow-sm" style="background: #0f172a !important;">
      <!-- Page Header & Action Bar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 text-info p-3 rounded-3 border border-info border-opacity-25">
            <i class="fa-solid fa-wrench fs-3 text-info"></i>
          </div>
          <div>
            <h3 class="fw-extrabold mb-0 font-heading text-white tracking-tight">{{ i18n.t('repairs') }} & Workshop POS</h3>
            <p class="text-secondary small mb-0">Xiaomi m365 / Pro spare parts, bicycle repair catalog, hourly labor rates & custom PVP calculator</p>
          </div>
        </div>

        <button class="btn btn-primary btn-lg rounded-pill px-4 shadow-sm fw-bold text-white" (click)="showNewOrderForm = !showNewOrderForm">
          <i class="fa-solid fa-plus me-2 text-white"></i> New Repair Order
        </button>
      </div>

      <!-- New Work Order Form -->
      @if (showNewOrderForm) {
        <div class="card bg-dark border border-info rounded-4 p-4 mb-4 shadow-lg">
          <h5 class="fw-bold text-info mb-3"><i class="fa-solid fa-screwdriver-wrench me-2"></i> Create Workshop Work Order</h5>
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label class="form-label text-secondary small">Customer Name</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="newOrder.customer_name" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label text-secondary small">Phone Number</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" [(ngModel)]="newOrder.customer_phone" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label text-secondary small">Vehicle Model / Code</label>
              <input type="text" class="form-control bg-dark text-light border-secondary" placeholder="e.g. Xiaomi m365 Pro #02" [(ngModel)]="newOrder.vehicle_description" />
            </div>
            <div class="col-12">
              <label class="form-label text-secondary small">Issue Description</label>
              <textarea class="form-control bg-dark text-light border-secondary" rows="2" placeholder="Brake adjustment, flat tire, BMS replacement..." [(ngModel)]="newOrder.issue_description"></textarea>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill text-white" (click)="showNewOrderForm = false">Cancel</button>
            <button class="btn btn-info btn-sm rounded-pill px-4 fw-bold text-white" (click)="createWorkOrder()">Save Work Order</button>
          </div>
        </div>
      }

      <!-- Navigation Tabs for Workshop Sections -->
      <ul class="nav nav-pills gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <li class="nav-item">
          <button class="btn btn-sm rounded-pill px-3 text-white" [class.btn-info]="activeTab === 'orders'" [class.btn-outline-secondary]="activeTab !== 'orders'" (click)="activeTab = 'orders'">
            <i class="fa-solid fa-clipboard-list me-1 text-white"></i> Órdenes de Trabajo
          </button>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm rounded-pill px-3 text-white" [class.btn-info]="activeTab === 'parts'" [class.btn-outline-secondary]="activeTab !== 'parts'" (click)="activeTab = 'parts'">
            <i class="fa-solid fa-bolt-lightning me-1 text-white"></i> Catálogo Xiaomi m365 / Pro (29 Piezas)
          </button>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm rounded-pill px-3 text-white" [class.btn-info]="activeTab === 'services'" [class.btn-outline-secondary]="activeTab !== 'services'" (click)="activeTab = 'services'">
            <i class="fa-solid fa-bicycle me-1 text-white"></i> Servicios Bici & Tarifas Mano de Obra
          </button>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm rounded-pill px-3 text-white" [class.btn-info]="activeTab === 'calculator'" [class.btn-outline-secondary]="activeTab !== 'calculator'" (click)="activeTab = 'calculator'">
            <i class="fa-solid fa-calculator me-1 text-white"></i> Calculadora PVP Recambios
          </button>
        </li>
      </ul>

      <!-- TAB 1: WORK ORDERS -->
      @if (activeTab === 'orders') {
        @if (loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-info" role="status"></div>
          </div>
        } @else if (workOrders().length === 0) {
          <div class="text-center py-5 border border-secondary border-dashed rounded-4">
            <i class="fa-solid fa-wrench fa-3x text-secondary mb-3 opacity-50"></i>
            <h5 class="text-secondary">No active workshop repair orders</h5>
          </div>
        } @else {
          <div class="row g-4">
            @for (wo of workOrders(); track wo.id) {
              <div class="col-12 col-md-6 col-xl-4">
                <div class="card border rounded-4 p-4 h-100 shadow-sm transition d-flex flex-column" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold text-info font-mono">Order #{{ wo.id }}</span>
                    <span class="badge rounded-pill px-3 py-1 text-white fw-bold"
                          [class.bg-warning]="wo.status !== 'DELIVERED_PAID'"
                          [class.bg-success]="wo.status === 'DELIVERED_PAID'">
                      <i class="fa-solid me-1" [class.fa-wrench]="wo.status !== 'DELIVERED_PAID'" [class.fa-lock]="wo.status === 'DELIVERED_PAID'"></i>
                      {{ wo.status === 'DELIVERED_PAID' ? 'Paid & Locked' : wo.status }}
                    </span>
                  </div>

                  <h5 class="fw-bold text-white mb-1 font-heading">{{ wo.customer_name || 'Store Vehicle Maintenance' }}</h5>
                  <p class="text-secondary small mb-2"><i class="fa-solid fa-bicycle text-info me-1"></i> {{ wo.vehicle_description || wo.vehicle_id || 'Unit #01' }}</p>

                  <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 small mb-3">
                    <p class="text-secondary mb-2"><strong>Issue:</strong> {{ wo.issue_description || 'General tune-up and brake check' }}</p>
                    <div class="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-1">
                      <span class="text-secondary">Repair Fee Total:</span>
                      <strong class="text-success fs-6">€{{ wo.total_cost || wo.estimated_cost || 35 }}</strong>
                    </div>
                  </div>

                  @if (wo.status === 'DELIVERED_PAID') {
                    <div class="badge bg-success bg-opacity-20 text-white border border-success border-opacity-50 py-2 rounded-pill text-center mt-auto fw-bold">
                      <i class="fa-solid fa-circle-check me-1 text-white"></i> Paid & Delivered (Status Locked)
                    </div>
                  } @else {
                    <button class="btn btn-success btn-sm rounded-pill mt-auto shadow-sm text-white fw-bold py-2" (click)="confirmPaymentAndLock(wo.id)">
                      <i class="fa-solid fa-lock me-1 text-white"></i> Confirm Payment & Deliver Order
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- TAB 2: XIAOMI SPARE PARTS CATALOG (29 Items) -->
      @if (activeTab === 'parts') {
        <div class="card border rounded-4 p-4 shadow-sm" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom border-secondary border-opacity-25 pb-2">
            <h5 class="fw-bold text-white mb-0 font-heading"><i class="fa-solid fa-bolt-lightning text-warning me-2"></i> Xiaomi m365 / m365 Pro Spare Parts & Labor Matrix</h5>
            <div class="input-group input-group-sm" style="max-width: 300px;">
              <input type="text" class="form-control bg-dark text-light border-secondary rounded-start-pill px-3" placeholder="Search spare part name..." [(ngModel)]="searchPartQuery" />
              <button class="btn btn-outline-info rounded-end-pill px-3 text-white"><i class="fa-solid fa-magnifying-glass text-white"></i></button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-dark table-hover align-middle mb-0 small border-secondary">
              <thead>
                <tr class="text-secondary text-uppercase" style="font-size: 0.75rem;">
                  <th>Nombre de la Pieza / Recambio</th>
                  <th class="text-end">PVP Repuesto</th>
                  <th class="text-end">PVP Mano de Obra</th>
                  <th class="text-end">PVP Total Recambio + Instalación</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filteredParts(); track p.id) {
                  <tr>
                    <td class="fw-semibold text-white"><i class="fa-solid fa-gear me-2 text-info"></i> {{ p.name }}</td>
                    <td class="text-end fw-bold text-warning">€{{ p.part_price.toFixed(2) }}</td>
                    <td class="text-end fw-bold text-info">€{{ p.labor_price.toFixed(2) }}</td>
                    <td class="text-end fw-extrabold text-success fs-6">€{{ p.total_price.toFixed(2) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: BICYCLE SERVICES & LABOR RATES -->
      @if (activeTab === 'services') {
        <div class="row g-4">
          <!-- Hourly Labor Rates Card -->
          <div class="col-12 col-md-5">
            <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-stopwatch me-2 text-warning"></i> Tarifas de Mano de Obra por Hora</h5>

              <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25 mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-semibold text-light"><i class="fa-solid fa-wrench me-2 text-info"></i> Reparaciones Mecánicas</span>
                  <strong class="text-success fs-5">15,00 € / hora</strong>
                </div>
                <p class="text-secondary small mb-0">Ajustes de frenos, cambios de cámara, centrado de ruedas y mecánica general.</p>
              </div>

              <div class="bg-dark bg-opacity-80 p-3 rounded-3 border border-secondary border-opacity-25">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-semibold text-light"><i class="fa-solid fa-bolt me-2 text-warning"></i> Reparaciones Eléctricas</span>
                  <strong class="text-warning fs-5">25,00 € / hora</strong>
                </div>
                <p class="text-secondary small mb-0">Diagnóstico de batería, sustitución de controladoras V3, placas BMS y cableado de motor.</p>
              </div>
            </div>
          </div>

          <!-- Bicycle Services List -->
          <div class="col-12 col-md-7">
            <div class="card border rounded-4 p-4 shadow-sm h-100" style="background: #161e2e !important; border-color: rgba(255,255,255,0.08) !important;">
              <h5 class="fw-bold text-white mb-3 font-heading"><i class="fa-solid fa-bicycle me-2 text-primary"></i> Precios Servicios Reparación Bicicletas</h5>

              <div class="table-responsive">
                <table class="table table-dark table-hover align-middle mb-0 small">
                  <thead>
                    <tr class="text-secondary text-uppercase" style="font-size: 0.75rem;">
                      <th>Servicio de Taller</th>
                      <th class="text-end">PVP Servicio (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of bikeServices; track s.id) {
                      <tr>
                        <td class="fw-semibold text-white"><i class="fa-solid fa-check text-success me-2"></i> {{ s.name }}</td>
                        <td class="text-end fw-bold text-success fs-6">€{{ s.price.toFixed(2) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: DYNAMIC CUSTOM PART PVP CALCULATOR -->
      @if (activeTab === 'calculator') {
        <div class="card border rounded-4 p-4 shadow-sm" style="background: #161e2e !important; border-color: rgba(56,189,248,0.2) !important;">
          <h5 class="fw-bold text-info mb-2 font-heading"><i class="fa-solid fa-calculator me-2"></i> Calculadora Oficial de Precios PVP para Recambios No Catalogados</h5>
          <p class="text-secondary small mb-4">
            Ecuación de cálculo: <strong>PVP = Coste para la empresa del recambio × 1,21 × 2,20 + Mano de obra</strong> (Equivalente a Coste × 2,662 + Mano de obra)
          </p>

          <div class="row g-4">
            <div class="col-12 col-md-6">
              <div class="mb-3">
                <label class="form-label text-white fw-semibold">Coste para la Empresa del Recambio (€)</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark text-light border-secondary">€</span>
                  <input type="number" step="0.01" class="form-control bg-dark text-light border-secondary fw-bold" placeholder="Ingresa coste de compra..." [(ngModel)]="calcCost" (ngModelChange)="calculateCustomPvp()" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label text-white fw-semibold">Mano de Obra Aplicable (€)</label>
                <select class="form-select bg-dark text-light border-secondary" [(ngModel)]="calcLaborRate" (change)="calculateCustomPvp()">
                  <option [value]="15">Mecánica Estándar (15,00 €)</option>
                  <option [value]="25">Mano de Obra Eléctrica (25,00 €)</option>
                  <option [value]="35">Instalación Compleja (35,00 €)</option>
                  <option [value]="50">Instalación Motor / Batería (50,00 €)</option>
                </select>
              </div>
            </div>

            <div class="col-12 col-md-6 d-flex align-items-center">
              <div class="bg-dark bg-opacity-90 p-4 rounded-4 border border-info border-opacity-50 w-100 text-center shadow-lg">
                <span class="text-secondary small d-block mb-1 text-uppercase tracking-wider">Precio Final PVP Calculado</span>
                <h1 class="fw-extrabold text-success my-2 font-heading" style="font-size: 2.75rem;">€{{ calculatedPvp.toFixed(2) }}</h1>
                <div class="text-muted small mt-2">
                  Breakdown: Recambio Base Con Margen (Coste × 2.662) = €{{ (calcCost * 2.662).toFixed(2) }} + Mano de obra €{{ calcLaborRate.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RepairsPageComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  i18n = inject(I18nService);

  activeTab: 'orders' | 'parts' | 'services' | 'calculator' = 'orders';
  showNewOrderForm = false;
  searchPartQuery = '';

  workOrders = signal<any[]>([]);
  loading = signal<boolean>(true);

  calcCost = 20.00;
  calcLaborRate = 25.00;
  calculatedPvp = 0;

  newOrder = {
    customer_name: '',
    customer_phone: '',
    vehicle_description: '',
    issue_description: ''
  };

  xiaomiParts: XiaomiPart[] = [
    { id: 1, name: 'Cubierta maciza agujereada 8,5"', part_price: 18.00, labor_price: 35.00, total_price: 53.00 },
    { id: 2, name: 'Cubierta normal Xiaomi 8,5" (cámara no incluida)', part_price: 15.00, labor_price: 30.00, total_price: 45.00 },
    { id: 3, name: 'Cubierta normal Xiaomi 8,5" (cámara incluida)', part_price: 20.00, labor_price: 35.00, total_price: 55.00 },
    { id: 4, name: 'Cámara 8,5 Xiaomi Reforzada', part_price: 10.00, labor_price: 25.00, total_price: 35.00 },
    { id: 5, name: 'Kit 10" para Xiaomi', part_price: 50.00, labor_price: 70.00, total_price: 120.00 },
    { id: 6, name: 'Llanta reforzada para Xiaomi', part_price: 10.00, labor_price: 30.00, total_price: 40.00 },
    { id: 7, name: 'Caballete para Xiaomi', part_price: 7.00, labor_price: 15.00, total_price: 22.00 },
    { id: 8, name: 'Disco freno para Xiaomi 110mm', part_price: 10.00, labor_price: 25.00, total_price: 35.00 },
    { id: 9, name: 'Disco freno para Xiaomi 120mm', part_price: 7.00, labor_price: 20.00, total_price: 27.00 },
    { id: 10, name: 'Disco freno para Xiaomi 135mm', part_price: 20.00, labor_price: 35.00, total_price: 55.00 }
  ];

  bikeServices: BikeServiceItem[] = [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00 },
    { id: 2, name: 'Revisión básica', price: 10.00 },
    { id: 3, name: 'Revisión completa', price: 15.00 },
    { id: 4, name: 'Arreglo/ajuste express', price: 5.00 },
    { id: 5, name: 'Pinchazo e-bike', price: 12.00 }
  ];

  async ngOnInit() {
    this.calculateCustomPvp();
    await this.loadWorkOrders();
  }

  calculateCustomPvp() {
    const cost = Number(this.calcCost) || 0;
    const labor = Number(this.calcLaborRate) || 0;
    this.calculatedPvp = (cost * 1.21 * 2.20) + labor;
  }

  filteredParts(): XiaomiPart[] {
    if (!this.searchPartQuery.trim()) return this.xiaomiParts;
    const q = this.searchPartQuery.toLowerCase();
    return this.xiaomiParts.filter(p => p.name.toLowerCase().includes(q));
  }

  async loadWorkOrders() {
    this.loading.set(true);
    try {
      const orders = await this.api.getRepairWorkOrders();
      this.workOrders.set(orders && orders.length ? orders : []);
    } catch (err) {
      this.state.showToast('Error', 'Could not load workshop orders', 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  async createWorkOrder() {
    try {
      await this.api.createRepairWorkOrder(this.newOrder);
      this.state.showToast('Order Created', 'Work order registered successfully', 'success');
      this.showNewOrderForm = false;
      this.newOrder = { customer_name: '', customer_phone: '', vehicle_description: '', issue_description: '' };
      await this.loadWorkOrders();
    } catch (err) {
      this.state.showToast('Error', 'Failed to create work order', 'danger');
    }
  }

  async confirmPaymentAndLock(id: number) {
    try {
      await this.api.updateRepairWorkOrderStatus(id, 'DELIVERED_PAID');
      this.state.showToast('Payment Confirmed', `Work Order #${id} paid & locked permanently`, 'success');
      await this.loadWorkOrders();
    } catch (err: any) {
      this.state.showToast('Locked Status', err?.error?.error || 'Order status is locked and cannot be changed', 'warning');
    }
  }
}
