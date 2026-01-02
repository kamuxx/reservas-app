import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-space-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.css'
})
export class SpaceCardComponent {

  @Input() space: any;

  constructor(private router: Router) {}

  verDetalle(id: number) {
    this.router.navigate(['/espacios', id]);
  }
}
