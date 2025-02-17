import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewServiceModalComponent } from './new-service-modal.component';

describe('NewServiceModalComponent', () => {
  let component: NewServiceModalComponent;
  let fixture: ComponentFixture<NewServiceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewServiceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
