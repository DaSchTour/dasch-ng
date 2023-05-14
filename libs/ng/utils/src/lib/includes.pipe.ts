import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
  standalone: true,
})
export class IncludesPipe implements PipeTransform {
  public transform(list?: Array<string>, value?: string): boolean {
    if (value) {
      return list?.includes(value) ?? false;
    } else {
      return false;
    }
  }
}
