import {Component, computed, effect, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ProducerDataService} from './producer-data.service';
import {DbService} from './db.service';
import {ProducerSearch} from './producer-search/producer-search';
import {ProducerInit} from './producer-init/producer-init';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProducerSearch, ProducerInit],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly _producerDataService = inject(ProducerDataService);
  private readonly _dbService = inject(DbService);

  importDone = signal(false);

  initialImport = computed(() => {
    if(this._dbService.dbReady()) {
      if (this._dbService.appDataQueryResult()?.records.at(0)?.init) {
        return true;
      }
    }
    return false;
  })

  dataReady = computed(() => {
    if(this._dbService.dbReady()) {
      if (!this._dbService.appDataQueryResult()?.records.at(0)?.init) {
        return true;
      }
    }
    return false;
  })

  importFinished() {
    this.importDone.set(true);
  }

  constructor() {
    this._dbService.getAppData();

    effect(() => {
      console.log(`importDone = ${this.importDone()}`)
    });
  }
}
