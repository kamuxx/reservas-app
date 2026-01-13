import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspacioDetalleComponent } from './espacio-detalle.component';

describe('EspacioDetalleComponent', () => {
  let component: EspacioDetalleComponent;
  let fixture: ComponentFixture<EspacioDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspacioDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspacioDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
