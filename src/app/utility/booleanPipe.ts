import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'booleanPipe'})
export class BooleanPipe implements PipeTransform {
  transform(value) {
    return value ? 'Yes' : 'No';
  }
}
