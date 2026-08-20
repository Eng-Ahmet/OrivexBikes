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
    try {
      const data = await firstValueFrom(this.http.get<PublicTour[]>(`${this.apiBase}/tours`));
      if (Array.isArray(data) && data.length > 0) return data;
      return this.getFallbackTours();
    } catch {
      return this.getFallbackTours();
    }
  }

  async getFleetCategories(): Promise<PublicFleetCategory[]> {
    try {
      const data = await firstValueFrom(this.http.get<any[]>(`${this.apiBase}/fleet`));
      if (Array.isArray(data) && data.length > 0) {
        return this.mapVehiclesToCategories(data);
      }
      return this.getFallbackFleetCategories();
    } catch {
      return this.getFallbackFleetCategories();
    }
  }

  async checkAvailability(date: string, type: 'TOUR' | 'FLEET', itemId: number): Promise<any> {
    try {
      const params = new HttpParams()
        .set('date', date)
        .set('type', type)
        .set('item_id', String(itemId));
      return await firstValueFrom(this.http.get(`${this.apiBase}/availability`, { params }));
    } catch {
      return { available: true, max_available: 5 };
    }
  }

  async createBooking(payload: PublicBookingPayload): Promise<any> {
    return firstValueFrom(this.http.post(`${this.apiBase}/bookings`, payload));
  }

  private mapVehiclesToCategories(vehicles: any[]): PublicFleetCategory[] {
    const categoryMap = new Map<string, PublicFleetCategory>();

    for (const v of vehicles) {
      const catKey = (v.category || 'ebike').toLowerCase();
      if (!categoryMap.has(catKey)) {
        let displayName = 'E-Bike / Electric Bike';
        let icon = 'fa-bicycle';
        if (catKey.includes('scooter')) {
          displayName = 'Electric Scooter';
          icon = 'fa-motorcycle';
        } else if (catKey.includes('city') || catKey.includes('bike')) {
          displayName = 'Comfort City Bike';
          icon = 'fa-bicycle';
        } else if (catKey.includes('cargo')) {
          displayName = 'Family Cargo Bike';
          icon = 'fa-truck-ramp-box';
        }

        categoryMap.set(catKey, {
          category: catKey,
          display_name: displayName,
          daily_rate: Number(v.daily_rate || 25),
          hourly_rate: Number(v.hourly_rate || 8),
          deposit_amount: Number(v.deposit_amount || 50),
          available_count: 0,
          icon
        });
      }

      const item = categoryMap.get(catKey)!;
      if (v.status === 'AVAILABLE') {
        item.available_count += 1;
      }
    }

    const result = Array.from(categoryMap.values());
    return result.length > 0 ? result : this.getFallbackFleetCategories();
  }

  private getFallbackFleetCategories(): PublicFleetCategory[] {
    return [
      { category: 'ebike', display_name: 'E-Bike / Electric Bike', daily_rate: 35, hourly_rate: 10, deposit_amount: 100, available_count: 5, icon: 'fa-bicycle' },
      { category: 'scooter', display_name: 'Electric Scooter (eScooter)', daily_rate: 28, hourly_rate: 8, deposit_amount: 80, available_count: 4, icon: 'fa-motorcycle' },
      { category: 'bike', display_name: 'Comfort City Bike', daily_rate: 18, hourly_rate: 5, deposit_amount: 50, available_count: 6, icon: 'fa-bicycle' },
      { category: 'cargo', display_name: 'Family Cargo E-Bike', daily_rate: 50, hourly_rate: 15, deposit_amount: 150, available_count: 2, icon: 'fa-truck-ramp-box' }
    ];
  }

  private getFallbackTours(): PublicTour[] {
    return [
      {
        id: 1,
        title: 'Málaga Historic Coast & Tapas Tour',
        category: 'Guided E-Bike Tour',
        duration_hours: 3,
        price_per_person: 35,
        rating: 5.0,
        review_count: 42,
        location: 'Paseo Marítimo 42, Málaga Central Beach',
        description: 'Guided E-bike ride through Port of Málaga, Alcazaba, and beach promenade with authentic local tapas stop.',
        image_url: '/assets/tour-1.jpg',
        highlights: ['500W E-Bike included', 'Tapas & beverage included', 'Local guide'],
        available_times: ['10:00 AM', '04:00 PM'],
        max_capacity: 12
      },
      {
        id: 2,
        title: 'Mijas Village & Mountain Panorama',
        category: 'Guided Mountain Tour',
        duration_hours: 4,
        price_per_person: 45,
        rating: 4.9,
        review_count: 28,
        location: 'Calle Mar 15, Mijas Coastal Resort',
        description: 'Scenic mountain climb tour on powerful E-Bikes featuring Mediterranean panoramic views.',
        image_url: '/assets/tour-2.jpg',
        highlights: ['Mountain E-Bike included', 'Panoramic views', 'Safety equipment'],
        available_times: ['09:30 AM'],
        max_capacity: 8
      }
    ];
  }
}
