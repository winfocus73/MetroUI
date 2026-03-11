import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditShipmentComponent } from './add-edit-shipment.component';

describe('AddEditShipmentComponent', () => {
  let component: AddEditShipmentComponent;
  let fixture: ComponentFixture<AddEditShipmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditShipmentComponent]
    });
    fixture = TestBed.createComponent(AddEditShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
