import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TieredMenuModule,
    MenubarModule,
    TooltipModule,
    SidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  readonly sidebarVisible = signal<boolean>(false);
  readonly currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/admin/dashboard']
    },
    {
      label: 'Espacios',
      icon: 'pi pi-building',
      routerLink: ['/admin/espacios']
    },
    {
      label: 'Reservas',
      icon: 'pi pi-calendar',
      routerLink: ['/admin/reservas']
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Reglas de Precios',
          icon: 'pi pi-tag',
          routerLink: ['/admin/config/pricing-rules']
        },
        {
          label: 'Estados',
          icon: 'pi pi-list',
          routerLink: ['/admin/config/statuses']
        }
      ]
    }
  ];

  readonly navbarItems: MenuItem[] = [
    {
      label: 'Mi Cuenta',
      icon: 'pi pi-user',
      items: [
        {
          label: 'Cambio de Contraseña',
          icon: 'pi pi-lock',
          routerLink: ['/admin/config/change-password']
        },
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ]
    }
  ];

  toggleSidebar(): void {
    this.sidebarVisible.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }

  get userName(): string {
    return this.currentUser()?.name ?? 'Administrador';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }
}
