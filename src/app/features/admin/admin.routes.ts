import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminSpacesComponent } from './pages/spaces/admin-spaces.component';
import { AdminReservationsComponent } from './pages/reservations/admin-reservations.component';
import { AdminReservationDetailComponent } from './pages/reservations/admin-reservation-detail.component';
import { AdminPricingRulesComponent } from './pages/config/pricing-rules/admin-pricing-rules.component';
import { AdminStatusesComponent } from './pages/config/statuses/admin-statuses.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        canActivate: [adminGuard],
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'espacios', component: AdminSpacesComponent },
            { path: 'reservas', component: AdminReservationsComponent },
            { path: 'reservas/:uuid', component: AdminReservationDetailComponent },
            {
                path: 'config',
                children: [
                    { path: 'pricing-rules', component: AdminPricingRulesComponent },
                    { path: 'statuses', component: AdminStatusesComponent },
                    {
                        path: 'change-password',
                        loadComponent: () => import('../../pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
                    }
                ]
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
