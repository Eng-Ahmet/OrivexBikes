import { Injectable, signal, computed } from '@angular/core';
import { PublicTour, PublicFleetCategory } from './booking-api.service';

export type BookingStep = 'SELECT_ITEM' | 'SELECT_DATE_TIME' | 'CUSTOMER_INFO' | 'CONFIRMATION';
export type BookingMode = 'TOUR' | 'FLEET';

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  currentStep = signal<BookingStep>('SELECT_ITEM');
  bookingMode = signal<BookingMode>('TOUR');

  selectedTour = signal<PublicTour | null>(null);
  selectedFleet = signal<PublicFleetCategory | null>(null);

  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  selectedTimeSlot = signal<string>('10:00');
  durationDays = signal<number>(1);
  durationHours = signal<number>(2);
  quantityOrParticipants = signal<number>(1);

  customerFirstName = signal<string>('');
  customerLastName = signal<string>('');
  customerEmail = signal<string>('');
  customerPhone = signal<string>('');
  customerNotes = signal<string>('');
  paymentMethod = signal<'CASH' | 'CARD'>('CARD');

  confirmedBooking = signal<any | null>(null);

  calculatedTotalPrice = computed(() => {
    const mode = this.bookingMode();
    const qty = this.quantityOrParticipants();
    if (mode === 'TOUR') {
      const tour = this.selectedTour();
      const price = tour?.price_per_person || 35;
      return price * qty;
    } else {
      const fleet = this.selectedFleet();
      const dailyPrice = fleet?.daily_rate || 25;
      const days = this.durationDays();
      return dailyPrice * days * qty;
    }
  });

  resetWizard() {
    this.currentStep.set('SELECT_ITEM');
    this.selectedTour.set(null);
    this.selectedFleet.set(null);
    this.confirmedBooking.set(null);
    this.quantityOrParticipants.set(1);
    this.durationDays.set(1);
  }

  selectItemAndContinue(mode: BookingMode, item: PublicTour | PublicFleetCategory) {
    this.bookingMode.set(mode);
    if (mode === 'TOUR') {
      this.selectedTour.set(item as PublicTour);
      this.selectedFleet.set(null);
    } else {
      this.selectedFleet.set(item as PublicFleetCategory);
      this.selectedTour.set(null);
    }
    this.currentStep.set('SELECT_DATE_TIME');
  }
}
