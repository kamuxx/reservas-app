import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardStats {
    totalSpaces: number;
    activeReservations: number;
    monthlyRevenue: number;
    occupancyRate: number;
    weeklyOccupancy: { day: string, value: number }[];
    reservationStatus: { status: string, value: number }[];
    recentActivity: { id: number, message: string, time: string, icon: string }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private mockStats: DashboardStats = {
        totalSpaces: 15,
        activeReservations: 32,
        monthlyRevenue: 12450,
        occupancyRate: 85,
        weeklyOccupancy: [
            { day: 'Mon', value: 65 },
            { day: 'Tue', value: 59 },
            { day: 'Wed', value: 80 },
            { day: 'Thu', value: 81 },
            { day: 'Fri', value: 92 },
            { day: 'Sat', value: 55 },
            { day: 'Sun', value: 40 }
        ],
        reservationStatus: [
            { status: 'Confirmed', value: 60 },
            { status: 'Pending', value: 25 },
            { status: 'Cancelled', value: 15 }
        ],
        recentActivity: [
            { id: 1, message: 'New reservation for Space A by John Doe', time: '2 mins ago', icon: 'pi pi-calendar-plus' },
            { id: 2, message: 'Space B details updated', time: '27 mins ago', icon: 'pi pi-pencil' },
            { id: 3, message: 'Reservation #123 cancelled', time: '2 hours ago', icon: 'pi pi-times-circle' },
            { id: 4, message: 'Weekly report generated', time: '1 day ago', icon: 'pi pi-file' }
        ]
    };

    /**
     * Get Dashboard Statistics (MOCK).
     * NOTE: No backend endpoint defined for stats yet.
     * Keeping as mock for UI demonstration.
     */
    getStats(): Observable<DashboardStats> {
        console.log('MOCK getStats');
        return of(this.mockStats);
    }
}
