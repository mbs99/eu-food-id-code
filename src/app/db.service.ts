import { Injectable, signal, WritableSignal } from '@angular/core';
import { Producer } from './shared/producer';
import { AppData } from './shared/app-data';

interface ProducerDbObject {
  foodIdCode: string;
  country: string;
  state: string;
  name: string;
  address: string;
}

interface AppDataDbObject {
  id?: string;
  contries: string[];
  states: string[];
  timestamp: number;
}

export interface DbQueryResult<T> {
  records: T[];
  error?: Error;
  msg?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db?: IDBDatabase;

  private readonly _importComplete: WritableSignal<boolean> = signal(false);
  private readonly _dbReady: WritableSignal<boolean> = signal(false);
  private readonly _dbError: WritableSignal<Error[]> = signal([]);
  dbReady = this._dbReady.asReadonly();

  private readonly _appDataQueryResult: WritableSignal<DbQueryResult<AppData>> = signal({
    records: [],
  });
  appDataQueryResult = this._appDataQueryResult.asReadonly();

  private readonly _dbName = 'food-id-codes';
  private readonly _producerObjectStoreName = 'producer';
  private readonly _appDataObjectStoreName = 'appdata';

  private readonly _producerQueryResult: WritableSignal<DbQueryResult<Producer>> = signal<
    DbQueryResult<Producer>
  >({
    records: [],
  });

  producerQueryResult = this._producerQueryResult.asReadonly();

  constructor() {
    this.openDB();
  }

  private openDB() {
    const dbOpenRequest = window.indexedDB.open(this._dbName, 1);

    dbOpenRequest.onerror = (event) => {
      this._dbError.set([...this._dbError(), new Error(`Error loading database: ${event}`)]);
    };

    dbOpenRequest.onsuccess = (event) => {
      // Store the result of opening the database in the db variable. This is used a lot below
      this.db = dbOpenRequest.result;
      this._dbReady.set(true);
    };

    dbOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      // @ts-ignore
      this.db = event.target.result;

      if (this.db) {
        this.db.onerror = (event) => {
          this._dbError.set([...this._dbError(), new Error(`Error loading database: ${event}`)]);
        };
      }

      // Create an objectStore for this database
      this.db?.createObjectStore(this._producerObjectStoreName, { keyPath: 'foodIdCode' });
      this.db?.createObjectStore(this._appDataObjectStoreName, {
        keyPath: 'id',
        autoIncrement: true,
      });
    };
  }

  getProducerById(id: string) {
    if (this.dbReady()) {
      const transaction = this.db?.transaction([this._producerObjectStoreName], 'readonly');
      const objectStore = transaction?.objectStore(this._producerObjectStoreName);
      const request = objectStore?.get(id);
      if (request) {
        request.onerror = (event) => {
          this._producerQueryResult.set({
            records: [],
            error: new Error('Query error'),
          });
        };
        request.onsuccess = (event) => {
          // @ts-ignore
          if (event.target?.result) {
            const producer: Producer = {
              // @ts-ignore
              address: event.target.result.address,
              code: {
                // @ts-ignore
                country: event.target.result.country,
                // @ts-ignore
                state: event.target.result.state,
                // @ts-ignore
                code: event.target.result.foodIdCode,
              },
              // @ts-ignore
              name: event.target.result.name,
            };

            this._producerQueryResult.set({
              records: [producer],
            });
          } else {
            this._producerQueryResult.set({
              records: [],
              msg: 'No mactch',
            });
          }
        };
      }
    }
  }

  importData(producers: Producer[]) {
    if (this._dbReady()) {
      const transaction = this.db?.transaction(
        [this._producerObjectStoreName, this._appDataObjectStoreName],
        'readwrite'
      );
      transaction?.addEventListener('complete', (event) => {
        this._importComplete.set(true);
      });

      const objectStore = transaction?.objectStore(this._producerObjectStoreName);
      const appDataStore = transaction?.objectStore(this._appDataObjectStoreName);

      const objectStoreRequest = objectStore?.clear();
      const appDataStoreClearRequest = appDataStore?.clear();
      if (appDataStoreClearRequest) {
        appDataStoreClearRequest.onerror = (event) => {
          this._dbError.set([...this._dbError(), new Error(`Error loading database: ${event}`)]);
        };
      }
      if (objectStoreRequest) {
        objectStoreRequest.onerror = (event) => {
          this._dbError.set([...this._dbError(), new Error(`Error loading database: ${event}`)]);
        };

        objectStoreRequest.onsuccess = (event) => {
          const keySet = new Set<string>();
          const countrySet = new Set<string>();
          const statesSet = new Set<string>();
          producers
            .filter((producer) => producer.code.code.trim().length)
            .map((producer) => {
              if (!keySet.has(producer.code.code)) {
                keySet.add(producer.code.code);
                const record: ProducerDbObject = {
                  address: producer.address,
                  country: producer.code.country,
                  foodIdCode: producer.code.code,
                  name: producer.name,
                  state: producer.code.state,
                };
                countrySet.add(record.country);
                statesSet.add(record.state);
                return record;
              } else {
                return null;
              }
            })
            .filter((record) => null != record)
            .forEach((record) => {
              const objectStoreAddRequest = objectStore?.add(record);
              if (objectStoreAddRequest) {
                objectStoreAddRequest.onerror = (event) => {
                  this._dbError.set([
                    ...this._dbError(),
                    new Error(`Error loading database: ${event.target}`),
                  ]);
                };
              }
            });
          const appDateRecord: AppDataDbObject = {
            contries: Array.from(countrySet.values()),
            states: Array.from(statesSet.values()),
            timestamp: Date.now(),
          };
          const appDataStoreAddRequest = appDataStore?.add(appDateRecord);
          if (appDataStoreAddRequest) {
            appDataStoreAddRequest.onerror = (event) => {
              this._dbError.set([
                ...this._dbError(),
                new Error(`Error loading database: ${event.target}`),
              ]);
            };
          }
        };
      }
    } else {
      this._dbError.set([...this._dbError(), new Error(`No open database...`)]);
    }

    return {
      importComplete: this._importComplete.asReadonly(),
      error: this._dbError.asReadonly(),
    };
  }

  getAppData() {
    if (this.dbReady()) {
      const transaction = this.db?.transaction([this._appDataObjectStoreName], 'readonly');
      const objectStore = transaction?.objectStore(this._appDataObjectStoreName);
      const request = objectStore?.getAll();
      if (request) {
        request.onerror = (event) => {
          this._appDataQueryResult.set({
            records: [],
            error: new Error('Query error'),
          });
        };
        request.onsuccess = (event) => {
          const records: AppData[] = [];
          // @ts-ignore
          if (!event.target.result?.length) {
            const init: AppData = {
              contries: [],
              states: [],
              init: true,
            };
            records.push(init);
          } else {
            // @ts-ignore
            const results = event.target.result ?? [];
            records.push(...results.slice(0, 1));
          }
          this._appDataQueryResult.set({
            records,
          });
        };
      }
    }
  }
}
