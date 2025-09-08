import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerInit } from './producer-init';

describe('ProducerInit', () => {
  let component: ProducerInit;
  let fixture: ComponentFixture<ProducerInit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducerInit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducerInit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
