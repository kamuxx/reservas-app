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
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Status {
    uuid: string;
    name: string;
    type: 'Space' | 'Reservation';
    color: string;
}

@Component({
    selector: 'app-admin-statuses',
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
        DropdownModule,
        TagModule,
        ReactiveFormsModule,
        FormsModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <div class="p-6">
        <p-toast></p-toast>
        <p-confirmDialog header="Confirmación" width="450px"></p-confirmDialog>

        <div class="flex justify-between items-center mb-4">
             <h1 class="text-2xl font-bold text-white">Gestión de Estatus</h1>
             <p-button label="Nuevo Estatus" icon="pi pi-plus" styleClass="p-button-success" (onClick)="openNew()" pTooltip="Crear un nuevo estatus" tooltipPosition="left"></p-button>
        </div>

        <p-table #dt [value]="statuses()" [rows]="10" [paginator]="true" [globalFilterFields]="['name','type']"
            [tableStyle]="{'min-width': '50rem'}"
            [rowHover]="true" dataKey="uuid"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas" [showCurrentPageReport]="true"
            [loading]="loading()">
            
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="type">Tipo <p-sortIcon field="type"></p-sortIcon></th>
                    <th>Color</th>
                    <th>Acciones</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-status>
                <tr>
                    <td>{{status.name}}</td>
                    <td>{{status.type}}</td>
                    <td><p-tag [value]="status.color" [style]="{'background-color': status.color}"></p-tag></td>
                    <td>
                        <p-button icon="pi pi-pencil" styleClass="p-button-rounded p-button-success p-button-text mr-2" (onClick)="editStatus(status)" pTooltip="Editar Estatus" tooltipPosition="top"></p-button>
                        <p-button icon="pi pi-trash" styleClass="p-button-rounded p-button-warning p-button-text" (onClick)="deleteStatus(status)" pTooltip="Eliminar Estatus" tooltipPosition="top"></p-button>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4" class="text-center p-4 text-white/60">No se encontraron estatus.</td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="statusDialog" [style]="{width: '450px'}" header="Detalles del Estatus" [modal]="true" styleClass="p-fluid">
            <ng-template pTemplate="content">
                <form [formGroup]="form">
                    <div class="field mb-4">
                        <label for="name">Nombre</label>
                        <input type="text" pInputText id="name" formControlName="name" required autofocus />
                        <small class="p-error" *ngIf="submitted && form.controls['name'].errors?.['required']">Nombre es requerido.</small>
                    </div>
                     <div class="field mb-4">
                        <label for="type">Tipo</label>
                        <p-dropdown id="type" [options]="types" formControlName="type" placeholder="Seleccione un Tipo"></p-dropdown>
                    </div>
                    <div class="field mb-4">
                        <label for="color">Color (Hex)</label>
                         <input type="text" pInputText id="color" formControlName="color" placeholder="#FFFFFF"/>
                    </div>
                </form>
            </ng-template>

            <ng-template pTemplate="footer">
                <p-button label="Cancelar" icon="pi pi-times" styleClass="p-button-text" (onClick)="hideDialog()"></p-button>
                <p-button label="Guardar" icon="pi pi-check" styleClass="p-button-text" (onClick)="saveStatus()"></p-button>
            </ng-template>
        </p-dialog>
    </div>
  `
})
export class AdminStatusesComponent implements OnInit {
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    fb = inject(FormBuilder);

    statuses = signal<Status[]>([]);
    loading = signal<boolean>(true);
    statusDialog: boolean = false;
    submitted: boolean = false;
    form!: FormGroup;
    currentStatus: Partial<Status> = {};

    types = [
        { label: 'Espacio', value: 'Space' },
        { label: 'Reservación', value: 'Reservation' }
    ];

    ngOnInit() {
        this.initForm();
        this.loadStatuses();
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            type: ['Space', Validators.required],
            color: ['#10b981']
        });
    }

    loadStatuses() {
        this.loading.set(true);
        // Mock Data
        const mockStatuses: Status[] = [
            { uuid: '1', name: 'Activo', type: 'Space', color: '#10b981' },
            { uuid: '2', name: 'Inactivo', type: 'Space', color: '#ef4444' },
            { uuid: '3', name: 'Mantenimiento', type: 'Space', color: '#f59e0b' },
            { uuid: '4', name: 'Confirmada', type: 'Reservation', color: '#3b82f6' },
            { uuid: '5', name: 'Pendiente', type: 'Reservation', color: '#6366f1' }
        ];
        setTimeout(() => {
            this.statuses.set(mockStatuses);
            this.loading.set(false);
        }, 600);
    }

    openNew() {
        this.currentStatus = {};
        this.submitted = false;
        this.form.reset({ type: 'Space', color: '#10b981' });
        this.statusDialog = true;
    }

    editStatus(status: Status) {
        this.currentStatus = { ...status };
        this.form.patchValue(status);
        this.statusDialog = true;
    }

    deleteStatus(status: Status) {
        this.confirmationService.confirm({
            message: '¿Eliminar ' + status.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.statuses.update(val => val.filter(s => s.uuid !== status.uuid));
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Estatus Eliminado', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.statusDialog = false;
        this.submitted = false;
    }

    saveStatus() {
        this.submitted = true;
        if (this.form.invalid) return;

        if (this.currentStatus.uuid) {
            // Update
            const updated = { ...this.currentStatus, ...this.form.value };
            this.statuses.update(val => {
                const idx = val.findIndex(s => s.uuid === updated.uuid);
                if (idx !== -1) val[idx] = updated;
                return [...val];
            });
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Estatus Actualizado', life: 3000 });
        } else {
            // Create
            const newStatus = { uuid: Math.random().toString(36).substr(2, 9), ...this.form.value };
            this.statuses.update(val => [...val, newStatus]);
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Estatus Creado', life: 3000 });
        }
        this.hideDialog();
    }
}
