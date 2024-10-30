import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySuccessfulComponent } from './pay-successful.component';

describe('PaySuccessfulComponent', () => {
  let component: PaySuccessfulComponent;
  let fixture: ComponentFixture<PaySuccessfulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySuccessfulComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaySuccessfulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
