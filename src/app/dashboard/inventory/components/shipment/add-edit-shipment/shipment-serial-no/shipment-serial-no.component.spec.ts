import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentSerialNoComponent } from './shipment-serial-no.component';

describe('ShipmentSerialNoComponent', () => {
  let component: ShipmentSerialNoComponent;
  let fixture: ComponentFixture<ShipmentSerialNoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentSerialNoComponent]
    });
    fixture = TestBed.createComponent(ShipmentSerialNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
