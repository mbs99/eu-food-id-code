import { TestBed } from '@angular/core/testing';

import { ProducerDataService } from './producer-data.service';

describe('ProducerData', () => {
  let service: ProducerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProducerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
