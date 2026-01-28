import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarModule, CalendarEvent, CalendarView, CalendarEventAction } from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { SpacesService } from '../../../../services/spaces.service';
import { ReservationService } from '../../../../services/reservation.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="p-6 h-full flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-white">Calendario de Reservas</h1>
         <div class="flex gap-2">
             <div class="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <p-button icon="pi pi-chevron-left" styleClass="p-button-text p-button-sm p-button-rounded" 
                    mwlCalendarPreviousView [view]="view" [(viewDate)]="viewDate" (viewDateChange)="updateSelectedReservations()" pTooltip="Anterior"></p-button>
                <p-button label="Hoy" styleClass="p-button-text p-button-sm mx-1" 
                    mwlCalendarToday [(viewDate)]="viewDate" (viewDateChange)="updateSelectedReservations()"></p-button>
                <p-button icon="pi pi-chevron-right" styleClass="p-button-text p-button-sm p-button-rounded" 
                    mwlCalendarNextView [view]="view" [(viewDate)]="viewDate" (viewDateChange)="updateSelectedReservations()" pTooltip="Siguiente"></p-button>
             </div>
             <div class="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <p-button label="Mes" [styleClass]="view === CalendarView.Month ? 'p-button-success p-button-sm' : 'p-button-text p-button-sm'" 
                    (onClick)="setView(CalendarView.Month)"></p-button>
                <p-button label="Semana" [styleClass]="view === CalendarView.Week ? 'p-button-success p-button-sm mx-1' : 'p-button-text p-button-sm mx-1'" 
                    (onClick)="setView(CalendarView.Week)"></p-button>
                <p-button label="Día" [styleClass]="view === CalendarView.Day ? 'p-button-success p-button-sm' : 'p-button-text p-button-sm'" 
                    (onClick)="setView(CalendarView.Day)"></p-button>
             </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto bg-white rounded-lg p-4 text-gray-800">
        <div [ngSwitch]="view">
          <mwl-calendar-month-view
            *ngSwitchCase="CalendarView.Month"
            [viewDate]="viewDate"
            [events]="events"
            [activeDayIsOpen]="activeDayIsOpen"
            (dayClicked)="dayClicked($event.day)"
            (eventClicked)="handleEvent('Clicked', $event.event)"
          >
          </mwl-calendar-month-view>
          <mwl-calendar-week-view
            *ngSwitchCase="CalendarView.Week"
            [viewDate]="viewDate"
            [events]="events"
            [dayStartHour]="8"
            [dayEndHour]="20"
            (eventClicked)="handleEvent('Clicked', $event.event)"
          >
          </mwl-calendar-week-view>
          <mwl-calendar-day-view
            *ngSwitchCase="CalendarView.Day"
            [viewDate]="viewDate"
            [events]="events"
             [dayStartHour]="8"
            [dayEndHour]="20"
            (eventClicked)="handleEvent('Clicked', $event.event)"
          >
          </mwl-calendar-day-view>
        </div>
      </div>

      <!-- Tabla de Reservas del Día -->
      <div class="mt-6 bg-white rounded-lg p-4 shadow-lg animate-fade-in" *ngIf="selectedReservations.length > 0 || view === CalendarView.Day">
        <div class="flex items-center justify-between mb-3">
             <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i class="pi pi-list text-emerald-600"></i>
                Reservas del {{ viewDate | date:'fullDate' }}
             </h2>
             <span class="text-sm text-gray-500">{{ selectedReservations.length }} reservas encontradas</span>
        </div>
        
        <p-table [value]="selectedReservations" [rowHover]="true" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
                <tr>
                    <th>Horario</th>
                    <th>Espacio</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th style="width: 100px">Acciones</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-reservation>
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="font-medium text-gray-600">
                        {{ reservation.start | date:'HH:mm' }} - {{ reservation.end | date:'HH:mm' }}
                    </td>
                    <td>
                        <span class="font-semibold text-gray-800">{{ reservation.meta.space_name }}</span>
                    </td>
                    <td>
                        <div class="flex flex-col">
                            <span class="font-medium">{{ reservation.meta.user_name }}</span>
                            <span class="text-xs text-gray-500">{{ reservation.meta.user_email }}</span>
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="reservation.meta.status_name" 
                               [severity]="reservation.meta.status_name === 'active' || reservation.meta.status_name === 'confirmada' ? 'success' : 'warning'"
                               [rounded]="true"></p-tag>
                    </td>
                    <td>
                        <div class="flex gap-2">
                             <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm p-button-rounded p-button-info" 
                                (click)="handleEvent('Edited', reservation)" pTooltip="Editar"></button>
                             <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-rounded p-button-danger" 
                                (click)="handleEvent('Deleted', reservation)" pTooltip="Eliminar"></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
      </div>

    </div>
    <p-toast></p-toast>
    <p-confirmDialog header="Confirmación" icon="pi pi-exclamation-triangle"></p-confirmDialog>
  `,
  styles: [`
    :host {
        display: block;
        height: 100%;
    }
    /* Fix for event actions visibility */
    ::ng-deep .cal-event-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  `]
})
export class AdminReservationsComponent implements OnInit {
  spacesService = inject(SpacesService);
  reservationService = inject(ReservationService);
  router = inject(Router);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  selectedReservations: CalendarEvent[] = [];

  events: CalendarEvent[] = [];
  refresh = new Subject<void>();

  actions: CalendarEventAction[] = [
    {
      label: '<i class="pi pi-pencil text-blue-500 mx-1"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }) => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="pi pi-trash text-red-500 mx-1"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }) => {
        this.handleEvent('Deleted', event);
      },
    },
  ];

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.spacesService.getAllReservations().then(data => {
      this.events = data.map(event => ({
        ...event,
        actions: this.actions
      }));
      this.updateSelectedReservations();
    });
  }

  updateSelectedReservations() {
    this.selectedReservations = this.events.filter(event =>
      isSameDay(event.start, this.viewDate)
    );
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
      this.updateSelectedReservations();
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    if (action === 'Edited') {
      if (event.meta?.reservation_uuid) {
        this.router.navigate(['/admin/reservas', event.meta.reservation_uuid]);
      }
    } else if (action === 'Deleted') {
      this.confirmDelete(event);
    } else {
      // Clicked
      if (event.meta?.reservation_uuid) {
        this.router.navigate(['/admin/reservas', event.meta.reservation_uuid]);
      }
    }
  }

  confirmDelete(event: CalendarEvent) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar esta reserva?',
      accept: () => {
        this.deleteReservation(event);
      }
    });
  }

  deleteReservation(event: CalendarEvent) {
    if (event.meta?.reservation_uuid) {
      // Assuming delete endpoint works generally with reservation uuid
      this.reservationService.cancelReservation(event.meta.reservation_uuid)
        .then(() => {
          this.events = this.events.filter((iEvent) => iEvent !== event);
          this.messageService.add({ severity: 'success', summary: 'Reserva eliminada', detail: 'La reserva ha sido eliminada correctamente' });
        })
        .catch(err => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la reserva' });
        });
    }
  }
}
