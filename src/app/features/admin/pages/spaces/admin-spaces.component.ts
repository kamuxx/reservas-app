import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { SpacesService } from '../../../../services/spaces.service';
import { Space } from '../../../../core/models';

@Component({
    selector: 'app-admin-spaces',
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
        DropdownModule,
        FileUploadModule,
        TagModule,
        SkeletonModule,
        TooltipModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-spaces.component.html',
    styleUrls: ['./admin-spaces.component.css']
})
export class AdminSpacesComponent implements OnInit {
    spacesService = inject(SpacesService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    fb = inject(FormBuilder);
    router = inject(Router);

    spaces = signal<Space[]>([]);
    loading = signal<boolean>(true);
    spaceDialog: boolean = false;
    submitted: boolean = false;
    form!: FormGroup;

    currentSpace: Partial<Space> = {};

    // Opciones para dropdowns (placeholder para futuro)
    spaceTypes = [
        { name: 'Sala de Reuniones', id: 'meeting_room' },
        { name: 'Oficina Privada', id: 'private_office' },
        { name: 'Espacio Abierto', id: 'open_space' },
        { name: 'Auditorio', id: 'auditorium' }
    ];

    statusOptions = [
        { name: 'Activo', id: 'active' },
        { name: 'Mantenimiento', id: 'maintenance' },
        { name: 'Inactivo', id: 'inactive' }
    ];

    ngOnInit() {
        this.initForm();
        this.loadSpaces();
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            capacity: [1, [Validators.required, Validators.min(1)]],
            // Add other fields: type, status, images, etc.
        });
    }

    loadSpaces() {
        this.loading.set(true);
        this.spacesService.getAllSpacesAdmin().then(data => {
            this.spaces.set(data);
            this.loading.set(false);
        }).catch(err => {
            this.loading.set(false);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar espacios' });
        });
    }

    openNew() {
        this.currentSpace = {};
        this.submitted = false;
        this.form.reset();
        this.spaceDialog = true;
    }

    editSpace(space: Space) {
        this.currentSpace = { ...space };
        this.form.patchValue({
            name: space.name,
            description: space.description,
            capacity: space.capacity
        });
        this.spaceDialog = true;
    }

    deleteSpace(space: Space) {
        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas eliminar ' + space.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.spacesService.delete(space.uuid).then(() => {
                    this.spaces.update(val => val.filter(val => val.uuid !== space.uuid));
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Espacio Eliminado', life: 3000 });
                });
            }
        });
    }

    hideDialog() {
        this.spaceDialog = false;
        this.submitted = false;
    }

    saveSpace() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        const formValues = this.form.value;

        if (this.currentSpace.uuid) {
            // Update
            const updateData = { ...this.currentSpace, ...formValues };
            this.spacesService.update(this.currentSpace.uuid, updateData).then(updated => {
                const index = this.spaces().findIndex(s => s.uuid === updated.uuid);
                if (index !== -1) {
                    const newSpaces = [...this.spaces()];
                    newSpaces[index] = updated;
                    this.spaces.set(newSpaces);
                }
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Espacio Actualizado', life: 3000 });
                this.hideDialog();
            });
        } else {
            // Create
            this.spacesService.create(formValues).then(newSpace => {
                this.spaces.update(val => [...val, newSpace]);
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Espacio Creado', life: 3000 });
                this.hideDialog();
            });
        }
    }

    viewReservations(space: Space) {
        this.router.navigate(['/admin/reservas'], { queryParams: { spaceId: space.uuid } });
    }

    onGlobalFilter(event: Event, dt: any): void {
        const inputElement = event.target as HTMLInputElement;
        dt.filterGlobal(inputElement.value, 'contains');
    }

    getSeverity(status: string | undefined) {
        switch (status) {
            case 'Activo':
                return 'success';
            case 'Mantenimiento':
                return 'warning';
            case 'Inactivo':
                return 'danger';
            default:
                return 'info';
        }
    }
}
