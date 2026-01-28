import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    this.initializeAuthFromStorage();
  }

  private initializeAuthFromStorage(): void {
    const token = localStorage.getItem(environment.jwtKey);

    if (token) {
      this.isLoggedInSubject.next(true);
      const userStr = localStorage.getItem('currentUser');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.getCurrentUser().catch(() => this.logout());
        }
      } else {
        // Si tenemos token pero no usuario, intentamos obtenerlo
        this.getCurrentUser().catch(() => this.logout());
      }
    }
  }

  login(credentials: LoginRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/api/auth/login`, credentials)
        .pipe(
          tap(response => {
            // Check for token and user in response
            const token = response.access_token || response.data?.access_token;
            const user = response.user || response.data?.user;

            if (token) {
              this.storeToken(token);

              if (user) {
                this.setCurrentUser(user);
              } else {
                // If user is not provided in login response, fetch it
                this.getCurrentUser().catch(err => console.error('Error fetching user after login:', err));
              }
            }
          })
        )
        .subscribe({
          next: (response) => resolve(response),
          error: (error) => reject(error)
        });
    });
  }

  register(userData: RegisterRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      this.http.post<{ success: boolean, message: string, data: User }>(`${environment.apiUrl}/api/auth/register`, userData)
        .pipe(
          tap(response => {
            this.messageService.add({
              severity: 'success',
              summary: '¡Registro exitoso!',
              detail: response.message,
              life: 3000
            });
          })
        )
        .subscribe({
          next: (response) => resolve(response.data),
          error: (error) => reject(error)
        });
    });
  }

  logout(navigateToLogin: boolean = true): void {
    const token = localStorage.getItem(environment.jwtKey);

    if (token) {
      // Call logout endpoint
      this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: () => {
          this.clearSession(navigateToLogin);
        },
        error: () => {
          // Even if logout fails on server, clear local session
          this.clearSession(navigateToLogin);
        }
      });
    } else {
      this.clearSession(navigateToLogin);
    }
  }

  getCurrentUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      const user = this.currentUserSubject.value;
      if (user) {
        resolve(user);
        return;
      }

      const token = localStorage.getItem(environment.jwtKey);
      if (!token) {
        reject(new Error('No token found'));
        return;
      }

      this.http.get<User>(`${environment.apiUrl}/api/user`)
        .subscribe({
          next: (user) => {
            this.setCurrentUser(user);
            resolve(user);
          },
          error: (error) => {
            console.error('Error fetching current user:', error);
            this.logout();
            reject(error);
          }
        });
    });
  }

  activateAccount(token: string, activationCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/api/auth/activate`, {
        token: token,
        activation_code: activationCode
      })
        .pipe(
          tap(response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cuenta activada',
              detail: 'Tu cuenta ha sido activada exitosamente',
              life: 3000
            });
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
    });
  }

  updateProfile(userData: Partial<User>): Promise<User> {
    return new Promise((resolve, reject) => {
      this.http.put<User>(`${environment.apiUrl}/api/user/profile`, userData)
        .pipe(
          tap(user => {
            this.setCurrentUser(user);
            this.messageService.add({
              severity: 'success',
              summary: 'Perfil actualizado',
              detail: 'Tu perfil ha sido actualizado exitosamente',
              life: 3000
            });
          })
        )
        .subscribe({
          next: (user) => resolve(user),
          error: (error) => reject(error)
        });
    });
  }

  changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/api/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      })
        .pipe(
          tap(response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Contraseña actualizada',
              detail: 'Tu contraseña ha sido actualizada exitosamente',
              life: 3000
            });
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
    });
  }

  forgotPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, { email })
        .pipe(
          tap(response => {
            this.messageService.add({
              severity: 'info',
              summary: 'Correo enviado',
              detail: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña',
              life: 5000
            });
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
    });
  }

  resetPassword(token: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/api/auth/reset-password`, {
        token: token,
        password: password
      })
        .pipe(
          tap(response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Contraseña restablecida',
              detail: 'Tu contraseña ha sido restablecida exitosamente',
              life: 3000
            });
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
    });
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.post<{ available: boolean }>(`${environment.apiUrl}/api/auth/check-email`, { email })
      .pipe(
        map(response => response.available),
        catchError(() => of(true))
      );
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  isAuthenticated(): boolean {
    const isLoggedIn = this.isLoggedInSubject.value && !!localStorage.getItem(environment.jwtKey);
    console.log(isLoggedIn, localStorage.getItem(environment.jwtKey));
    return isLoggedIn;
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtKey);
  }

  storeToken(token: string): void {
    localStorage.setItem(environment.jwtKey, token);
    this.isLoggedInSubject.next(true);
  }

  getUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearSession(navigateToLogin: boolean = true): void {
    localStorage.removeItem(environment.jwtKey);
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);

    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Sesión cerrada',
      detail: 'Has cerrado sesión exitosamente',
      life: 2000
    });
  }
}