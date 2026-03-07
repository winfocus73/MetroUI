import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIssueComponent } from './material-issue.component';

describe('MaterialIssueComponent', () => {
  let component: MaterialIssueComponent;
  let fixture: ComponentFixture<MaterialIssueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaterialIssueComponent]
    });
    fixture = TestBed.createComponent(MaterialIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
