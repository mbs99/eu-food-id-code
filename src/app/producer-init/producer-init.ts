import {ChangeDetectionStrategy, Component, effect, inject, output} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {ProducerDataService} from '../producer-data.service';
import {DbService} from '../db.service';

@Component({
  selector: 'app-producer-init',
  imports: [],
  templateUrl: './producer-init.html',
  styleUrl: './producer-init.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProducerInit {

  private readonly _producerDataService = inject(ProducerDataService);
  private readonly _dbService = inject(DbService);

  producers =  toSignal(from(this._producerDataService.getProducerData()));

  dataReady = output<boolean>()

  constructor() {
    effect(() => {
      if(this.producers()) {
        if(this._dbService.dbReady()) {
          const result = this._dbService.importData(this.producers() ?? []);
          if(result.importComplete()) {
            this.dataReady.emit(true);
          }
        }
      }
    });
  }
}
