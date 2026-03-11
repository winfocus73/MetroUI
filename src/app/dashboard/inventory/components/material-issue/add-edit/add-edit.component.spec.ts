import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditComponent } from '../../material-requisition/add-edit/add-edit.component';

describe('AddEditComponent', () => {
  let component: AddEditComponent;
  let fixture: ComponentFixture<AddEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditComponent],
    });
    fixture = TestBed.createComponent(AddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
