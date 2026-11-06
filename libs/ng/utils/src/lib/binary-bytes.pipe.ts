import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/**
 * Formats bytes with base 1024 and IEC units (`KiB`, `MiB`, …), the counterpart to
 * {@link DecimalBytesPipe} (base 1000, `KB`, `MB`). Use it where sizes follow memory or
 * file-system conventions.
 *
 * Mirrors `decimalBytes`: `0` gives `'0 B'`, invalid values and values below 1 give
 * `'Invalid Number'`.
 *
 * @example
 * ```html
 * {{ 1536 | binaryBytes }}      <!-- 1.5 KiB -->
 * {{ 10485760 | binaryBytes }}  <!-- 10 MiB -->
 * ```
 */
@Pipe({ name: 'binaryBytes' })
export class BinaryBytesPipe implements PipeTransform {
  transform(bytes: unknown, precision = 2): string {
    if (bytes === 0) {
      return '0 B';
    }
    if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 1) {
      return 'Invalid Number';
    }
    const exponent = Math.min(Math.floor(Math.log2(bytes) / 10), UNITS.length - 1);
    return `${Number.parseFloat((bytes / 1024 ** exponent).toFixed(precision))} ${UNITS[exponent]}`;
  }
}
