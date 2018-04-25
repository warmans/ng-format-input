import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {FormatInputModule} from "../../../modules/format-input/src/format-input.module";
import {DynamicComponent} from './dynamic/dynamic.component';
import {AutoCompleteComponent} from './auto-complete/auto-complete.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicComponent,
    AutoCompleteComponent
  ],
  imports: [
    BrowserModule,
    FormatInputModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
