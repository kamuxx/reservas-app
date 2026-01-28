import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

interface PricingRule {
    uuid: string;
    name: string;
    hourly_rate: number;
    description?: string;
}

@Component({
    selector: 'app-admin-pricing-rules',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        DialogModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        ConfirmDialogModule,
        InputTextModule,
        InputNumberModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <div class="card p-6">
        <p-toast></p-toast>
        <p-confirmDialog header="Confirmation" width="450px"></p-confirmDialog>

        <div class="flex justify-between items-center mb-4">
             <h1 class="text-2xl font-bold text-gray-800">Reglas de Precios</h1>
             <p-button label="Nueva Regla" icon="pi pi-plus" class="p-button-success" (onClick)="openNew()"></p-button>
        </div>

        <p-table #dt [value]="rules()" [rows]="10" [paginator]="true" [globalFilterFields]="['name','description']"
            [tableStyle]="{'min-width': '50rem'}"
            [rowHover]="true" dataKey="uuid"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries" [showCurrentPageReport]="true"
            [loading]="loading()">
            
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="hourly_rate">Tarifa por Hora <p-sortIcon field="hourly_rate"></p-sortIcon></th>
                    <th pSortableColumn="description">Descripción <p-sortIcon field="description"></p-sortIcon></th>
                    <th>Acciones</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-rule>
                <tr>
                    <td>{{rule.name}}</td>
                    <td>{{rule.hourly_rate | currency}}</td>
                    <td>{{rule.description}}</td>
                    <td>
                        <button pButton pRipple icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" (click)="editRule(rule)"></button>
                        <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-warning" (click)="deleteRule(rule)"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="ruleDialog" [style]="{width: '450px'}" header="Detalles de Regla de Precio" [modal]="true" styleClass="p-fluid">
            <ng-template pTemplate="content">
                <form [formGroup]="form">
                    <div class="field mb-4">
                        <label for="name">Nombre</label>
                        <input type="text" pInputText id="name" formControlName="name" required autofocus />
                        <small class="p-error" *ngIf="submitted && form.controls['name'].errors?.['required']">Nombre es requerido.</small>
                    </div>
                    <div class="field mb-4">
                        <label for="hourly_rate">Tarifa (Hora)</label>
                        <p-inputNumber id="hourly_rate" formControlName="hourly_rate" mode="currency" currency="USD" locale="en-US"></p-inputNumber>
                         <small class="p-error" *ngIf="submitted && form.controls['hourly_rate'].errors?.['required']">Tarifa es requerida.</small>
                    </div>
                    <div class="field mb-4">
                        <label for="description">Descripción</label>
                        <textarea id="description" pInputTextarea formControlName="description" rows="3" cols="20"></textarea>
                    </div>
                </form>
            </ng-template>

            <ng-template pTemplate="footer">
                <button pButton pRipple label="Cancelar" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
                <button pButton pRipple label="Guardar" icon="pi pi-check" class="p-button-text" (click)="saveRule()"></button>
            </ng-template>
        </p-dialog>
    </div>
  `
})
export class AdminPricingRulesComponent implements OnInit {
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    fb = inject(FormBuilder);

    rules = signal<PricingRule[]>([]);
    loading = signal<boolean>(true);
    ruleDialog: boolean = false;
    submitted: boolean = false;
    form!: FormGroup;
    currentRule: Partial<PricingRule> = {};

    ngOnInit() {
        this.initForm();
        this.loadRules();
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            hourly_rate: [0, Validators.required],
            description: ['']
        });
    }

    loadRules() {
        this.loading.set(true);
        // Mock Data
        const mockRules: PricingRule[] = [
            { uuid: '1', name: 'Estándar', hourly_rate: 50, description: 'Tarifa base para espacios comunes' },
            { uuid: '2', name: 'Premium', hourly_rate: 100, description: 'Tarifa para salas ejecutivas' },
            { uuid: '3', name: 'Descuento Miembros', hourly_rate: 30, description: 'Para miembros registrados' }
        ];
        setTimeout(() => {
            this.rules.set(mockRules);
            this.loading.set(false);
        }, 600);
    }

    openNew() {
        this.currentRule = {};
        this.submitted = false;
        this.form.reset();
        this.ruleDialog = true;
    }

    editRule(rule: PricingRule) {
        this.currentRule = { ...rule };
        this.form.patchValue(rule);
        this.ruleDialog = true;
    }

    deleteRule(rule: PricingRule) {
        this.confirmationService.confirm({
            message: '¿Eliminar ' + rule.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.rules.update(val => val.filter(r => r.uuid !== rule.uuid));
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Regla Eliminada', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.ruleDialog = false;
        this.submitted = false;
    }

    saveRule() {
        this.submitted = true;
        if (this.form.invalid) return;

        if (this.currentRule.uuid) {
            // Update
            const updated = { ...this.currentRule, ...this.form.value };
            this.rules.update(val => {
                const idx = val.findIndex(r => r.uuid === updated.uuid);
                if (idx !== -1) val[idx] = updated;
                return [...val];
            });
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Regla Actualizada', life: 3000 });
        } else {
            // Create
            const newRule = { uuid: Math.random().toString(36).substr(2, 9), ...this.form.value };
            this.rules.update(val => [...val, newRule]);
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Regla Creada', life: 3000 });
        }
        this.hideDialog();
    }
}
