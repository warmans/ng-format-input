import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormatInputModule} from "../../../modules/format-input/src/format-input.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
