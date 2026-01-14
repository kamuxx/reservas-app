import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SpacesService } from 'src/app/services/spaces.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Space, CreateReservationRequest, AvailabilitySlot, User } from 'src/app/core/models';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule, CalendarView, CalendarEvent, CalendarEventAction } from 'angular-calendar';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, isSameMonth, isSameDay, addDays, isBefore, isAfter } from 'date-fns';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-espacio-detalle',
  standalone: true,
  imports: [CommonModule, ToastModule, FormsModule, CalendarModule],
  templateUrl: './espacio-detalle.component.html',
  styleUrl: './espacio-detalle.component.css'
})
export class EspacioDetalleComponent implements OnInit {

  constructor(
    private espacioSvc: SpacesService,
    private reservationSvc: ReservationService,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router
  ) { }

  currentUser: User | null = null;
  space: Space | undefined;
  loading: boolean = true;
  isCheckingAvailability: boolean = false;
  isReserving: boolean = false;

  // Reservation Form Data
  selectedDate: string = '';
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectedStartTime: string = '';
  selectedEndTime: string = '';
  totalPrice: number = 0;
  serviceFee: number = 15;

  availableSlots: AvailabilitySlot[] = [];

  images: string[] = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80'
  ];

  timeOptions: string[] = [];

  reviews = [
    {
      user: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=1',
      date: '15 Oct 2024',
      rating: 5,
      comment: 'Excelente espacio, muy bien equipado y con una ubicación perfecta. El equipo de soporte fue muy atento.'
    },
    {
      user: 'Carlos Méndez',
      avatar: 'https://i.pravatar.cc/150?img=3',
      date: '10 Oct 2024',
      rating: 4,
      comment: 'Muy cómodo y funcional. La conexión WiFi es rápida y el ambiente propicio para reuniones productivas.'
    }
  ];

  // Calendar properties
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = true;


  ngOnInit(): void {
    this.authSvc.currentUser$.subscribe(user => this.currentUser = user);
    this.generateTimeOptions();
    this.loadSpace();
  }

  generateTimeOptions() {
    const startHour = 8; // 8 AM
    const endHour = 20; // 8 PM
    this.timeOptions = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      this.timeOptions.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeOptions.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  async loadSpace() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.showError('No se proporcionó un ID válido');
      this.loading = false;
      return;
    }

    try {
      this.space = await this.espacioSvc.getById(id);

      // Initialize date with today only if not set
      if (!this.selectedDate) {
        const today = new Date();
        this.selectedDate = this.formatDate(today);
        this.startDate = today;

        // Initial availability check
        this.checkAvailability();
      }


      this.fetchMonthAvailability();

      this.loading = false;
    } catch (error) {
      this.showError('No se pudo cargar el espacio');
      this.loading = false;
    }
  }

  async fetchMonthAvailability() {
    if (!this.space?.uuid) return;

    const start = startOfMonth(this.viewDate);
    const end = endOfMonth(this.viewDate);

    // Backend requires start_date >= today
    const now = startOfDay(new Date());
    const apiStart = isBefore(start, now) ? now : start;

    // Format as YYYY-MM-DD
    const startStr = this.formatDate(apiStart);
    const endStr = this.formatDate(end);

    try {
      const slots = await this.espacioSvc.checkAvailability(this.space.uuid, startStr, endStr);

      this.events = slots.map(slot => {
        // Parse "YYYY-MM-DD"
        const [year, month, day] = slot.event_date.split('-').map(Number);

        // Parse "HH:mm:ss"
        const [startHour, startMinute] = slot.start_time.split(':').map(Number);
        const [endHour, endMinute] = slot.end_time.split(':').map(Number);

        // Construct Date objects explicitly
        const start = new Date(year, month - 1, day, startHour, startMinute);
        const end = new Date(year, month - 1, day, endHour, endMinute);

        // Check ownership using user_uuid if present
        const reservedBy = slot.user_uuid || slot.reserved_by;
        const isMyEvent = this.currentUser && reservedBy === this.currentUser.uuid;

        const timeRange = `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`;
        const eventTitle = isMyEvent ? (slot.event_name || 'Mi Reserva') : 'Espacio Reservado';

        // Log for debugging
        console.log('Mapping event:', { slot, isMyEvent, start, end });

        return {
          start,
          end,
          title: `${eventTitle} (${timeRange})`,
          color: isMyEvent ? {
            primary: '#10b981', // emerald-500
            secondary: '#d1fae5', // emerald-100
          } : {
            primary: '#ef4444', // red-500
            secondary: '#fca5a5', // red-300
          },
          allDay: false,
          resizable: {
            beforeStart: false,
            afterEnd: false,
          },
          draggable: false,
          meta: {
            isMyEvent
          }
        };
      });
      // Force refresh of the view
      this.refresh.next();

      // OPTIMIZATION: Populate availableSlots for the currently selected date if it falls within our fetched range
      if (this.startDate) {
        const selectedDateStr = this.formatDate(this.startDate);
        // Only update if we are looking at the relevant month/range
        if (selectedDateStr >= startStr && selectedDateStr <= endStr) {
          this.availableSlots = slots.filter(s => s.event_date === selectedDateStr);
          this.calculateTotal(); // Re-calculate or re-validate UI
          console.log('Pre-loaded availability for today:', this.availableSlots);
        }
      }



    } catch (error) {
      console.error('Error fetching month availability', error);
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (!isSameMonth(date, this.viewDate)) {
      return;
    }

    // Validate past dates
    if (isBefore(date, startOfDay(new Date()))) {
      this.showError('No se pueden seleccionar fechas pasadas');
      return;
    }

    if (!this.startDate || (this.startDate && this.endDate) || isBefore(date, this.startDate)) {
      // First click or Reset
      this.startDate = date;
      this.endDate = undefined;
      this.selectedDate = this.formatDate(date);
    } else if (this.startDate && !this.endDate && isAfter(date, this.startDate)) {
      // Second click (End date)
      this.endDate = date;
      this.selectedDate = `${this.formatDate(this.startDate)} al ${this.formatDate(this.endDate)}`;
    } else if (isSameDay(date, this.startDate)) {
      if (this.endDate) {
        this.endDate = undefined;
        this.selectedDate = this.formatDate(date);
      } else {
        this.startDate = undefined;
        this.selectedDate = '';
        this.availableSlots = [];
        this.selectedStartTime = '';
        this.selectedEndTime = '';
        this.totalPrice = 0;
      }
    }

    this.updateCalendarEvents();
    this.refresh.next();

    // Check availability for the NEW selection (start date for now to show hours)
    // Ideally we check common hours? For now simpler: check start date
    if (this.startDate) {
      this.checkAvailability();
    }
  }

  updateCalendarEvents() {
    // Clear previous "Selected" events (we can tag them or just rebuild)
    // For this implementation, let's keep "Reservado" events and add "Seleccionado"

    // First, remove old selection events
    this.events = this.events.filter(e => e.meta !== 'selection');

    if (this.startDate) {
      let current = new Date(this.startDate);
      const end = this.endDate || new Date(this.startDate);

      while (current <= end) {
        this.events.push({
          start: startOfDay(current),
          end: endOfDay(current),
          title: 'Seleccionado',
          color: {
            primary: '#10b981', // emerald-500
            secondary: '#d1fae5', // emerald-100
          },
          allDay: true,
          meta: 'selection',
          draggable: false,
          resizable: {
            beforeStart: false,
            afterEnd: false,
          }
        });
        current = addDays(current, 1);
      }
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.fetchMonthAvailability();
  }

  async checkAvailability() {
    if (!this.space?.uuid || !this.startDate) return;

    this.isCheckingAvailability = true;
    try {
      const startStr = this.formatDate(this.startDate);
      // For single day selection, end date is same as start date
      const endStr = this.endDate ? this.formatDate(this.endDate) : startStr;

      console.log('Checking availability for:', { spaceId: this.space.uuid, startStr, endStr });

      const slots = await this.espacioSvc.checkAvailability(
        this.space.uuid,
        startStr,
        endStr
      );
      this.availableSlots = slots;
      console.log('Available slots fetched:', this.availableSlots);

    } catch (error) {
      console.error('Error checking availability', error);
      this.availableSlots = [];
    } finally {
      this.isCheckingAvailability = false;
      this.calculateTotal();
    }
  }

  isSlotOccupied(time: string): boolean {
    // Check past time if selected date is today
    if (this.startDate && isSameDay(this.startDate, new Date())) {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(this.startDate);
      slotDate.setHours(hours, minutes, 0, 0);

      // Give a small buffer (e.g. 1 minute) or strictly current time
      if (isBefore(slotDate, now)) {
        return true;
      }
    }

    if (!this.availableSlots || this.availableSlots.length === 0) return false;

    // Convert time (HH:mm) to minutes for easier comparison
    const timeParts = time.split(':').map(Number);
    const timeMinutes = timeParts[0] * 60 + timeParts[1];

    return this.availableSlots.some(slot => {
      // Ensure we have start/end times
      if (!slot.start_time || !slot.end_time) return false;

      const start = slot.start_time.split(':').map(Number);
      const end = slot.end_time.split(':').map(Number);

      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];

      // Debug specific overlap checks if needed
      // console.log(`Checking ${time} (${timeMinutes}) against ${slot.start_time}-${slot.end_time} (${startMinutes}-${endMinutes})`);

      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  }

  getSlotClasses(slot: string): string {
    const isOccupied = this.isSlotOccupied(slot);

    if (isOccupied) {
      return 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200';
    }

    // Check if selected
    if (this.selectedStartTime === slot || this.selectedEndTime === slot) {
      return 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105';
    }

    return 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer shadow-sm';
  }

  onDateChange() {
    if (!this.selectedDate) return;

    // Parse string YYYY-MM-DD to Date
    const parts = this.selectedDate.split('-');
    const newDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);

    // Validate past dates
    const today = startOfDay(new Date());
    if (isBefore(newDate, today)) {
      this.showError('No se pueden seleccionar fechas pasadas');
      // Reset to today
      this.selectedDate = this.formatDate(today);
      this.startDate = today;
    } else {
      this.startDate = newDate;
    }

    // Reset end date when manual change happens (simplification)
    this.endDate = undefined;

    // Update calendar selection visual
    this.viewDate = this.startDate;
    this.updateCalendarEvents();

    this.checkAvailability();
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = 0;

    if (!this.space || !this.selectedStartTime || !this.selectedEndTime || !this.startDate) return;

    const startParts = this.selectedStartTime.split(':').map(Number);
    const endParts = this.selectedEndTime.split(':').map(Number);

    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (endMinutes <= startMinutes) {
      return;
    }

    const durationHours = (endMinutes - startMinutes) / 60;
    const hourlyRate = this.space.pricing_rule?.hourly_rate || 50;

    let days = 1;
    if (this.startDate && this.endDate) {
      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    this.totalPrice = (durationHours * hourlyRate * days) + this.serviceFee;
  }

  async onReserve() {
    if (!this.authSvc.isAuthenticated()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Inicia sesión',
        detail: 'Debes iniciar sesión para realizar una reserva',
        life: 3000
      });
      // Redirect to login with return url could be added here
      this.router.navigate(['/login']);
      return;
    }

    if (!this.space?.uuid || !this.startDate || !this.selectedStartTime || !this.selectedEndTime) {
      this.showError('Por favor completa todos los campos de la reserva');
      return;
    }

    // Validate time range
    const startParts = this.selectedStartTime.split(':').map(Number);
    const endParts = this.selectedEndTime.split(':').map(Number);
    if (endParts[0] * 60 + endParts[1] <= startParts[0] * 60 + startParts[1]) {
      this.showError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    this.isReserving = true;

    // Calculate price per event
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const durationHours = (endMinutes - startMinutes) / 60;
    const hourlyRate = this.space.pricing_rule?.hourly_rate || 50;
    const eventPrice = durationHours * hourlyRate;

    try {
      const datesToReserve: string[] = [];
      if (this.startDate) {
        let current = new Date(this.startDate);
        const end = this.endDate || new Date(this.startDate);
        while (current <= end) {
          datesToReserve.push(this.formatDate(current));
          current = addDays(current, 1);
        }
      }

      for (const date of datesToReserve) {
        const reservationData: CreateReservationRequest = {
          space_id: this.space.uuid,
          event_name: 'Reserva Web',
          event_date: date,
          start_time: this.selectedStartTime,
          end_time: this.selectedEndTime,
          event_price: eventPrice
        };
        await this.reservationSvc.createReservation(reservationData);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Reserva Exitosa',
        detail: `Se han creado reservas para ${datesToReserve.length} día(s)`,
        life: 3000
      });

      this.router.navigate(['/mis-reservas']);

    } catch (error) {
      this.showError('Error al crear la reserva. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      this.isReserving = false;
    }
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }





  getTotalPriceDisplay(): number {
    return this.totalPrice;
  }
}
