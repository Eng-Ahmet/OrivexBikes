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

export const memoryData = {
  stores: [
    { id: 1, company_id: 1, name: 'Málaga Beach Campsite Store', code: 'AGP-01', city: 'Málaga', address: 'Paseo Marítimo 42, Málaga', phone: '+34 952 112 233', is_active: true },
    { id: 2, company_id: 1, name: 'Torremolinos Central Hub', code: 'TOR-01', city: 'Torremolinos', address: 'Calle San Miguel 18, Torremolinos', phone: '+34 952 889 900', is_active: true }
  ] as Store[],

  // User Roles: Admins (Miguel, Quique), Employees (Ahmet, Fran, Gustavo, Abdallah)
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

  // Fleet Inventory with Store & Neighbor Owner Options
  vehicles: [
    // 4 Patinetes Etwow
    { id: 101, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-01', frame_number: 'FR-ETW-101', name: 'Patinete Etwow #1', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 95 },
    { id: 102, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-02', frame_number: 'FR-ETW-102', name: 'Patinete Etwow #2', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 90 },
    { id: 103, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-03', frame_number: 'FR-ETW-103', name: 'Patinete Etwow #3', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 88 },
    { id: 104, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-04', frame_number: 'FR-ETW-104', name: 'Patinete Etwow #4', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 100 },

    // 4 Patinetes Ninebot
    { id: 105, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-01', frame_number: 'FR-NIN-201', name: 'Patinete Ninebot #1', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 92 },
    { id: 106, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-02', frame_number: 'FR-NIN-202', name: 'Patinete Ninebot #2', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 85 },
    { id: 107, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-03', frame_number: 'FR-NIN-203', name: 'Patinete Ninebot #3', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 78 },
    { id: 108, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-04', frame_number: 'FR-NIN-204', name: 'Patinete Ninebot #4', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 96 },

    // 8 E-Bikes (VISA)
    { id: 109, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-01', frame_number: 'FR-EB-301', name: 'E-Bike City Cruiser #1', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 98 },
    { id: 110, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-02', frame_number: 'FR-EB-302', name: 'E-Bike City Cruiser #2', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, item_owner: 'STORE', battery_level: 91 },

    // Neighbor Third-Party Equipment Items (Specialized Shoes / Neighbor Bikes)
    { id: 201, store_id: 1, category: 'Accessories / Shoes', qr_code: 'QQ-NGH-SH01', frame_number: 'NEIGHBOR-SHOE-01', name: 'Specialized Cycling Shoes (Pepe Partner)', status: 'AVAILABLE', deposit_amount: 20, rate_1h: 5, rate_1d: 15, item_owner: 'NEIGHBOR', neighbor_name: 'Pepe Neighbor Shop' },
    { id: 202, store_id: 1, category: 'Bikes', qr_code: 'QQ-NGH-BK01', frame_number: 'NEIGHBOR-BK-02', name: 'Premium Trek Road Bike (Neighbor Juan)', status: 'AVAILABLE', deposit_amount: 50, rate_1h: 10, rate_1d: 30, item_owner: 'NEIGHBOR', neighbor_name: 'Juan Partner Bikes' }
  ] as Vehicle[],

  contracts: [] as RentalContract[],

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
    { id: 1, name: 'Cubierta maciza agujereada 8.5"', pvp_part_only: 18.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 2, name: 'Cubierta normal Xiaomi 8.5" + cámara incluida', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 3, name: 'Cámara 8.5" para Xiaomi Reforzada', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 4, name: 'Kit 10" para Xiaomi', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' }
  ] as RepairPart[],

  repair_services: [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00, category: 'Bicycle' },
    { id: 2, name: 'Pinchazo e-bike', price: 15.00, category: 'Bicycle' }
  ] as RepairService[]
};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log(`⚡ Initialized QQBikes managers (Miguel, Quique), staff (Ahmet, Fran, Gustavo, Abdallah), and Neighbor Debt Settlement system.`);
    return;
  }
};
