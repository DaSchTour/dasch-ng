import { Pipe, PipeTransform } from '@angular/core';
import { isNumber } from '@fxts/core';

@Pipe({
  name: 'decimalBytes',
  standalone: true,
})
export class DecimalBytesPipe implements PipeTransform {
  /* `bytes` needs to be `any` or TypeScript complains
    Tried both `number` and `number | string` */
  public transform(bytes: unknown, precision = 2): string {
    if (bytes === 0) {
      return '0 B';
    } else if (!isNumber(bytes) || isNaN(bytes)) {
      /* If not a valid number, return 'Invalid Number' */
      return 'Invalid Number';
    } else {
      const k = 1000;
      const sizes: Array<string> = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i: number = Math.floor(Math.log(bytes) / Math.log(k));
      // if less than 1
      if (i < 0) {
        return 'Invalid Number';
      }
      return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(precision))} ${sizes[i]}`;
    }
  }
}
