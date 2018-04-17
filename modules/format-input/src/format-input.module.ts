import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FormatInputComponent} from './component/format-input/format-input.component';
import {DropdownComponent} from './component/dropdown/dropdown.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [FormatInputComponent, DropdownComponent],
  exports: [FormatInputComponent]
})
export class FormatInputModule {
}
