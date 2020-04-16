import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'removeUnderscore'})
export class RemoveUnderscorePipe implements PipeTransform {
  result: string;

  transform(value: any, args?: any): any {
    if (value) {
      this.result = value.replace(/_/g, ' ');
    } else {
      this.result = ' ';
    }
    return this.result;
  }
}
