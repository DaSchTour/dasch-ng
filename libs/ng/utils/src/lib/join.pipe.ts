import { Pipe, PipeTransform } from '@angular/core';
import { isArray, isString } from '@fxts/core';

@Pipe({
  name: 'join',
  standalone: true
})
export class JoinPipe implements PipeTransform {
  public transform(value: unknown, separator = ', '): string {
    if (isArray(value)) {
      return value.join(separator);
    } else if (isString(value)) {
      return value;
    } else {
      return '';
    }
  }
}
