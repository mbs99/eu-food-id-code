import {ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal,} from '@angular/core';
import {DbService} from '../db.service';
import {FormsModule} from '@angular/forms';
import {Producer} from '../shared/producer';
import {AppData} from '../shared/app-data';

@Component({
  selector: 'app-producer-search',
  imports: [FormsModule],
  templateUrl: './producer-search.html',
  styleUrl: './producer-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProducerSearch {
  private readonly _dbService = inject(DbService);
  private readonly _stateDefault = '-';
  country: WritableSignal<string> = signal('DE');
  state: WritableSignal<string> = signal(this._stateDefault);
  code: WritableSignal<number | null> = signal(null);

  searchResult: WritableSignal<Producer | null> = signal(null);

  appData: WritableSignal<AppData | null> = signal(null);

  error: WritableSignal<Error | null> = signal(null);

  msg: WritableSignal<string | null> = signal(null);

  search() {
    if (this.code() && this._stateDefault !== this.state()) {
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

  stateList(state: string) {
    if ('BB' === state) {
      return `Brandenburg (${state})`;
    } else if ('BE' === state) {
      return `Berlin (${state})`;
    } else if ('BW' === state) {
      return `Baden-Württemberg (${state})`;
    } else if ('BY' === state) {
      return `Bayern (${state})`;
    } else if ('HB' === state) {
      return `Bremen (${state})`;
    } else if ('HE' === state) {
      return `Hessen (${state})`;
    } else if ('HH' === state) {
      return `Hamburg (${state})`;
    } else if ('MV' === state) {
      return `Mecklenburg-Vorpommern (${state})`;
    } else if ('NI' === state) {
      return `Niedersachsen (${state})`;
    } else if ('NW' === state) {
      return `Nordrein-Westfalen (${state})`;
    } else if ('RP' === state) {
      return `Rheinland-Pfalz (${state})`;
    } else if ('SH' === state) {
      return `Schleswig-Holstein (${state})`;
    } else if ('SL' === state) {
      return `Saarland (${state})`;
    } else if ('SN' === state) {
      return `Sachsen (${state})`;
    } else if ('ST' === state) {
      return `Sachsen-Anhalt (${state})`;
    } else if ('TH' === state) {
      return `Thüringen (${state})`;
    } else {
      return state;
    }
  }
}
