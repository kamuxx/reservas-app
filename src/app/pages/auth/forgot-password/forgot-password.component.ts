import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        MessagesModule,
        ToastModule,
        RouterLink
    ],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
    forgotForm!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotForm.invalid || this.isLoading) {
            return;
        }

        this.isLoading = true;
        const email = this.forgotForm.value.email;

        this.authService.forgotPassword(email)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Correo enviado',
                    detail: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                    life: 5000
                });
                setTimeout(() => this.router.navigate(['/login']), 3000);
            })
            .catch((error) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No pudimos enviar el correo. Verifica que la dirección sea correcta o inténtalo más tarde.',
                    life: 3000
                });
            });
    }

    get email() { return this.forgotForm.get('email'); }
}
