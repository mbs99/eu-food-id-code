import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { ProducerDataService } from '../producer-data.service';
import { DbService } from '../db.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-producer-init',
  imports: [MatProgressSpinnerModule],
  templateUrl: './producer-init.html',
  styleUrl: './producer-init.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProducerInit {
  private readonly _producerDataService = inject(ProducerDataService);
  private readonly _dbService = inject(DbService);

  producers = toSignal(from(this._producerDataService.getProducerData()));
  producerHash = toSignal(from(this._producerDataService.getProducerDataHash()));

  producerData = computed(() => {
    return {
      hash: this.producerHash(),
      producers: this.producers(),
    };
  });

  dataReady = output<boolean>();

  constructor() {
    effect(() => {
      if (this.producers() && this.producerHash()) {
        if (this._dbService.dbReady()) {
          const result = this._dbService.importData(this.producers() ?? [], this.producerHash());
          if (result.importComplete()) {
            this.dataReady.emit(true);
          }
        }
      }
    });
  }
}
