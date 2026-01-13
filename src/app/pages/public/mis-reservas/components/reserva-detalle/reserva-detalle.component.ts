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
        ToastModule
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

    constructor(
        private reservationService: ReservationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.isEditing = false; // Reset edit mode on open
            if (!this.reservation && this.reservationId) {
                this.loadReservation(this.reservationId);
            }
        }
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
            this.editForm = {
                event_name: this.reservation.event_name,
                event_date: this.reservation.event_date,
                start_time: this.reservation.start_time ? this.reservation.start_time.substring(0, 5) : '',
                end_time: this.reservation.end_time ? this.reservation.end_time.substring(0, 5) : '',
                attendees: this.reservation.space?.capacity || 0
            };
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se puede editar con menos de 1 hora de anticipación' });
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
