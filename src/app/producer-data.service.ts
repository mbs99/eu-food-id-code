import {Injectable} from '@angular/core';
import {Producer} from './shared/producer';
import {parse} from "csv-parse/browser/esm/sync";

@Injectable({
  providedIn: 'root'
})
export class ProducerDataService {

  private updateUrl = 'http://localhost:4200/export.csv';

  getProducerData() {
    return fetch(this.updateUrl).then(response => {
      if(response.ok) {
        const resultMap = new Map<string, Producer>();
        return response.text().then(csvData => {
          const records = parse(csvData, {
            delimiter: ";",
            comment: "#",
            encoding: "utf-8",
            quote: null,
            skipRecordsWithError: true
          });
          return records.map(record => {
            const producer:Producer = {
              address: `${record[2]} ${record[3]}`,
              code: {
                country: 'DE',
                state: record[0],
                code: record[5]
              },
              name: record[1]

            }
            return producer;
          })
        })
      }
      return [];
    })
  }
}
