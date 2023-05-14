import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
  standalone: true,
})
export class ReversePipe implements PipeTransform {
  public transform<T>(values: Array<T>): Array<T> {
    return [...values].reverse();
  }
}
