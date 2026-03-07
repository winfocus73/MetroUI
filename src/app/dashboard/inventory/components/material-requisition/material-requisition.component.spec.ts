import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialRequisitionComponent } from './material-requisition.component';

describe('MaterialRequisitionComponent', () => {
  let component: MaterialRequisitionComponent;
  let fixture: ComponentFixture<MaterialRequisitionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaterialRequisitionComponent]
    });
    fixture = TestBed.createComponent(MaterialRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
