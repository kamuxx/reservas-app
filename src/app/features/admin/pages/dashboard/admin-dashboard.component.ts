import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, DashboardStats } from '../../../../core/services/dashboard.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ChartModule, ButtonModule, SkeletonModule],
    template: `
    <div class="p-6">
      <div class="mb-6 flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-white">Dashboard</h1>
            <p class="text-emerald-300">Bienvenido de nuevo, Administrador</p>
        </div>
        <div class="flex gap-2">
            <p-button icon="pi pi-download" label="Exportar Reporte" styleClass="p-button-outlined"></p-button>
            <p-button icon="pi pi-refresh" styleClass="p-button-outlined"></p-button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <!-- Loading State -->
        <ng-template #loadingTpl>
            <div class="col-span-12 md:col-span-6 lg:col-span-3" *ngFor="let i of [1,2,3,4]">
                <div class="p-card p-4 h-full">
                    <div class="flex justify-between items-start mb-4">
                        <p-skeleton width="40%" height="1.2rem"></p-skeleton>
                        <p-skeleton shape="circle" size="3rem"></p-skeleton>
                    </div>
                    <p-skeleton width="60%" height="2.5rem" styleClass="mb-2"></p-skeleton>
                    <p-skeleton width="30%" height="1rem"></p-skeleton>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-8">
               <div class="p-card p-6 h-full">
                   <div class="flex justify-between items-center mb-6">
                        <p-skeleton width="30%" height="1.5rem"></p-skeleton>
                   </div>
                   <p-skeleton width="100%" height="300px"></p-skeleton>
               </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
               <div class="p-card p-6 h-full">
                   <p-skeleton width="40%" height="1.5rem" styleClass="mb-6"></p-skeleton>
                   <div class="flex justify-center">
                        <p-skeleton shape="circle" size="250px"></p-skeleton>
                   </div>
               </div>
            </div>
        </ng-template>

        <ng-container *ngIf="stats$ | async as stats; else loadingTpl">
            <!-- KPI Cards -->
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="bg-gradient-to-br from-blue-500/40 to-blue-600/40 backdrop-blur-md rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-blue-400/30">
                    <div class="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                        <i class="pi pi-building" style="font-size: 8rem;"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="text-blue-100 font-medium text-sm uppercase tracking-wider">Espacios Totales</span>
                                <h2 class="text-4xl font-bold mt-2">{{ stats.totalSpaces || 0 }}</h2>
                            </div>
                            <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <i class="pi pi-building text-xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm text-blue-100">
                           <span class="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">Activo</span>
                           <span>Actualizado ahora</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="bg-gradient-to-br from-orange-400/40 to-orange-500/40 backdrop-blur-md rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-orange-400/30">
                    <div class="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                        <i class="pi pi-calendar-plus" style="font-size: 8rem;"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="text-orange-100 font-medium text-sm uppercase tracking-wider">Reservas</span>
                                <h2 class="text-4xl font-bold mt-2">{{ stats.activeReservations || 0 }}</h2>
                            </div>
                            <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <i class="pi pi-calendar-plus text-xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm text-orange-100">
                             <span class="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">Activo</span>
                             <span>{{ stats.reservationStatus.length ? stats.reservationStatus[0].value : 0 }} Confirmadas</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="bg-gradient-to-br from-emerald-500/40 to-emerald-600/40 backdrop-blur-md rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-emerald-400/30">
                    <div class="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                        <i class="pi pi-dollar" style="font-size: 8rem;"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="text-emerald-100 font-medium text-sm uppercase tracking-wider">Ingresos</span>
                                <h2 class="text-4xl font-bold mt-2">\${{ stats.monthlyRevenue | number }}</h2>
                            </div>
                            <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <i class="pi pi-dollar text-xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center text-sm text-emerald-100">
                            <span class="flex items-center bg-white/20 px-2 py-0.5 rounded text-xs mr-2">
                                <i class="pi pi-arrow-up text-xs mr-1"></i> 15%
                            </span>
                            <span>vs mes pasado</span>
                        </div>
                    </div>
                </div>
            </div>

             <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="bg-gradient-to-br from-purple-500/40 to-purple-600/40 backdrop-blur-md rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-purple-400/30">
                    <div class="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                        <i class="pi pi-chart-pie" style="font-size: 8rem;"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="text-purple-100 font-medium text-sm uppercase tracking-wider">Ocupación</span>
                                <h2 class="text-4xl font-bold mt-2">{{ stats.occupancyRate }}%</h2>
                            </div>
                             <div class="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <i class="pi pi-chart-pie text-xl"></i>
                            </div>
                        </div>
                         <div class="flex items-center text-sm text-purple-100">
                            <span class="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">Prom</span>
                            <span>Promedio Semanal</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="col-span-12 lg:col-span-8">
                <div class="p-card p-6 h-full">
                    <h3 class="text-lg font-semibold text-white mb-6">Ocupación Semanal</h3>
                    <p-chart type="bar" [data]="wsData" [options]="wsOptions" height="300px"></p-chart>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <div class="p-card p-6 h-full">
                    <h3 class="text-lg font-semibold text-white mb-6">Estado de Reservas</h3>
                    <div class="flex justify-center">
                        <p-chart type="doughnut" [data]="pieData" [options]="pieOptions" height="300px"></p-chart>
                    </div>
                </div>
            </div>

             <!-- Recent Activity -->
             <div class="col-span-12">
                <div class="p-card p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold text-white">Actividad Reciente</h3>
                        <p-button label="Ver Todo" styleClass="p-button-text p-button-sm"></p-button>
                    </div>
                    
                    <ul class="list-none p-0 m-0">
                        <li *ngFor="let item of stats.recentActivity; let last = last" 
                            class="flex items-center py-4 hover:bg-white/5 transition-colors rounded-lg px-2"
                            [ngClass]="{'border-b border-emerald-600/20': !last}">
                            <div class="flex items-center justify-center rounded-full bg-emerald-500/20 w-12 h-12 mr-4 shrink-0 border border-emerald-500/30">
                                <i [class]="item.icon + ' text-emerald-400 text-xl'"></i>
                            </div>
                            <div class="flex-1">
                                <span class="block text-gray-200 font-medium mb-1">{{item.message}}</span>
                                <span class="text-emerald-300 text-sm flex items-center">
                                    <i class="pi pi-clock text-xs mr-1"></i> {{item.time}}
                                </span>
                            </div>
                            <p-button icon="pi pi-chevron-right" styleClass="p-button-text p-button-secondary p-button-rounded"></p-button>
                        </li>
                    </ul>
                </div>
             </div>
        </ng-container>
      </div>
    </div>
  `,
    styles: [`
  `]
})
export class AdminDashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    stats$: Observable<DashboardStats> | undefined;

    wsData: any;
    wsOptions: any;
    pieData: any;
    pieOptions: any;

    ngOnInit() {
        this.stats$ = this.dashboardService.getStats();
        this.initCharts();
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.initWeeklyOccupancyChart(textColor, textColorSecondary, surfaceBorder);
        this.initReservationStatusChart(textColor);
    }

    private initWeeklyOccupancyChart(textColor: string, textColorSecondary: string, surfaceBorder: string) {
        this.wsData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Hours Booked',
                    data: [65, 59, 80, 81, 92, 55, 40],
                    backgroundColor: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#34d399', '#34d399'],
                    borderColor: ['#10b981'],
                    borderWidth: 1
                }
            ]
        };

        this.wsOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { weight: 500 } },
                    grid: { color: surfaceBorder, drawBorder: false }
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        };
    }

    private initReservationStatusChart(textColor: string) {
        this.pieData = {
            labels: ['Confirmed', 'Pending', 'Cancelled'],
            datasets: [
                {
                    data: [60, 25, 15],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    hoverBackgroundColor: ['#34d399', '#fbbf24', '#f87171']
                }
            ]
        };

        this.pieOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }
}
