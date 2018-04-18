import {Component} from '@angular/core';
import 'rxjs/add/observable/of';
import {Format} from "../../../modules/format-input/src/component/format-input/format-input.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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
