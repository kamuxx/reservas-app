import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TieredMenuModule,
    MenubarModule,
    BadgeModule,
    OverlayPanelModule,
    TooltipModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  sidebarVisible = true;
  userMenuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeUserMenu();
  }

  private initializeUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/perfil'])
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/admin/settings'])
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout(): void {
    this.authService.logout();
  }

  get userName(): string {
    let currentUser: any = null;
    this.authService.currentUser$.subscribe(user => currentUser = user).unsubscribe();
    return currentUser?.name || 'Administrador';
  }

  get userInitial(): string {
    const name = this.userName;
    return name.charAt(0).toUpperCase();
  }

  get dashboardItems(): any[] {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: '/admin/dashboard'
      },
      {
        label: 'Espacios',
        icon: 'pi pi-building',
        routerLink: '/admin/espacios'
      },
      {
        label: 'Reservas',
        icon: 'pi pi-calendar',
        routerLink: '/admin/reservas'
      }
    ];
  }
}
