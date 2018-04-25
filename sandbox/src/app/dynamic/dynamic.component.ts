import { Component, OnInit } from '@angular/core';
import {Format} from "../../../../modules/format-input/src/component/format-input/format-input.component";

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent {

  public layout: string = 'http://{sub}.{domain}.{tld}/logout';

  public format: Format;

  public value: {[index: string]: string};

  updateFormat() {
    this.format = {
      layout: this.layout,
    };
    console.log("updated", this.format);
  }

  valueUpdated(value: {[index: string]: string}) {
    console.log(value);
    this.value = value;
  }

}
