import { Component, OnInit } from '@angular/core';
import {Format} from "../../../../modules/format-input/src/component/format-input/format-input.component";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent implements OnInit {

  public format: Format;

  public value: {[index: string]: string};

  constructor() { }

  ngOnInit() {
    this.format = {
      layout: 'pgsql:dbname={dbname};user={user};password={password};host={host}',
      configs: [{
        name: 'dbname',
        valueSource: (context, query, page, pagesize): Observable<string[]> => {
          return Observable.of(['foo', 'bar', 'baz'].filter((v) => v.indexOf(query) > -1));
        }
      }],
    }
  }

  valueUpdated(value: {[index: string]: string}) {
    this.value = value;
  }
}
