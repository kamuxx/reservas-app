import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-space-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './space-card.component.html',
  styleUrl: './space-card.component.css'
})
export class SpaceCardComponent implements OnInit {

  @Input() space: any;

  constructor(private router: Router) {}

  ngOnInit(): void {    
  }

  verDetalle(uuid: string) {
    this.router.navigate(['/espacios', uuid]);
  }
}
