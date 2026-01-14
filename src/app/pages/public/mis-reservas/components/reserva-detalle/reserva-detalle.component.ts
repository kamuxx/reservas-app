import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../../../services/reservation.service';
import { Reservation } from '../../../../../core/models';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CalendarModule, CalendarView, CalendarEvent } from 'angular-calendar';
import { Slider } from 'primeng/slider';
import { InputTextarea } from 'primeng/inputtextarea';
import { SpacesService } from '../../../../../services/spaces.service';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, isSameMonth, isSameDay, addDays, isBefore, isAfter } from 'date-fns';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-reserva-detalle',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ConfirmDialogModule,
        FormsModule,
        ToastModule,
        CalendarModule,
        Slider,
        InputTextarea
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './reserva-detalle.component.html',
    styleUrl: './reserva-detalle.component.css'
})
export class ReservaDetalleComponent implements OnChanges {
    @Input() visible: boolean = false;
    @Input() reservation: Reservation | null = null;
    @Input() reservationId: string | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onUpdate = new EventEmitter<void>();

    loading: boolean = false;
    isEditing: boolean = false;
    editForm: any = {
        event_date: '',
        start_time: '',
        end_time: '',
        attendees: 0
    };

    // Review Form
    reviewForm: any = {
        rating: 5,
        comment: ''
    };

    // Calendar Properties
    view: CalendarView = CalendarView.Month;
    viewDate: Date = new Date();
    events: CalendarEvent[] = [];
    refresh = new Subject<void>();
    activeDayIsOpen: boolean = false;
    availableSlots: any[] = [];

    // Time Selection
    timeOptions: string[] = [];
    startDate: Date | undefined;
    endDate: Date | undefined;
    selectedDateStr: string = '';

    constructor(
        private reservationService: ReservationService,
        private spacesService: SpacesService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.isEditing = false; // Reset edit mode on open
            this.resetState();
            if (!this.reservation && this.reservationId) {
                this.loadReservation(this.reservationId);
            } else if (this.reservation) {
                // If reservation is already loaded, check if we need to init anything
                this.checkPastEventState();
            }
        }
    }

    checkPastEventState() {
        if (this.isPastReservation) {
            // Init review form if needed, maybe load existing review if backend supported it
            this.reviewForm = { rating: 5, comment: '' };
        }
    }

    get isPastReservation(): boolean {
        if (!this.reservation) return false;
        // Check if event date is strictly before today
        // Using string comparison or date object
        const eventDate = new Date(this.reservation.event_date);
        const today = startOfDay(new Date());
        return isBefore(eventDate, today);
    }

    async loadReservation(id: string) {
        this.loading = true;
        try {
            this.reservation = await this.reservationService.getReservationById(id);
        } catch (error) {
            console.error('Error loading reservation details', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la reserva' });
            this.close();
        } finally {
            this.loading = false;
            this.checkPastEventState();
        }
    }

    close() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
        this.resetState();
    }

    resetState() {
        this.isEditing = false;
        this.editForm = {};
    }

    canEdit(reservation: Reservation): boolean {
        if (!reservation || reservation.status?.name.toLowerCase() === 'cancelada') return false;

        const now = new Date();
        // Assuming event_date is YYYY-MM-DD
        const eventStart = new Date(`${reservation.event_date}T${reservation.start_time}`);

        const diffMs = eventStart.getTime() - now.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);

        return diffHrs >= 1;
    }

    startEdit() {
        if (this.reservation && this.canEdit(this.reservation)) {
            this.isEditing = true;
            this.initEditForm();
            this.generateTimeOptions();

            // Initialize Calendar
            this.viewDate = new Date(this.reservation.event_date);
            // Set initial selection
            const [year, month, day] = this.reservation.event_date.split('-').map(Number);
            this.startDate = new Date(year, month - 1, day);
            this.selectedDateStr = this.reservation.event_date;

            // Fetch availability for the current month view
            this.fetchMonthAvailability();

        } else {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se puede editar con menos de 1 hora de anticipación' });
        }
    }

    initEditForm() {
        if (!this.reservation) return;
        this.editForm = {
            event_name: this.reservation.event_name,
            event_date: this.reservation.event_date,
            start_time: this.reservation.start_time ? this.reservation.start_time.substring(0, 5) : '',
            end_time: this.reservation.end_time ? this.reservation.end_time.substring(0, 5) : '',
            attendees: this.reservation.space?.capacity || 0
        };
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

    // Calendar & Availability Logic
    async fetchMonthAvailability() {
        if (!this.reservation?.space?.uuid) return;

        const start = startOfMonth(this.viewDate);
        const end = endOfMonth(this.viewDate);

        // Backend requires start_date >= today
        const now = startOfDay(new Date());
        const apiStart = isBefore(start, now) ? now : start;

        const startStr = this.formatDate(apiStart);
        const endStr = this.formatDate(end);

        try {
            const slots = await this.spacesService.checkAvailability(this.reservation.space.uuid, startStr, endStr);

            this.events = slots.map((slot: any) => {
                const [year, month, day] = slot.event_date.split('-').map(Number);
                const [startHour, startMinute] = slot.start_time.split(':').map(Number);
                const [endHour, endMinute] = slot.end_time.split(':').map(Number);

                return {
                    start: new Date(year, month - 1, day, startHour, startMinute),
                    end: new Date(year, month - 1, day, endHour, endMinute),
                    title: 'Ocupado',
                    color: { primary: '#ef4444', secondary: '#fca5a5' },
                    allDay: false,
                    draggable: false,
                    resizable: { beforeStart: false, afterEnd: false },
                };
            });

            this.updateCalendarEvents(); // Re-apply selection visual
            this.refresh.next();

            if (this.startDate) {
                const selectedDateStr = this.formatDate(this.startDate);
                if (selectedDateStr >= startStr && selectedDateStr <= endStr) {
                    this.availableSlots = slots.filter((s: any) => s.event_date === selectedDateStr);
                }
            }

        } catch (error) {
            console.error('Error fetching availability', error);
        }
    }

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        if (!isSameMonth(date, this.viewDate)) return;

        // Validate past dates
        if (isBefore(date, startOfDay(new Date()))) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se pueden seleccionar fechas pasadas' });
            return;
        }

        // Just select the single date for now (unless we want range editing?)
        // Assuming single day reservation edit for now as per current simple form
        this.startDate = date;
        this.selectedDateStr = this.formatDate(date);
        this.editForm.event_date = this.selectedDateStr;

        // Reset times if date changes? Maybe keep them if valid?
        // Let's reset availability checking
        this.checkAvailability();

        this.updateCalendarEvents();
        this.refresh.next();
    }

    updateCalendarEvents() {
        // Remove old selection
        this.events = this.events.filter(e => e.meta !== 'selection');

        if (this.startDate) {
            this.events.push({
                start: startOfDay(this.startDate),
                end: endOfDay(this.startDate),
                title: 'Seleccionado',
                color: { primary: '#10b981', secondary: '#d1fae5' },
                allDay: true,
                meta: 'selection',
                draggable: false,
                resizable: { beforeStart: false, afterEnd: false }
            });
        }
    }

    async checkAvailability() {
        if (!this.reservation?.space?.uuid || !this.startDate) return;

        try {
            const dateStr = this.formatDate(this.startDate);
            const slots = await this.spacesService.checkAvailability(
                this.reservation.space.uuid,
                dateStr,
                dateStr
            );
            this.availableSlots = slots;
        } catch (error) {
            console.error('Error checking availability', error);
        }
    }

    isSlotOccupied(time: string): boolean {
        // Check if day is today and time passed
        if (this.startDate && isSameDay(this.startDate, new Date())) {
            const now = new Date();
            const [hours, minutes] = time.split(':').map(Number);
            const slotDate = new Date(this.startDate);
            slotDate.setHours(hours, minutes, 0, 0);
            if (isBefore(slotDate, now)) return true;
        }

        // Exclude CURRENT reservation from "Occupied" check if we are editing same day/time
        // Actually, checkAvailability returns ALL reservations. 
        // We must exclude the current reservation being edited from the conflict check.
        // We can do this by filtering `availableSlots` to exclude `this.reservation.uuid`

        const myResId = this.reservation?.uuid;

        if (!this.availableSlots) return false;

        const timeParts = time.split(':').map(Number);
        const timeMinutes = timeParts[0] * 60 + timeParts[1];

        return this.availableSlots.some((slot: any) => {
            // Ignore OWN reservation slots
            if (slot.reservation_uuid === myResId || slot.uuid === myResId) return false; // Check ID match

            const start = slot.start_time.split(':').map(Number);
            const end = slot.end_time.split(':').map(Number);
            const startMinutes = start[0] * 60 + start[1];
            const endMinutes = end[0] * 60 + end[1];

            return timeMinutes >= startMinutes && timeMinutes < endMinutes;
        });
    }

    getSlotClasses(slot: string): string {
        const isOccupied = this.isSlotOccupied(slot);
        if (isOccupied) return 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200';

        const isSelected = this.editForm.start_time === slot || this.editForm.end_time === slot;
        if (isSelected) return 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105';

        return 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer shadow-sm';
    }

    selectTime(time: string) {
        if (this.isSlotOccupied(time)) return;

        if (!this.editForm.start_time || (this.editForm.start_time && this.editForm.end_time)) {
            this.editForm.start_time = time;
            this.editForm.end_time = '';
        } else {
            // Validate order
            if (time <= this.editForm.start_time) {
                this.editForm.start_time = time;
                this.editForm.end_time = '';
            } else {
                this.editForm.end_time = time;
            }
        }
    }

    closeOpenMonthViewDay() {
        this.activeDayIsOpen = false;
        this.fetchMonthAvailability();
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async saveReview() {
        if (!this.reservation?.space?.uuid) return;

        try {
            const reviewData = {
                rating: this.reviewForm.rating,
                comment: this.reviewForm.comment
            };

            await this.spacesService.addComment(this.reservation.space.uuid, reviewData);

            this.messageService.add({ severity: 'success', summary: 'Gracias', detail: 'Tu reseña ha sido enviada con éxito.' });
            this.close();
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la reseña.' });
        }
    }

    cancelEdit() {
        this.isEditing = false;
    }

    async saveReservation() {
        if (!this.reservation) return;

        try {
            const updateData: Partial<Reservation> = {
                event_name: this.editForm.event_name,
                event_date: this.editForm.event_date,
                start_time: this.editForm.start_time,
                end_time: this.editForm.end_time,
            };

            await this.reservationService.updateReservation(this.reservation.uuid, updateData);

            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva actualizada' });
            this.isEditing = false;
            this.onUpdate.emit();

            // Update local object deeply to reflect changes immediately
            this.reservation = {
                ...this.reservation,
                event_name: updateData.event_name!,
                event_date: updateData.event_date!,
                start_time: updateData.start_time!,
                end_time: updateData.end_time!
            };

        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al actualizar' });
        }
    }

    confirmCancellation() {
        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
            header: 'Confirmar Cancelación',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.cancelReservation();
            }
        });
    }

    async cancelReservation() {
        if (!this.reservation) return;

        if (!this.canEdit(this.reservation)) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se puede cancelar con menos de 1 hora de anticipación' });
            return;
        }

        try {
            await this.reservationService.cancelReservation(this.reservation.uuid);
            this.messageService.add({ severity: 'success', summary: 'Cancelada', detail: 'Reserva cancelada exitosamente' });
            this.onUpdate.emit();
            this.close();
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la reserva' });
        }
    }

    formatTime(time: string | undefined): string {
        if (!time) return '';
        return time.substring(0, 5);
    }

    getStatusColor(status: string | undefined): string {
        switch (status?.toLowerCase()) {
            case 'confirmada':
            case 'active':
                return 'bg-emerald-500';
            case 'completada':
                return 'bg-blue-500';
            case 'cancelada':
                return 'bg-rose-500';
            default:
                return 'bg-slate-500';
        }
    }
}
