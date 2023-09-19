import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
  standalone: true,
})
export class JoinPipe implements PipeTransform {
  public transform(value: unknown, separator = ', '): string {
    if (Array.isArray(value)) {
      return value.join(separator);
    } else if (typeof value === 'string') {
      return value;
    } else {
      return '';
    }
  }
}
