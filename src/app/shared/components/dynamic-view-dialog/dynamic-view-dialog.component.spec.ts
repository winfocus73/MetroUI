import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicViewDialogComponent } from './dynamic-view-dialog.component';

describe('DynamicViewDialogComponent', () => {
  let component: DynamicViewDialogComponent;
  let fixture: ComponentFixture<DynamicViewDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicViewDialogComponent],
    });
    fixture = TestBed.createComponent(DynamicViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
