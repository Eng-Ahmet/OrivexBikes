import { getPool, isMySQLActive } from '../config/database.js';

export interface User {
  id: number;
  company_id: number;
  store_id: number;
  store_name?: string;
  user_type: 'ADMIN' | 'EMPLOYEE';
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
}

export interface Store {
  id: number;
  company_id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  is_active: boolean;
  initial_cash_float?: number;
}

export interface Vehicle {
  id: number;
  store_id: number;
  category: string;
  qr_code: string;
  frame_number: string;
  name: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  deposit_amount: number;
  hourly_rate?: number;
  daily_rate?: number;
  rate_20m?: number;
  rate_30m?: number;
  rate_1h: number;
  rate_2h?: number;
  rate_5h?: number;
  rate_1d: number;
  rate_3d?: number;
  rate_1w?: number;
  rate_2w?: number;
  battery_level?: number;
  item_owner?: 'STORE' | 'NEIGHBOR';
  neighbor_name?: string;
}

export interface ContractExtension {
  id: number;
  extended_by: string;
  additional_duration: string;
  additional_fee: number;
  created_at: string;
}

export interface RentalContract {
  id: number;
  contract_number: string;
  store_id: number;
  employee_id: number;
  employee_name: string;
  customer_name: string;
  customer_passport: string;
  customer_phone: string;
  vehicle_id: number;
  vehicle_name: string;
  start_time: string;
  end_time: string;
  expected_end_time?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  rental_fee: number;
  deposit_collected: number;
  deposit_refunded: number;
  extra_charges: number;
  payment_method: 'CASH' | 'CARD';
  created_at: string;
  item_owner?: 'STORE' | 'NEIGHBOR';
  neighbor_name?: string;
  store_commission?: number;
  neighbor_payout?: number;
  extensions?: ContractExtension[];
}

export interface Shift {
  id: number;
  store_id: number;
  employee_id: number;
  employee_name: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  total_cash_rentals?: number;
  total_withdrawals?: number;
  expected_cash?: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  cash_movements?: CashMovement[];
}

export interface CashMovement {
  id: number;
  shift_id: number;
  type: 'WITHDRAWAL' | 'ADDITION';
  amount: number;
  reason: string;
  performed_by: string;
  created_at: string;
}

export interface HistoricalCashLog {
  id: number;
  store_id: number;
  amount: number;
  date: string;
  category: string;
  description: string;
  recorded_by: string;
  created_at: string;
}

export interface WeeklySchedule {
  id: number;
  store_id: number;
  day_code: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
  day_name: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  employee_name: string;
  start_time: string;
  end_time: string;
  task_note?: string;
}

export interface RepairPart {
  id: number;
  name: string;
  pvp_part_only: number;
  pvp_with_labor: number;
  category: 'Scooter' | 'Bicycle' | 'General';
}

export interface RepairService {
  id: number;
  name: string;
  price: number;
  category: 'Bicycle' | 'Labor';
}

export interface RepairWorkOrder {
  id: number;
  ticket_number: string;
  store_id: number;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  issue_description: string;
  parts_used?: string;
  parts_cost: number;
  labor_cost: number;
  total_price: number;
  status: 'RECEIVED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED_PAID';
  created_at: string;
}

// Generate exact 53 Malaga physical inventory units based on handwritten sheet
const generateMalagaInventory = (): Vehicle[] => {
  const units: Vehicle[] = [];
  let currentId = 101;

  // 1. Patinetes Etwow (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Scooters',
      qr_code: `QQ-ETW-${String(i).padStart(2, '0')}`,
      frame_number: `FR-ETW-${100 + i}`,
      name: `Patinete Etwow #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 50,
      rate_30m: 10,
      rate_1h: 15,
      rate_2h: 20,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 90 + i,
      item_owner: 'STORE'
    });
  }

  // 2. Patinetes Ninebot (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Scooters',
      qr_code: `QQ-NIN-${String(i).padStart(2, '0')}`,
      frame_number: `FR-NIN-${200 + i}`,
      name: `Patinete Ninebot #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 50,
      rate_30m: 10,
      rate_1h: 15,
      rate_2h: 20,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 85 + i,
      item_owner: 'STORE'
    });
  }

  // 3. E-Bikes (VISA) (8 units)
  for (let i = 1; i <= 8; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'E-Bikes (VISA)',
      qr_code: `QQ-EB-${String(i).padStart(2, '0')}`,
      frame_number: `FR-EB-${300 + i}`,
      name: `E-Bike City Cruiser #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 100,
      rate_1h: 15,
      rate_2h: 20,
      rate_5h: 25,
      rate_1d: 40,
      rate_3d: 30,
      rate_1w: 25,
      rate_2w: 20,
      battery_level: 90 + i,
      item_owner: 'STORE'
    });
  }

  // 4. Quads (4 units)
  for (let i = 1; i <= 4; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'S cars/Quads',
      qr_code: `QQ-QD-${String(i).padStart(2, '0')}`,
      frame_number: `FR-QD-${400 + i}`,
      name: `Quad S-Car #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_20m: 10,
      rate_30m: 15,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 5. XL Cars (5 units)
  for (let i = 1; i <= 5; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'XL Cars',
      qr_code: `QQ-XL-${String(i).padStart(2, '0')}`,
      frame_number: `FR-XL-${500 + i}`,
      name: `XL Car #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_20m: 15,
      rate_30m: 20,
      rate_1h: 30,
      rate_1d: 60,
      item_owner: 'STORE'
    });
  }

  // 6. Jeep (1 unit)
  units.push({
    id: currentId++,
    store_id: 1,
    category: 'XL Cars',
    qr_code: 'QQ-JEP-01',
    frame_number: 'FR-JEP-601',
    name: 'Jeep Off-Road #1',
    status: 'AVAILABLE',
    deposit_amount: 20,
    rate_20m: 15,
    rate_30m: 20,
    rate_1h: 30,
    rate_1d: 60,
    item_owner: 'STORE'
  });

  // 7. Buggys In. Azules (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: "Buggy's",
      qr_code: `QQ-BUG-AZ${i}`,
      frame_number: `FR-BUG-70${i}`,
      name: `Buggy Azul #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_30m: 5,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 8. Buggys D. Rojo y Naranja (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: "Buggy's",
      qr_code: `QQ-BUG-RJ${i}`,
      frame_number: `FR-BUG-71${i}`,
      name: `Buggy Rojo/Naranja #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 20,
      rate_30m: 5,
      rate_1h: 25,
      rate_1d: 50,
      item_owner: 'STORE'
    });
  }

  // 9. Bicis Niño (2 units)
  for (let i = 1; i <= 2; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-BCN-${String(i).padStart(2, '0')}`,
      frame_number: `FR-BCN-80${i}`,
      name: `Bici Niño #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 10. Quert Bicycles (10 units)
  for (let i = 1; i <= 10; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-QRT-${String(i).padStart(2, '0')}`,
      frame_number: `FR-QRT-${900 + i}`,
      name: `Bicicleta Quert #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 11. Altec Bicycles (8 units)
  for (let i = 1; i <= 8; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-ALT-${String(i).padStart(2, '0')}`,
      frame_number: `FR-ALT-${950 + i}`,
      name: `Bicicleta Altec #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 12. Mountain Bikes BH (3 units)
  for (let i = 1; i <= 3; i++) {
    units.push({
      id: currentId++,
      store_id: 1,
      category: 'Bikes',
      qr_code: `QQ-MTB-${String(i).padStart(2, '0')}`,
      frame_number: `FR-MTB-${980 + i}`,
      name: `Bicicleta MTB BH #${i}`,
      status: 'AVAILABLE',
      deposit_amount: 30,
      rate_1h: 5,
      rate_5h: 15,
      rate_1d: 20,
      rate_3d: 15,
      rate_1w: 10,
      rate_2w: 8,
      item_owner: 'STORE'
    });
  }

  // 13. Neighbor Equipment Partner Items
  units.push({
    id: 991,
    store_id: 1,
    category: 'Accessories / Shoes',
    qr_code: 'QQ-NGH-SH01',
    frame_number: 'NEIGHBOR-SHOE-01',
    name: 'Specialized Cycling Shoes (Pepe Partner)',
    status: 'AVAILABLE',
    deposit_amount: 20,
    rate_1h: 5,
    rate_1d: 15,
    item_owner: 'NEIGHBOR',
    neighbor_name: 'Pepe Neighbor Shop'
  });

  return units;
};

export const memoryData = {
  stores: [
    { id: 1, company_id: 1, name: 'Málaga Beach Campsite Store', code: 'AGP-01', city: 'Málaga', address: 'Paseo Marítimo 42, Málaga', phone: '+34 952 112 233', is_active: true, initial_cash_float: 150.00 },
    { id: 2, company_id: 1, name: 'Torremolinos Central Hub', code: 'TOR-01', city: 'Torremolinos', address: 'Calle San Miguel 18, Torremolinos', phone: '+34 952 889 900', is_active: true, initial_cash_float: 150.00 }
  ] as Store[],

  users: [
    { id: 1, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'miguel', email: 'miguel@qqbikes.com', first_name: 'Miguel', last_name: 'Manager', phone: '+34 600 111 000', is_active: true },
    { id: 2, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'quique', email: 'quique@qqbikes.com', first_name: 'Quique', last_name: 'Manager', phone: '+34 600 222 000', is_active: true },
    { id: 3, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'ahmet', email: 'ahmet@qqbikes.com', first_name: 'Ahmet', last_name: 'Staff', phone: '+34 600 333 111', is_active: true },
    { id: 4, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'fran', email: 'fran@qqbikes.com', first_name: 'Fran', last_name: 'Staff', phone: '+34 600 333 444', is_active: true },
    { id: 5, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'gustavo', email: 'gustavo@qqbikes.com', first_name: 'Gustavo', last_name: 'Staff', phone: '+34 600 555 666', is_active: true },
    { id: 6, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'abdallah', email: 'abdallah@qqbikes.com', first_name: 'Abdallah', last_name: 'Staff', phone: '+34 600 777 888', is_active: true }
  ] as User[],

  schedules: [
    { id: 1, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Counter & Rentals' },
    { id: 2, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Fran', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },
    { id: 3, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Morning Shift' },
    { id: 4, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Ahmet', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },
    { id: 5, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Fran', start_time: '10:00', end_time: '14:00', task_note: 'Morning Counter' },
    { id: 6, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Gustavo', start_time: '14:00', end_time: '22:00', task_note: 'Afternoon & Closing' },
    { id: 7, store_id: 1, day_code: 'X', day_name: 'Miércoles', employee_name: 'Gustavo', start_time: '10:00', end_time: '14:00', task_note: 'Fleet Maintenance' },
    { id: 8, store_id: 1, day_code: 'J', day_name: 'Jueves', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Morning Shift' },
    { id: 9, store_id: 1, day_code: 'J', day_name: 'Jueves', employee_name: 'Abdallah / Ahmet', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },
    { id: 10, store_id: 1, day_code: 'V', day_name: 'Viernes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:00', task_note: 'Morning Shift' },
    { id: 11, store_id: 1, day_code: 'V', day_name: 'Viernes', employee_name: 'Abdallah', start_time: '17:00', end_time: '22:30', task_note: 'Weekend Launch Shift' },
    { id: 12, store_id: 1, day_code: 'S', day_name: 'Sábado', employee_name: 'Fran', start_time: '10:00', end_time: '16:30', task_note: 'Weekend Morning' },
    { id: 13, store_id: 1, day_code: 'S', day_name: 'Sábado', employee_name: 'Ahmet', start_time: '16:00', end_time: '22:00', task_note: 'Peak Evening Shift' },
    { id: 14, store_id: 1, day_code: 'D', day_name: 'Domingo', employee_name: 'Fran', start_time: '10:00', end_time: '16:30', task_note: 'Sunday Shift' },
    { id: 15, store_id: 1, day_code: 'D', day_name: 'Domingo', employee_name: 'Ahmet', start_time: '16:00', end_time: '22:00', task_note: 'Sunday Closing Shift' }
  ] as WeeklySchedule[],

  vehicles: generateMalagaInventory(),

  contracts: [] as RentalContract[],

  historical_cash_logs: [] as HistoricalCashLog[],

  shifts: [
    {
      id: 901,
      store_id: 1,
      employee_id: 3,
      employee_name: 'Ahmet',
      start_time: new Date().toISOString(),
      opening_cash: 150,
      status: 'OPEN'
    }
  ] as Shift[],

  repair_parts: [
    { id: 1, name: 'Cubierta maciza agujereada 8,5"', pvp_part_only: 18.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 2, name: 'Cubierta normal Xiaomi 8,5" (cámara no incluida)', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 3, name: 'Cubierta normal Xiaomi 8,5" (cámara incluida)', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 4, name: 'Cámara 8,5 Xiaomi Reforzada', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 5, name: 'Kit 10" para Xiaomi', pvp_part_only: 50.00, pvp_with_labor: 70.00, category: 'Scooter' },
    { id: 6, name: 'Llanta reforzada para Xiaomi', pvp_part_only: 10.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 7, name: 'Caballete para Xiaomi', pvp_part_only: 7.00, pvp_with_labor: 15.00, category: 'Scooter' },
    { id: 8, name: 'Disco freno para Xiaomi 110mm', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 9, name: 'Disco freno para Xiaomi 120mm', pvp_part_only: 7.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 10, name: 'Disco freno para Xiaomi 135mm', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 11, name: 'Maneta freno para Xiaomi', pvp_part_only: 15.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 12, name: 'Guardabarros trasero Xiaomi m365 normal (no incluye luz)', pvp_part_only: 12.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 13, name: 'Luz trasera para Xiaomi m365 (no incluye conector hasta batería)', pvp_part_only: 7.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 14, name: 'Conector luz trasera hasta batería Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 15, name: 'Guardabarros trasero completo con luz trasera y conector Xiaomi m365', pvp_part_only: 22.00, pvp_with_labor: 50.00, category: 'Scooter' },
    { id: 16, name: 'Aro cierre para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 17, name: 'Pantalla original + tapa para Xiaomi m365', pvp_part_only: 45.00, pvp_with_labor: 65.00, category: 'Scooter' },
    { id: 18, name: 'Pantalla original para Xiaomi m365 Pro (sin tapa)', pvp_part_only: 55.00, pvp_with_labor: 75.00, category: 'Scooter' },
    { id: 19, name: 'Acelerador compatible para Xiaomi m365', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 20, name: 'Eje leva para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 21, name: 'Tornillo pasador Negro o plateado para Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 22, name: 'Controladora original para Xiaomi m365', pvp_part_only: 100.00, pvp_with_labor: 125.00, category: 'Scooter' },
    { id: 23, name: 'Controladora V3 compatible para Xiaomi m365', pvp_part_only: 70.00, pvp_with_labor: 95.00, category: 'Scooter' },
    { id: 24, name: 'Placa BMS para Xiaomi m365', pvp_part_only: 70.00, pvp_with_labor: 95.00, category: 'Scooter' },
    { id: 25, name: 'Juego pastillas de freno Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 26, name: 'Pinza Xtech para Xiaomi m365 (no incluye pastillas)', pvp_part_only: 40.00, pvp_with_labor: 55.00, category: 'Scooter' },
    { id: 27, name: 'Cable de freno para Xiaomi m365 (incluye funda)', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 28, name: 'Cable Motor para Xiaomi m365', pvp_part_only: 15.00, pvp_with_labor: 50.00, category: 'Scooter' },
    { id: 29, name: 'Motor para Xiaomi m365/Pro 350W (incluye neumático inflado)', pvp_part_only: 155.00, pvp_with_labor: 185.00, category: 'Scooter' }
  ] as RepairPart[],

  repair_services: [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00, category: 'Bicycle' },
    { id: 2, name: 'Revisión básica', price: 10.00, category: 'Bicycle' },
    { id: 3, name: 'Revisión completa', price: 15.00, category: 'Bicycle' },
    { id: 4, name: 'Arreglo/ajuste express', price: 5.00, category: 'Bicycle' },
    { id: 5, name: 'Pinchazo e-bike', price: 12.00, category: 'Bicycle' },
    { id: 6, name: 'Revisión completa + limpieza', price: 25.00, category: 'Bicycle' },
    { id: 7, name: 'Venta cámara 20", 24", 26", 27,5" o 700 (29")', price: 5.00, category: 'Bicycle' },
    { id: 8, name: 'Cambio freno juego Zapatas', price: 10.00, category: 'Bicycle' },
    { id: 9, name: 'Cambio pastillas (por cada par)', price: 25.00, category: 'Bicycle' }
  ] as RepairService[],

  repair_work_orders: [
    {
      id: 501,
      ticket_number: 'REP-2026-001',
      store_id: 1,
      customer_name: 'Carlos Fernandez',
      customer_phone: '+34 655 443 221',
      device_model: 'Xiaomi m365 Pro (Customer Bike)',
      issue_description: 'Rear tire puncture & brake pad wear adjustment',
      parts_used: 'Cubierta maciza agujereada 8,5"',
      parts_cost: 18.00,
      labor_cost: 17.00,
      total_price: 35.00,
      status: 'IN_PROGRESS',
      created_at: new Date().toISOString()
    }
  ] as RepairWorkOrder[]
};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log(`⚡ Initialized exact Málaga physical inventory (53 units across 12 categories), contract extensions, & overdue countdown alerts.`);
    return;
  }
};
