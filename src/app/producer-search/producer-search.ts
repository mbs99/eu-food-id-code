import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { DbService } from '../db.service';
import { FormsModule } from '@angular/forms';
import { Producer } from '../shared/producer';
import { AppData } from '../shared/app-data';

@Component({
  selector: 'app-producer-search',
  imports: [FormsModule],
  templateUrl: './producer-search.html',
  styleUrl: './producer-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProducerSearch {
  private readonly _dbService = inject(DbService);
  country: WritableSignal<string> = signal('DE');
  state: WritableSignal<string> = signal('BW');
  code: WritableSignal<number|null> = signal(null);

  searchResult: WritableSignal<Producer | null> = signal(null);

  appData: WritableSignal<AppData | null> = signal(null);

  error: WritableSignal<Error | null> = signal(null);

  msg: WritableSignal<string | null> = signal(null);

  search() {
    if (this.code()) {
      this.searchResult.set(null);
      this._dbService.getProducerById(`${this.state()} ${this.code()}`);
    }
  }

  constructor() {
    this._dbService.getAppData();

    effect(() => {
      if (this._dbService.producerQueryResult()?.records.length) {
        const producer = this._dbService.producerQueryResult().records[0];
        this.searchResult.set({
          address: producer.address,
          code: {
            country: producer.code.country,
            state: producer.code.state,
            code: producer.code.code,
          },
          name: producer.name,
        });
      } else if (this._dbService.producerQueryResult()?.error) {
        this.error.set(this._dbService.producerQueryResult().error ?? null);
      } else if (this._dbService.producerQueryResult()?.msg) {
        this.msg.set(this._dbService.producerQueryResult().msg ?? '');
      }

      if (this._dbService.appDataQueryResult()?.records.length) {
        const appData = this._dbService.appDataQueryResult().records[0];
        this.appData.set(appData);
      } else if (this._dbService.producerQueryResult()?.error) {
      }
    });
  }

  reset() {
    this.code.set(null);
    this.state.set('BW');
    this.searchResult.set(null);
    this.msg.set(null);
  }
}
