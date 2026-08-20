import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PublicTour {
  id: number;
  title: string;
  category: string;
  duration_hours: number;
  price_per_person: number;
  rating: number;
  review_count: number;
  location: string;
  description: string;
  image_url: string;
  highlights: string[];
  available_times: string[];
  max_capacity: number;
}

export interface PublicFleetCategory {
  category: string;
  display_name: string;
  daily_rate: number;
  hourly_rate: number;
  deposit_amount: number;
  available_count: number;
  icon: string;
}

export interface PublicBookingPayload {
  type: 'TOUR' | 'FLEET';
  item_id: number;
  item_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  duration_days?: number;
  duration_hours?: number;
  quantity_or_participants: number;
  total_price: number;
  payment_method: 'STRIPE' | 'PAY_AT_COUNTER' | 'CASH' | 'CARD';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
  private http = inject(HttpClient);
  private apiBase = '/api/v1/public';

  async getTours(): Promise<PublicTour[]> {
    return firstValueFrom(this.http.get<PublicTour[]>(`${this.apiBase}/tours`));
  }

  async getFleetCategories(): Promise<PublicFleetCategory[]> {
    return firstValueFrom(this.http.get<PublicFleetCategory[]>(`${this.apiBase}/fleet`));
  }

  async checkAvailability(date: string, type: 'TOUR' | 'FLEET', itemId: number): Promise<any> {
    const params = new HttpParams()
      .set('date', date)
      .set('type', type)
      .set('item_id', String(itemId));
    return firstValueFrom(this.http.get(`${this.apiBase}/availability`, { params }));
  }

  async createBooking(payload: PublicBookingPayload): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/bookings`, payload));
  }
}
