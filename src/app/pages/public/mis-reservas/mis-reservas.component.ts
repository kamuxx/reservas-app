import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../core/models';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ReservaDetalleComponent } from './components/reserva-detalle/reserva-detalle.component';

@Component({
    selector: 'app-mis-reservas',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        RouterModule,
        ToastModule,
        ReservaDetalleComponent
    ],
    providers: [MessageService],
    templateUrl: './mis-reservas.component.html',
    styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
    reservations: Reservation[] = [];
    loading: boolean = true;
    activeStatus: string = '';

    // Dialog State
    visible: boolean = false;
    selectedReservation: Reservation | null = null;

    constructor(
        private reservationService: ReservationService,
        private router: Router,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.loadReservations();
    }

    async loadReservations(status?: string) {
        this.loading = true;
        this.activeStatus = status || '';
        try {
            this.reservations = await this.reservationService.getMyReservations(status);
        } catch (error) {
            console.error('Error loading reservations', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las reservas' });
        } finally {
            this.loading = false;
        }
    }

    showDialog(reservation: Reservation) {
        this.selectedReservation = reservation;
        this.visible = true;
    }

    getStatusColor(status: string): string {
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

    formatTime(time: string): string {
        if (!time) return '';
        return time.substring(0, 5);
    }
}
