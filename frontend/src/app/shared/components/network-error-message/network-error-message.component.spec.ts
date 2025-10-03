import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkErrorMessageComponent } from './network-error-message.component';

describe('NetworkErrorMessageComponent', () => {
  let component: NetworkErrorMessageComponent;
  let fixture: ComponentFixture<NetworkErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkErrorMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
