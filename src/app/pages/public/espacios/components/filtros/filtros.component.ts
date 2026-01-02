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

  filtros: Filtros = {
    tipo: '',
    precio: 0,
    capacidad: 0,
    servicios: []
  };

  setFilters(event: Event, key: string) {
    const element = event.target as HTMLInputElement;
    const field = key as keyof Filtros;

    console.log(element.value, field);

    if (field === 'capacidad' || field === 'precio') {
      this.filtros[field] = Number(element.value);
    } else if (field === 'tipo') {
      this.filtros[field] = element.checked ? element.value : '';
    }else{

      if(this.filtros.servicios.includes(element.value) || !element.checked){
        this.filtros.servicios.splice(this.filtros.servicios.indexOf(element.value), 1);
      }else{
        this.filtros.servicios.push(element.value);
      }
    }

    console.log(this.filtros);

    this.applyFilters.emit(this.filtros);
  }

}
