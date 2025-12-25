import { Pipe, PipeTransform } from '@angular/core';
import { Segment } from './segment';
import { isExpandable } from './is-expandable';

@Pipe({
  name: 'isExpandable',
  standalone: true,
})
export class IsExpandablePipe implements PipeTransform {
  transform(value: Segment): boolean {
    return isExpandable(value);
  }
}
