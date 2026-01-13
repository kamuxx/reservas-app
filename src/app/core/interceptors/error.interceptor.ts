import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

export const errorInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error de conexión: ${error.error.message}`;
        messageService.add({
          severity: 'error',
          summary: 'Error de conexión',
          detail: error.error.message,
          life: 5000
        });
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = 'Sesión expirada';
            messageService.add({
              severity: 'warn',
              summary: 'Sesión expirada',
              detail: 'Por favor inicia sesión nuevamente',
              life: 3000
            });
            handleUnauthorized(router);
            break;
          case 403:
            errorMessage = 'No tienes permisos';
            messageService.add({
              severity: 'error',
              summary: 'Acceso denegado',
              detail: 'No tienes permisos para realizar esta acción',
              life: 5000
            });
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'El recurso solicitado no fue encontrado',
              life: 5000
            });
            break;
          case 422:
            errorMessage = 'Error de validación';
            if (error.error?.errors) {
              const errors = error.error.errors;
              const errorMessages = Object.keys(errors).map(key => {
                const fieldErrors = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
                return `${fieldErrors.join(', ')}`;
              });
              
              messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: errorMessages.join(', '),
                life: 8000
              });
            } else {
              messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'Por favor verifica los datos ingresados',
                life: 5000
              });
            }
            break;
          case 429:
            errorMessage = 'Too many requests';
            messageService.add({
              severity: 'warn',
              summary: 'Límite excedido',
              detail: 'Has excedido el límite de solicitudes. Inténtalo más tarde',
              life: 5000
            });
            break;
          case 500:
            errorMessage = 'Error del servidor';
            messageService.add({
              severity: 'error',
              summary: 'Error del servidor',
              detail: 'Ha ocurrido un error interno. Por favor intenta más tarde',
              life: 5000
            });
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Ha ocurrido un error inesperado',
              life: 5000
            });
        }
      }
      
      if (environment.enableDebug) {
        console.error('HTTP Error:', error);
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
};

function handleUnauthorized(router: Router): void {
  // Clear stored token
  localStorage.removeItem(environment.jwtKey);
  
  // Navigate to login page
  router.navigate(['/login']);
}