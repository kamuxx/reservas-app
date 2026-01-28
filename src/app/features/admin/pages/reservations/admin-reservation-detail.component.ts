import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ReservationService } from '../../../../services/reservation.service';
import { Reservation } from '../../../../core/models';

@Component({
    selector: 'app-admin-reservation-detail',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        SkeletonModule,
        TagModule,
        DividerModule
    ],
    template: `
    <div class="card p-6 max-w-6xl mx-auto">
       <button pButton icon="pi pi-arrow-left" label="Volver" class="p-button-text mb-4" (click)="goBack()"></button>

       <div *ngIf="loading(); else content">
           <!-- Skeleton Loading -->
           <div class="flex justify-between items-start mb-6">
                <div>
                   <p-skeleton width="15rem" height="2rem" styleClass="mb-2"></p-skeleton>
                   <p-skeleton width="10rem" height="1rem"></p-skeleton>
                </div>
                <p-skeleton width="8rem" height="2.5rem"></p-skeleton>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <p-card>
                  <p-skeleton width="100%" height="200px"></p-skeleton>
               </p-card>
               <p-card>
                   <p-skeleton width="100%" height="8rem" styleClass="mb-4"></p-skeleton>
                   <p-skeleton width="100%" height="8rem"></p-skeleton>
               </p-card>
           </div>
       </div>

       <ng-template #content>
           <!-- Reservation Content -->
           <div *ngIf="reservation" class="animate-fade-in">
               <div class="flex flex-col md:flex-row justify-between items-start mb-6">
                    <div>
                       <h1 class="text-3xl font-bold text-gray-900 mb-1">Reserva #{{reservation.uuid}}</h1>
                       <p class="text-gray-500">Creada el {{ reservation.created_at }}</p>
                    </div>
                    <p-tag [value]="reservation.status" [severity]="getSeverity(reservation.status)" class="text-lg px-3 py-1"></p-tag>
               </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Col: Space & User -->
                    <div class="lg:col-span-2 space-y-6">
                        <p-card header="Detalles del Espacio">
                            <div class="flex gap-4">
                                <img [src]="reservation.space_image" class="w-32 h-24 object-cover rounded-lg shadow" />
                                <div>
                                    <h3 class="text-xl font-semibold">{{ reservation.space_name }}</h3>
                                    <p class="text-gray-600 flex items-center mt-1"><i class="pi pi-map-marker mr-1"></i> Piso 3, Ala Norte</p>
                                    <p class="text-gray-600 flex items-center mt-1"><i class="pi pi-users mr-1"></i> Capacidad: 12 personas</p>
                                </div>
                            </div>
                        </p-card>

                        <p-card header="Información del Cliente">
                             <div class="flex items-center gap-4">
                                 <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                     {{ reservation.user_initials }}
                                 </div>
                                 <div>
                                     <h3 class="font-semibold text-lg">{{ reservation.user_name }}</h3>
                                     <p class="text-gray-600">{{ reservation.user_email }}</p>
                                     <p class="text-gray-600">{{ reservation.user_phone }}</p>
                                 </div>
                             </div>
                        </p-card>
                    </div>

                    <!-- Right Col: Payment & Timeline -->
                    <div class="space-y-6">
                        <p-card header="Resumen del Pago">
                             <div class="flex justify-between mb-2">
                                 <span class="text-gray-600">Precio Base</span>
                                 <span>\${{ reservation.base_price }}</span>
                             </div>
                             <div class="flex justify-between mb-2">
                                 <span class="text-gray-600">Impuestos</span>
                                 <span>\${{ reservation.tax }}</span>
                             </div>
                             <p-divider></p-divider>
                             <div class="flex justify-between font-bold text-xl">
                                 <span>Total</span>
                                 <span class="text-emerald-600">\${{ reservation.total }}</span>
                             </div>
                              <div class="mt-4">
                                 <p-tag value="Pagado" severity="success" icon="pi pi-check"></p-tag>
                             </div>
                        </p-card>

                         <p-card header="Acciones">
                             <div class="flex flex-col gap-2">
                                 <button pButton label="Aprobar Reserva" class="p-button-success w-full"></button>
                                 <button pButton label="Rechazar" class="p-button-danger p-button-outlined w-full"></button>
                                 <button pButton label="Contactar Cliente" class="p-button-secondary p-button-text w-full" icon="pi pi-envelope"></button>
                             </div>
                         </p-card>
                    </div>
                </div>
           </div>
       </ng-template>
    </div>
  `
})
export class AdminReservationDetailComponent implements OnInit {
    route = inject(ActivatedRoute);
    router = inject(Router);
    reservationService = inject(ReservationService);

    loading = signal(true);
    reservation: any = null;

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['uuid']) {
                this.loadReservation(params['uuid']);
            }
        });
    }

    loadReservation(uuid: string) {
        this.loading.set(true);
        this.reservationService.getReservationById(uuid)
            .then(data => {
                // Map Domain Model to View Model
                this.reservation = {
                    uuid: data.uuid,
                    status: data.status?.name || 'unknown',
                    created_at: data.created_at,
                    space_name: data.space?.name || 'Unknown Space',
                    space_image: data.space?.images?.[0] || 'https://primefaces.org/cdn/primeng/images/demo/product/bamboo-watch.jpg',
                    user_name: data.user?.name || 'Unknown User',
                    user_email: data.user?.email || '',
                    user_phone: data.user?.phone || '',
                    user_initials: data.user?.name ? data.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??',
                    base_price: data.event_price,
                    tax: 0,
                    total: data.event_price
                };
                this.loading.set(false);
            })
            .catch(error => {
                console.error('Error loading reservation', error);
                this.loading.set(false);
            });
    }

    goBack() {
        this.router.navigate(['/admin/reservas']);
    }

    getSeverity(status: string) {
        return (status === 'active' || status === 'confirmada') ? 'success' : 'warning';
    }
}
