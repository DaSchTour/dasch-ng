import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includedIn',
  standalone: true,
})
export class IncludedInPipe implements PipeTransform {
  public transform<T>(value?: T, list?: Array<T>): boolean {
    if (value) {
      return list?.includes(value) ?? false;
    } else {
      return false;
    }
  }
}
