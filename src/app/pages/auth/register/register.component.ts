import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, map, catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models';

/**
 * Regex for E.164 phone number validation.
 * Allows optional '+' prefix followed by 1-15 digits.
 */
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

/**
 * Regex for Strong Password.
 * Requires at least one lowercase letter, one uppercase letter, and one digit.
 */
const PASSWORD_STRENGTH_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    MessagesModule,
    ProgressBarModule,
    CardModule,
    DividerModule,
    ToastModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailAvailabilityValidator()]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_STRENGTH_PATTERN)]],
      password_confirmation: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('password_confirmation')?.value;

    if (password !== confirmPassword) {
      form.get('password_confirmation')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  emailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return this.authService.checkEmailAvailability(control.value).pipe(
        map(isAvailable => (isAvailable ? null : { emailTaken: true })),
        catchError(() => of(null))
      );
    };
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    const registerData: RegisterRequest = this.registerForm.value;

    this.authService.register(registerData)
      .then(() => this.handleRegistrationSuccess())
      .catch((error) => this.handleRegistrationError(error));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private handleRegistrationSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: '¡Registro exitoso!',
      detail: 'Redirigiendo al login...',
      life: 3000
    });

    // "Reloj de arena digital" (Timer)
    setTimeout(() => this.router.navigate(['/login']), 2000);
  }

  private handleRegistrationError(error: any): void {
    this.isLoading = false;
    let errorMsg = 'Error al registrar usuario. Intenta nuevamente.';

    // Check for specific error status
    if (error.status === 422) {
      errorMsg = error.error?.errors?.email
        ? 'Este email ya está registrado'
        : 'Error de validación. Por favor revisa los datos.';
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 3000
    });
  }

  // Getters for template access
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }

  getPasswordStrength(): { color: string; text: string } {
    const pwd = this.password?.value;
    if (!pwd) return { color: '#94a3b8', text: '' };

    if (pwd.length < 8) return { color: '#ef4444', text: 'Débil' };
    if (pwd.length < 12) return { color: '#f59e0b', text: 'Media' };
    return { color: '#10b981', text: 'Fuerte' };
  }
}