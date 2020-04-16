import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


import {ActivityComponent} from './activity/activity.component';

import {MatButtonModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatSelectModule} from '@angular/material';
import {NgxSpinnerModule} from 'ngx-spinner';


@NgModule({
  declarations: [ActivityComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    MatExpansionModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [ActivityComponent]
})
export class ActivityModule {
}
