import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');

    this.loginForm = this.fb.group({
      email: [savedEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [!!savedEmail]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    if (this.loginForm.value.remember) {
      localStorage.setItem('rememberedEmail', loginData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(loginData)
      .then((response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Login exitoso',
          detail: '¡Bienvenido de vuelta!',
          life: 3000
        });

        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/espacios';
          this.router.navigate([returnUrl]);          
        }, 500);
      })
      .catch((error) => {
        this.isLoading = false;

        let errorMsg = 'Email o contraseña incorrectos';
        if (error.status === 401) {
          errorMsg = 'Credenciales inválidas';
        } else if (error.status === 403) {
          errorMsg = 'Cuenta deshabilitada. Contacta al administrador';
        } else if (error.status === 422) {
          errorMsg = 'Datos inválidos';
        }

        this.errorMessage = errorMsg;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg,
          life: 3000
        });
      });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  get errorMessages() {
    return this.errorMessage
      ? [{ severity: 'error', detail: this.errorMessage }]
      : [];
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.messageService.add({
      severity: 'info',
      summary: 'Recuperación de Contraseña',
      detail: 'Esta funcionalidad estará disponible próximamente. Contacta al administrador si necesitas ayuda.',
      life: 5000
    });
  }
}
