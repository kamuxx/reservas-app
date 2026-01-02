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
    console.log('ngOnInit');
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.spacesService.getSpaces().then((spaces) => {
      this.mockSpaces = spaces;
      this.loading = false;
    });

    console.log("espacios cargados")
  }

  handleSearchSpaces(filtros: Filtros): void {
    this.loading = true;
    this.mockSpaces = [];

    console.log(filtros.capacidad > 0 , filtros.precio > 0 , filtros.servicios.length > 0 , filtros.tipo)

    if (filtros.capacidad > 0 || filtros.precio > 0 || filtros.servicios.length > 0 || filtros.tipo) {
      this.spacesService.getSpaces(filtros).then((spaces) => {
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
