import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {
                path:'',
                redirectTo:'espacios', 
                pathMatch:'full'
            },
            {
                path: 'espacios',
                loadComponent: ()=> import('./pages/public/espacios/espacios.component').then(m => m.EspaciosComponent)
            }
        ]
    }
];
