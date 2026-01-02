import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpacesService {

  constructor() { }

  getSpaces(filtros?: any): Promise<any[]> {
    return new Promise((resolve) => {

      let spaces = [
        { id: 1, name: 'Sala Berlin', capacity: 10, type: 'Sala Juntas', location: 'Piso 2, Torre A', price: 50, available: true, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80' },
        { id: 2, name: 'Auditorio Principal', capacity: 50, type: 'Auditorio', location: 'PB, Edificio Central', price: 200, available: true, image: 'https://images.unsplash.com/photo-1517502886367-e062978ed5c5?auto=format&fit=crop&q=80' },
        { id: 3, name: 'Space Lab', capacity: 6, type: 'Laboratorio', location: 'Piso 1, Ala Oeste', price: 35, available: false, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80' },
        { id: 4, name: 'Sala Zoom', capacity: 4, type: 'Sala Juntas', location: 'Piso 2, Torre B', price: 25, available: true, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' },
        { id: 5, name: 'Creative Hub', capacity: 15, type: 'Espacio Abierto', location: 'Piso 3, Rooftop', price: 60, available: true, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80' }
      ];
      let spacesFiltered: any[] = [];

      if (filtros) {
        spacesFiltered = spaces.filter(space => {
          // Filtro por capacidad (si es mayor a 0)
          if (filtros.capacidad > 0 && space.capacity < filtros.capacidad) {
            return false;
          }

          // Filtro por precio (rango máximo, si es mayor a 0)
          if (filtros.precio > 0 && space.price > filtros.precio) {
            return false;
          }

          // Filtro por tipo/servicios (si hay selección en el array 'servicios')
          // Nota: Asumo que 'servicios' en tu filtro corresponde a 'type' en el mock
          if (filtros.servicios && filtros.servicios.length > 0 && !filtros.servicios.includes(space.type)) {
            return false;
          }

          // Filtro por tipo individual (string) si se llegará a usar
          if (filtros.tipo && filtros.tipo !== '' && space.type !== filtros.tipo) {
            return false;
          }

          return true;
        });

        // Determinar si se aplicó algún filtro activo
        const hasActiveFilters = filtros.capacidad > 0 || filtros.precio > 0 || (filtros.servicios && filtros.servicios.length > 0) || (filtros.tipo && filtros.tipo !== '');

        resolve(hasActiveFilters ? spacesFiltered : spaces);
      } else {
        resolve(spaces);
      }
    });
  }
}
