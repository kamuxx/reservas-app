import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  changePasswordForm: FormGroup;
  loading = false;

  constructor() {
    this.changePasswordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('new_password');
    const confirmPassword = control.get('confirm_password');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.changePasswordForm.valid) {
      this.loading = true;
      const { current_password, new_password, confirm_password } = this.changePasswordForm.value;

      try {
        await this.authService.changePassword(current_password, new_password, confirm_password);
        this.changePasswordForm.reset();
        // Optional: Redirect or just show success (handled by service/toast)
      } catch (error: any) {
        // Error handling is partly done in service but we can show specific form errors if backend returns them
        console.error('Error changing password', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar la contraseña. Verifique su contraseña actual.'
        });
      } finally {
        this.loading = false;
      }
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  get f() {
    return this.changePasswordForm.controls;
  }
}
