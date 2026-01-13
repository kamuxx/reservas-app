import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    // Auth routes (standalone)
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },

    // Public layout routes
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'espacios',
                pathMatch: 'full'
            },
            {
                path: 'espacios',
                loadComponent: () => import('./pages/public/espacios/espacios.component').then(m => m.EspaciosComponent)
            },
            {
                path: 'espacios/:id',
                loadComponent: () => import('./pages/public/espacio-detalle/espacio-detalle.component').then(m => m.EspacioDetalleComponent)
            },
            {
                path: 'mis-reservas',
                loadComponent: () => import('./pages/public/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
                canActivate: [authGuard]
            }
        ]
    },

    // Admin layout routes
    {
        path: 'admin',
        loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: '',
                redirectTo: 'espacios',
                pathMatch: 'full'
            },
            {
                path: 'espacios',
                loadComponent: () => import('./pages/admin/spaces/spaces.component').then(m => m.SpacesComponent)
            }
        ]
    },

    // Catch-all route
    {
        path: '**',
        redirectTo: 'espacios'
    }
];
