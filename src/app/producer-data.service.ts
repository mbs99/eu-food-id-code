import { Injectable, isDevMode } from '@angular/core';
import { Producer } from './shared/producer';
import { parse } from 'csv-parse/browser/esm/sync';

@Injectable({
  providedIn: 'root',
})
export class ProducerDataService {
  private readonly _baseUrl = isDevMode() ? 'http://localhost:4200' : '';
  private readonly _updateUrl = `${this._baseUrl}/export.csv`;
  private readonly _hashUrl = `${this._baseUrl}/export.sha256`;

  getProducerDataHash() {
    return fetch(this._hashUrl).then((response) => {
      if (response.ok) {
        return response.text().then((hash) => hash);
      }
      return undefined;
    });
  }

  getProducerData() {
    return fetch(this._updateUrl).then((response) => {
      if (response.ok) {
        return this.parseProducerData(response);
      }
      return [];
    });
  }

  parseProducerData(response: Response): Promise<Producer[]> {
    return response.blob().then((blob) => {
      return blob.arrayBuffer().then((csvData) => {
        const records = parse(new Uint8Array(csvData), {
          delimiter: ';',
          comment: '#',
          encoding: 'utf-8',
          quote: null,
          skipRecordsWithError: true,
        });
        return records.map((record) => {
          const producer: Producer = {
            address: `${record[2]} ${record[3]}`,
            code: {
              country: 'DE',
              state: record[0],
              code: record[5],
            },
            name: record[1],
          };
          return producer;
        });
      });
    });
  }
}
