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

  users: [
    { id: 1, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'ADMIN', username: 'ahmet', email: 'ahmet@qqbikes.com', first_name: 'Ahmet', last_name: 'Manager', phone: '+34 600 111 222', is_active: true },
    { id: 2, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'fran', email: 'fran@qqbikes.com', first_name: 'Fran', last_name: 'Staff', phone: '+34 600 333 444', is_active: true },
    { id: 3, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'gustavo', email: 'gustavo@qqbikes.com', first_name: 'Gustavo', last_name: 'Staff', phone: '+34 600 555 666', is_active: true },
    { id: 4, company_id: 1, store_id: 1, store_name: 'Málaga Beach Campsite Store', user_type: 'EMPLOYEE', username: 'abdallah', email: 'abdallah@qqbikes.com', first_name: 'Abdallah', last_name: 'Staff', phone: '+34 600 777 888', is_active: true }
  ] as User[],

  schedules: [
    { id: 1, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Counter & Rentals' },
    { id: 2, store_id: 1, day_code: 'L', day_name: 'Lunes', employee_name: 'Fran', start_time: '17:00', end_time: '22:00', task_note: 'Evening Shift' },
    { id: 3, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Gustavo', start_time: '10:00', end_time: '17:30', task_note: 'Morning Shift' },
    { id: 4, store_id: 1, day_code: 'M', day_name: 'Martes', employee_name: 'Ahmet', start_time: '17:00', end_time: '22:00', task_note: 'Evening Manager' },
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

  // Official Physical Malaga Store Fleet Inventory (INVENTARIOS)
  vehicles: [
    // 4 Patinetes Etwow
    { id: 101, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-01', frame_number: 'FR-ETW-101', name: 'Patinete Etwow #1', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 95 },
    { id: 102, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-02', frame_number: 'FR-ETW-102', name: 'Patinete Etwow #2', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 90 },
    { id: 103, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-03', frame_number: 'FR-ETW-103', name: 'Patinete Etwow #3', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 88 },
    { id: 104, store_id: 1, category: 'Scooters', qr_code: 'QQ-ETW-04', frame_number: 'FR-ETW-104', name: 'Patinete Etwow #4', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 100 },

    // 4 Patinetes Ninebot
    { id: 105, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-01', frame_number: 'FR-NIN-201', name: 'Patinete Ninebot #1', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 92 },
    { id: 106, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-02', frame_number: 'FR-NIN-202', name: 'Patinete Ninebot #2', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 85 },
    { id: 107, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-03', frame_number: 'FR-NIN-203', name: 'Patinete Ninebot #3', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 78 },
    { id: 108, store_id: 1, category: 'Scooters', qr_code: 'QQ-NIN-04', frame_number: 'FR-NIN-204', name: 'Patinete Ninebot #4', status: 'AVAILABLE', deposit_amount: 50, rate_30m: 10, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 96 },

    // 8 E-Bikes (VISA)
    { id: 109, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-01', frame_number: 'FR-EB-301', name: 'E-Bike City Cruiser #1', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 98 },
    { id: 110, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-02', frame_number: 'FR-EB-302', name: 'E-Bike City Cruiser #2', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 91 },
    { id: 111, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-03', frame_number: 'FR-EB-303', name: 'E-Bike City Cruiser #3', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 84 },
    { id: 112, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-04', frame_number: 'FR-EB-304', name: 'E-Bike City Cruiser #4', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 100 },
    { id: 113, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-05', frame_number: 'FR-EB-305', name: 'E-Bike City Cruiser #5', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 75 },
    { id: 114, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-06', frame_number: 'FR-EB-306', name: 'E-Bike City Cruiser #6', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 89 },
    { id: 115, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-07', frame_number: 'FR-EB-307', name: 'E-Bike City Cruiser #7', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 93 },
    { id: 116, store_id: 1, category: 'E-Bikes (VISA)', qr_code: 'QQ-EB-08', frame_number: 'FR-EB-308', name: 'E-Bike City Cruiser #8', status: 'AVAILABLE', deposit_amount: 100, rate_1h: 15, rate_2h: 20, rate_5h: 25, rate_1d: 40, rate_3d: 30, rate_1w: 25, rate_2w: 20, battery_level: 82 },

    // 4 Quads / S Cars
    { id: 117, store_id: 1, category: 'S cars/Quads', qr_code: 'QQ-QD-01', frame_number: 'FR-QD-401', name: 'Quad S-Car #1', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 10, rate_30m: 15, rate_1h: 25, rate_1d: 40 },
    { id: 118, store_id: 1, category: 'S cars/Quads', qr_code: 'QQ-QD-02', frame_number: 'FR-QD-402', name: 'Quad S-Car #2', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 10, rate_30m: 15, rate_1h: 25, rate_1d: 40 },
    { id: 119, store_id: 1, category: 'S cars/Quads', qr_code: 'QQ-QD-03', frame_number: 'FR-QD-403', name: 'Quad S-Car #3', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 10, rate_30m: 15, rate_1h: 25, rate_1d: 40 },
    { id: 120, store_id: 1, category: 'S cars/Quads', qr_code: 'QQ-QD-04', frame_number: 'FR-QD-404', name: 'Quad S-Car #4', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 10, rate_30m: 15, rate_1h: 25, rate_1d: 40 },

    // 5 XL Cars & 1 Jeep
    { id: 121, store_id: 1, category: 'XL Cars', qr_code: 'QQ-XL-01', frame_number: 'FR-XL-501', name: 'XL Car #1', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },
    { id: 122, store_id: 1, category: 'XL Cars', qr_code: 'QQ-XL-02', frame_number: 'FR-XL-502', name: 'XL Car #2', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },
    { id: 123, store_id: 1, category: 'XL Cars', qr_code: 'QQ-XL-03', frame_number: 'FR-XL-503', name: 'XL Car #3', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },
    { id: 124, store_id: 1, category: 'XL Cars', qr_code: 'QQ-XL-04', frame_number: 'FR-XL-504', name: 'XL Car #4', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },
    { id: 125, store_id: 1, category: 'XL Cars', qr_code: 'QQ-XL-05', frame_number: 'FR-XL-505', name: 'XL Car #5', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },
    { id: 126, store_id: 1, category: 'XL Cars', qr_code: 'QQ-JEP-01', frame_number: 'FR-JEP-601', name: 'Jeep XL', status: 'AVAILABLE', deposit_amount: 20, rate_20m: 15, rate_30m: 20, rate_1h: 30, rate_1d: 50 },

    // 4 Buggys (2 Int. Azules, 2 Rojo y Naranja)
    { id: 127, store_id: 1, category: "Buggy's", qr_code: 'QQ-BUG-01', frame_number: 'FR-BUG-701', name: 'Buggy Int. Azul #1', status: 'AVAILABLE', deposit_amount: 20, rate_30m: 5, rate_1h: 25, rate_1d: 40 },
    { id: 128, store_id: 1, category: "Buggy's", qr_code: 'QQ-BUG-02', frame_number: 'FR-BUG-702', name: 'Buggy Int. Azul #2', status: 'AVAILABLE', deposit_amount: 20, rate_30m: 5, rate_1h: 25, rate_1d: 40 },
    { id: 129, store_id: 1, category: "Buggy's", qr_code: 'QQ-BUG-03', frame_number: 'FR-BUG-703', name: 'Buggy D. Rojo y Naranja #1', status: 'AVAILABLE', deposit_amount: 20, rate_30m: 5, rate_1h: 25, rate_1d: 40 },
    { id: 130, store_id: 1, category: "Buggy's", qr_code: 'QQ-BUG-04', frame_number: 'FR-BUG-704', name: 'Buggy D. Rojo y Naranja #2', status: 'AVAILABLE', deposit_amount: 20, rate_30m: 5, rate_1h: 25, rate_1d: 40 },

    // Bicycles (10 Quert, 8 Altec, 1 MTB BH, 2 Bicis Niño)
    { id: 131, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-NIN-01', frame_number: 'FR-NIN-801', name: 'Bici Niño #1', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 132, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-NIN-02', frame_number: 'FR-NIN-802', name: 'Bici Niño #2', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 133, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-BH-01', frame_number: 'FR-BH-803', name: 'MTB BH X1', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 134, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-QRT-01', frame_number: 'FR-QRT-901', name: 'Bici Quert #1', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 135, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-QRT-02', frame_number: 'FR-QRT-902', name: 'Bici Quert #2', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 136, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-ALT-01', frame_number: 'FR-ALT-951', name: 'Bici Altec #1', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 },
    { id: 137, store_id: 1, category: 'Bikes', qr_code: 'QQ-BK-ALT-02', frame_number: 'FR-ALT-952', name: 'Bici Altec #2', status: 'AVAILABLE', deposit_amount: 30, rate_1h: 5, rate_5h: 15, rate_1d: 20, rate_3d: 15, rate_1w: 10, rate_2w: 8 }
  ] as Vehicle[],

  // Clean empty active contracts start state (contracts created live by employee)
  contracts: [] as RentalContract[],

  shifts: [
    {
      id: 901,
      store_id: 1,
      employee_id: 3,
      employee_name: 'Gustavo',
      start_time: new Date().toISOString(),
      opening_cash: 150,
      status: 'OPEN'
    }
  ] as Shift[],

  // Official Repair Parts Catalog (Recambios Patines / Xiaomi & Bikes)
  repair_parts: [
    { id: 1, name: 'Cubierta maciza agujereada 8.5"', pvp_part_only: 18.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 2, name: 'Cubierta normal Xiaomi 8.5" + cámara incluida', pvp_part_only: 15.00, pvp_with_labor: 30.00, category: 'Scooter' },
    { id: 3, name: 'Cámara 8.5" para Xiaomi Reforzada', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 4, name: 'Kit 10" para Xiaomi', pvp_part_only: 20.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 5, name: 'Uña reforzada para Xiaomi', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 6, name: 'Caballete para Xiaomi', pvp_part_only: 7.00, pvp_with_labor: 15.00, category: 'Scooter' },
    { id: 7, name: 'Disco freno para Xiaomi 110mm / 120mm / 135mm', pvp_part_only: 10.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 8, name: 'Maneta de freno para Xiaomi', pvp_part_only: 12.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 9, name: 'Guardabarros trasero Xiaomi m365 normal', pvp_part_only: 15.00, pvp_with_labor: 25.00, category: 'Scooter' },
    { id: 10, name: 'Luz trasera para Xiaomi m365', pvp_part_only: 7.00, pvp_with_labor: 15.00, category: 'Scooter' },
    { id: 11, name: 'Guardabarros completo con luz y conector Xiaomi', pvp_part_only: 22.00, pvp_with_labor: 35.00, category: 'Scooter' },
    { id: 12, name: 'Pantalla original + tapa para Xiaomi m365 / Pro', pvp_part_only: 45.00, pvp_with_labor: 65.00, category: 'Scooter' },
    { id: 13, name: 'Controladora V3 compatible para Xiaomi m365', pvp_part_only: 55.00, pvp_with_labor: 75.00, category: 'Scooter' },
    { id: 14, name: 'Placa BMS para Xiaomi m365', pvp_part_only: 70.00, pvp_with_labor: 95.00, category: 'Scooter' },
    { id: 15, name: 'Juego pastillas de frenos Xiaomi m365', pvp_part_only: 5.00, pvp_with_labor: 20.00, category: 'Scooter' },
    { id: 16, name: 'Pinza Xtech para Xiaomi m365 (no incluye pastillas)', pvp_part_only: 40.00, pvp_with_labor: 55.00, category: 'Scooter' },
    { id: 17, name: 'Motor para Xiaomi m365/pro 350W con neumático inflable', pvp_part_only: 115.00, pvp_with_labor: 185.00, category: 'Scooter' }
  ] as RepairPart[],

  // Official Bike Repair Labor Services
  repair_services: [
    { id: 1, name: 'Pinchazo bicicleta normal', price: 10.00, category: 'Bicycle' },
    { id: 2, name: 'Pinchazo e-bike', price: 15.00, category: 'Bicycle' },
    { id: 3, name: 'Revisión básica bicicleta', price: 10.00, category: 'Bicycle' },
    { id: 4, name: 'Revisión completa bicicleta', price: 25.00, category: 'Bicycle' },
    { id: 5, name: 'Cambio pastillas / zapatas freno', price: 10.00, category: 'Bicycle' },
    { id: 6, name: 'Mano de obra reparaciones mecánicas (por hora)', price: 15.00, category: 'Labor' },
    { id: 7, name: 'Mano de obra reparaciones electrónicas (por hora)', price: 25.00, category: 'Labor' }
  ] as RepairService[]
};

export const initializeSchema = async () => {
  if (!isMySQLActive()) {
    console.log(`⚡ Initialized official QQBikes physical Malaga inventory (${memoryData.vehicles.length} units), empty active contracts, and repair parts catalog.`);
    return;
  }
};
