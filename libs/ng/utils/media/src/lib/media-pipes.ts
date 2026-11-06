import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

abstract class LocalePipe {
  protected readonly localeId = inject(LOCALE_ID);

  protected format(value: number, maximumFractionDigits: number, locale?: string): string {
    return new Intl.NumberFormat(locale ?? this.localeId, { maximumFractionDigits }).format(value);
  }
}

/** `"30000/1001"`, `"25"` or `25` to a number; `null` if it is not a positive finite value. */
function parseRate(value: string | number): number | null {
  const [numerator, denominator = '1'] = String(value).split('/');
  const rate = Number(numerator) / Number(denominator);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

/**
 * Formats a frame rate, also given as a rational like FFmpeg and MediaInfo report it.
 *
 * @example
 * ```html
 * {{ '30000/1001' | frameRate }}   <!-- 29.97 fps -->
 * {{ 25 | frameRate }}             <!-- 25 fps -->
 * {{ '24000/1001' | frameRate: 3 : 'de-DE' }}  <!-- 23,976 fps -->
 * ```
 */
@Pipe({ name: 'frameRate' })
export class FrameRatePipe extends LocalePipe implements PipeTransform {
  transform(value: string | number | null | undefined, digits = 2, locale?: string): string {
    const rate = value == null ? null : parseRate(value);
    return rate === null ? '' : `${this.format(rate, digits, locale)} fps`;
  }
}

/**
 * Formats an exposure time in seconds the way cameras show it: `1/250 s` for short times,
 * `0.4 s` or `2 s` otherwise. A time counts as `1/n` when `n` is within 5 % of a whole number.
 *
 * @example
 * ```html
 * {{ 0.004 | shutterSpeed }}   <!-- 1/250 s -->
 * {{ '0.0333' | shutterSpeed }} <!-- 1/30 s -->
 * {{ 2.5 | shutterSpeed : 'de-DE' }} <!-- 2,5 s -->
 * ```
 */
@Pipe({ name: 'shutterSpeed' })
export class ShutterSpeedPipe extends LocalePipe implements PipeTransform {
  transform(seconds: string | number | null | undefined, locale?: string): string {
    const value = seconds == null || seconds === '' ? Number.NaN : Number(seconds);
    if (!Number.isFinite(value) || value <= 0) {
      return '';
    }
    if (value < 1) {
      const denominator = 1 / value;
      const whole = Math.round(denominator);
      if (whole >= 2 && Math.abs(denominator - whole) / whole <= 0.05) {
        return `1/${this.format(whole, 0, locale)} s`;
      }
    }
    return `${this.format(value, 1, locale)} s`;
  }
}

export interface CoordinateOptions {
  /** `'lat'` adds N/S, `'lng'` adds E/W; without it negative values keep a minus sign. */
  axis?: 'lat' | 'lng';
  /** Fraction digits of the seconds. Default `1` (about 3 m). */
  digits?: number;
  locale?: string;
}

/**
 * Formats a decimal coordinate in degrees, minutes and seconds.
 *
 * @example
 * ```html
 * {{ 52.520008 | coordinate: { axis: 'lat' } }}   <!-- 52° 31' 12.0" N -->
 * {{ -0.1278 | coordinate: { axis: 'lng' } }}     <!-- 0° 07' 40.1" W -->
 * {{ -33.8688 | coordinate }}                     <!-- -33° 52' 07.7" -->
 * ```
 */
@Pipe({ name: 'coordinate' })
export class CoordinatePipe extends LocalePipe implements PipeTransform {
  transform(value: string | number | null | undefined, options: CoordinateOptions = {}): string {
    const decimal = value == null || value === '' ? Number.NaN : Number(value);
    if (!Number.isFinite(decimal)) {
      return '';
    }
    const { axis, digits = 1, locale } = options;
    const scale = 10 ** digits;
    // Work in rounded seconds so 59.96" never shows up as 60.0".
    const totalSeconds = Math.round(Math.abs(decimal) * 3600 * scale) / scale;
    const degrees = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - degrees * 3600) / 60);
    const secs = totalSeconds - degrees * 3600 - minutes * 60;
    const two = new Intl.NumberFormat(locale ?? this.localeId, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    const negative = decimal < 0 && totalSeconds > 0;
    const hemisphere = axis === 'lat' ? (negative ? ' S' : ' N') : axis === 'lng' ? (negative ? ' W' : ' E') : '';
    const sign = negative && !axis ? '-' : '';
    return `${sign}${degrees}° ${String(minutes).padStart(2, '0')}' ${two.format(secs)}"${hemisphere}`;
  }
}

/**
 * Formats an aspect ratio as `w:h`. Accepts `16x9`, `16:9`, `1_85` / `1.85` (meaning `:1`)
 * or a number. A decimal ratio is shown with two fraction digits.
 *
 * @example
 * ```html
 * {{ '16x9' | aspectRatio }}          <!-- 16:9 -->
 * {{ '1_85' | aspectRatio }}          <!-- 1.85:1 -->
 * {{ 1920 / 1080 | aspectRatio }}     <!-- 1.78:1 -->
 * {{ '2.39' | aspectRatio : 'de-DE' }} <!-- 2,39:1 -->
 * ```
 */
@Pipe({ name: 'aspectRatio' })
export class AspectRatioPipe extends LocalePipe implements PipeTransform {
  transform(value: string | number | null | undefined, locale?: string): string {
    if (value == null || value === '') {
      return '';
    }
    const [width, height = 1] = String(value)
      .replace(/_/g, '.')
      .split(/[x:×/]/i)
      .map(Number);
    if (!(width > 0) || !(height > 0)) {
      return '';
    }
    return `${this.format(width, 2, locale)}:${this.format(height, 2, locale)}`;
  }
}
