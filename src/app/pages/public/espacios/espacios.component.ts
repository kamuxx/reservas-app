import { Component, OnInit } from '@angular/core';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { SpaceCardComponent } from './components/space-card/space-card.component';
import { SpacesService } from '../../../services/spaces.service';
import { Filtros } from '@core/spaces';

@Component({
  selector: 'app-espacios',
  standalone: true,
  imports: [FiltrosComponent, SpaceCardComponent],
  templateUrl: './espacios.component.html',
  styleUrl: './espacios.component.css'
})
export class EspaciosComponent implements OnInit {

  constructor(private spacesService: SpacesService) { }

  mockSpaces: any[] = [];
  loading: boolean = true;

  ngOnInit(): void {    
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.spacesService.getAll().then((spaces) => {
      this.mockSpaces = spaces;
      this.loading = false;
    });
  }

  handleSearchSpaces(filtros: Filtros): void {
    this.loading = true;
    this.mockSpaces = [];

    console.log(filtros.capacidad > 0, filtros.precio > 0, filtros.amenidades.length > 0, filtros.tipo)

    if (filtros.capacidad > 0 || filtros.precio > 0 || filtros.amenidades.length > 0 || filtros.tipo || filtros.fecha) {
      // Map legacy filters to API filters
      const apiFilters: any = {};

      if (filtros.capacidad > 0) apiFilters.capacity = filtros.capacidad;
      // if (filtros.precio > 0) apiFilters.price = filtros.precio; // Assuming API supports price
      if (filtros.tipo) apiFilters.spaces_type_id = filtros.tipo; // Assuming backend handles this mapping or ID is passed
      if (filtros.fecha) apiFilters.fecha_deseada = filtros.fecha;

      this.spacesService.getAll(apiFilters).then((spaces) => {
        this.mockSpaces = spaces;
        this.loading = false;
      });
    } else {
      this.loading = true;
      this.mockSpaces = [];
      this.loadSpaces();
    }
  }

}
