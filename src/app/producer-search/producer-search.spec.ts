import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerSearch } from './producer-search';

describe('ProducerSearch', () => {
  let component: ProducerSearch;
  let fixture: ComponentFixture<ProducerSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducerSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducerSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
