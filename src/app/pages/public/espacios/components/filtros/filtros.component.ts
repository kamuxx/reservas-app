import { Component, EventEmitter, Output } from '@angular/core';
import { Filtros } from '@core/spaces';



@Component({
  selector: 'app-filtros',
  imports: [],
  templateUrl: './filtros.component.html',
  styleUrl: './filtros.component.css'
})


export class FiltrosComponent {

  @Output() applyFilters = new EventEmitter<Filtros>();

  tipos: any[] = [
    {
      key: 'Sala Juntas',
      value: 'Sala de Juntas'
    },
    {
      key: 'Auditorio',
      value: 'Auditorio'
    },
    {
      key: 'Espacio Abierto',
      value: 'Espacio Abierto'
    },
    {
      key: 'Laboratorio',
      value: 'Laboratorio'
    }
  ];

  amenidades: any[] = [
    {
      key: 'wifi',
      value: 'WiFi Alta Velocidad',
      icon: 'wifi'
    },
    {
      key: 'proyector',
      value: 'Proyector 4K',
      icon: 'projector'
    },
    {
      key: 'cafe',
      value: 'Café Gourmet',
      icon: 'coffee'
    },
    {
      key: 'pizarra',
      value: 'Pizarra/Whiteboard',
      icon: 'board'
    },
    {
      key: 'videoconferencia',
      value: 'Equipo de Videoconferencia',
      icon: 'video'
    },
    {
      key: 'aire',
      value: 'Aire Acondicionado',
      icon: 'air'
    },
    {
      key: 'estacionamiento',
      value: 'Estacionamiento',
      icon: 'parking'
    },
    {
      key: 'catering',
      value: 'Servicio de Catering',
      icon: 'food'
    }
  ];

  minDate: string = new Date().toISOString().split('T')[0];

  filtros: Filtros = {
    tipo: '',
    precio: 0,
    capacidad: 0,
    amenidades: [],
    fecha: ''
  };

  setFilters(event: Event, key: string) {
    const element = event.target as HTMLInputElement;
    const field = key as keyof Filtros;

    console.log(element.value, field);

    if (field === 'capacidad' || field === 'precio') {
      this.filtros[field] = Number(element.value);
    } else if (field === 'tipo') {
      this.filtros[field] = element.checked ? element.value : '';
    } else if (field === 'fecha') {
      this.filtros[field] = element.value;
      // Actualizar el display de la fecha
      const dateDisplay = document.getElementById('date-display');
      if (dateDisplay && element.value) {
        const date = new Date(element.value);
        const formattedDate = date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        dateDisplay.textContent = formattedDate;
      } else if (dateDisplay) {
        dateDisplay.textContent = 'Selecciona una fecha';
      }
    } else {
      if (this.filtros.amenidades.includes(element.value) || !element.checked) {
        this.filtros.amenidades.splice(this.filtros.amenidades.indexOf(element.value), 1);
      } else {
        this.filtros.amenidades.push(element.value);
      }
    }

    console.log(this.filtros);

    this.applyFilters.emit(this.filtros);
  }

  clearFilters() {
    // Reset filtros a valores iniciales
    this.filtros = {
      tipo: '',
      precio: 0,
      capacidad: 0,
      amenidades: [],
      fecha: ''
    };

    // Limpiar inputs del formulario
    const capacityRange = document.getElementById('capacity-range') as HTMLInputElement;
    const priceRange = document.getElementById('price-range') as HTMLInputElement;
    const dateFilter = document.getElementById('date-filter') as HTMLInputElement;
    const dateDisplay = document.getElementById('date-display');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    if (capacityRange) capacityRange.value = '10';
    if (priceRange) priceRange.value = '100';
    if (dateFilter) dateFilter.value = '';
    if (dateDisplay) dateDisplay.textContent = 'Selecciona una fecha';

    checkboxes.forEach((checkbox) => {
      (checkbox as HTMLInputElement).checked = false;
    });

    // Emitir filtros vacios
    this.applyFilters.emit(this.filtros);
  }

}
