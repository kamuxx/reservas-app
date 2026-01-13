import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from "@angular/router";
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  user$: Observable<User | null> | undefined; // Inicializamos como undefined o lo asignamos en el constructor
  isLoggedIn$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.user$ = this.authService.getUser();
  }

  logout(): void {
    if (this.router.url.includes('mis-reservas')) {
      this.authService.logout(false);
      this.router.navigate(['/']);
    } else {
      this.authService.logout(false);
    }
  }
}
