import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { SpacesService } from '../../../services/spaces.service';
import { Space } from '../../../core/models';

@Component({
  selector: 'app-admin-spaces',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    TextareaModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './spaces.component.html',
  styleUrl: './spaces.component.css'
})
export class SpacesComponent implements OnInit {
  spaces: Space[] = [];
  loading = true;
  spaceDialog = false;
  spaceDialogHeader = '';
  isEdit = false;
  currentSpace: Partial<Space> = {};
  uploadedFiles: any[] = [];

  constructor(
    private spacesService: SpacesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSpaces();
  }

  async loadSpaces(): Promise<void> {
    this.loading = true;
    try {
      this.spaces = await this.spacesService.getAll();            
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los espacios',
        life: 3000
      });
    } finally {
      this.loading = false;
    }
  }

  openNewSpaceDialog(): void {
    this.currentSpace = {
      is_active: true,
      capacity: 10
    };
    this.uploadedFiles = [];
    this.isEdit = false;
    this.spaceDialogHeader = 'Nuevo Espacio';
    this.spaceDialog = true;
  }

  openEditSpaceDialog(space: Space): void {
    this.currentSpace = { ...space };
    this.isEdit = true;
    this.spaceDialogHeader = 'Editar Espacio';
    this.spaceDialog = true;
  }

  hideDialog(): void {
    this.spaceDialog = false;
    this.currentSpace = {};
    this.uploadedFiles = [];
  }

  async saveSpace(): Promise<void> {
    this.loading = true;
    try {
      this.hideDialog();
      this.loadSpaces();
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Operación realizada correctamente',
        life: 3000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el espacio',
        life: 3000
      });
    } finally {
      this.loading = false;
    }
  }

  confirmDelete(space: Space): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar el espacio "' + space.name + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteSpace(space)
    });
  }

  async deleteSpace(space: Space): Promise<void> {
    if (!space.uuid) return;

    this.loading = true;
    try {
      await this.spacesService.delete(space.uuid);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Espacio eliminado correctamente',
        life: 3000
      });
      this.loadSpaces();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el espacio',
        life: 3000
      });
    } finally {
      this.loading = false;
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'p-tag-success' : 'p-tag-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'pi pi-check-circle' : 'pi pi-times-circle';
  }
}