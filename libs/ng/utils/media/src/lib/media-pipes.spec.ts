import { LOCALE_ID, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AspectRatioPipe, CodecNamePipe, CoordinatePipe, FrameRatePipe, PixelFormatPipe, ShutterSpeedPipe } from './media-pipes';

function create<T>(pipe: Type<T>, locale = 'en-US'): T {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [pipe, { provide: LOCALE_ID, useValue: locale }] });
  return TestBed.inject(pipe);
}

describe('FrameRatePipe', () => {
  it('formats rationals and plain rates', () => {
    const pipe = create(FrameRatePipe);
    expect(pipe.transform('30000/1001')).toBe('29.97 fps');
    expect(pipe.transform('25/1')).toBe('25 fps');
    expect(pipe.transform(50)).toBe('50 fps');
    expect(pipe.transform('24000/1001', 3, 'de-DE')).toBe('23,976 fps');
  });

  it('returns an empty string for invalid rates', () => {
    const pipe = create(FrameRatePipe);
    expect(pipe.transform('0/0')).toBe('');
    expect(pipe.transform('abc')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});

describe('ShutterSpeedPipe', () => {
  it('shows short exposures as fractions', () => {
    const pipe = create(ShutterSpeedPipe);
    expect(pipe.transform(0.004)).toBe('1/250 s');
    expect(pipe.transform('0.0333')).toBe('1/30 s');
    expect(pipe.transform(0.5)).toBe('1/2 s');
    expect(pipe.transform(1 / 8000)).toBe('1/8,000 s');
  });

  it('shows other exposures in seconds', () => {
    expect(create(ShutterSpeedPipe).transform(0.4)).toBe('0.4 s');
    expect(create(ShutterSpeedPipe).transform(2)).toBe('2 s');
    expect(create(ShutterSpeedPipe, 'de-DE').transform(2.5)).toBe('2,5 s');
  });

  it('returns an empty string for invalid input', () => {
    expect(create(ShutterSpeedPipe).transform(0)).toBe('');
    expect(create(ShutterSpeedPipe).transform('')).toBe('');
    expect(create(ShutterSpeedPipe).transform('fast')).toBe('');
  });
});

describe('CoordinatePipe', () => {
  it('formats degrees, minutes and seconds with hemispheres', () => {
    const pipe = create(CoordinatePipe);
    expect(pipe.transform(52.520008, { axis: 'lat' })).toBe(`52° 31' 12.0" N`);
    expect(pipe.transform(-33.8688, { axis: 'lat' })).toBe(`33° 52' 07.7" S`);
    expect(pipe.transform(-0.1278, { axis: 'lng' })).toBe(`0° 07' 40.1" W`);
    expect(pipe.transform('13.404954', { axis: 'lng' })).toBe(`13° 24' 17.8" E`);
  });

  it('keeps the sign without an axis and handles small values', () => {
    const pipe = create(CoordinatePipe);
    expect(pipe.transform(-33.8688)).toBe(`-33° 52' 07.7"`);
    expect(pipe.transform(0.01)).toBe(`0° 00' 36.0"`);
    expect(pipe.transform(0)).toBe(`0° 00' 00.0"`);
  });

  it('carries rounding into minutes and degrees', () => {
    expect(create(CoordinatePipe).transform(10.99999)).toBe(`11° 00' 00.0"`);
  });

  it('respects digits and locale', () => {
    expect(create(CoordinatePipe).transform(52.520008, { digits: 3, locale: 'de-DE' })).toBe(`52° 31' 12,029"`);
    expect(create(CoordinatePipe).transform(null)).toBe('');
  });
});

describe('AspectRatioPipe', () => {
  it('formats common notations', () => {
    const pipe = create(AspectRatioPipe);
    expect(pipe.transform('16x9')).toBe('16:9');
    expect(pipe.transform('4:3')).toBe('4:3');
    expect(pipe.transform('1_85')).toBe('1.85:1');
    expect(pipe.transform(1920 / 1080)).toBe('1.78:1');
    expect(create(AspectRatioPipe, 'de-DE').transform('2.39')).toBe('2,39:1');
  });

  it('returns an empty string for invalid input', () => {
    const pipe = create(AspectRatioPipe);
    expect(pipe.transform('wide')).toBe('');
    expect(pipe.transform('16x0')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});

describe('CodecNamePipe', () => {
  const pipe = new CodecNamePipe();

  it('maps known codec names and passes others through', () => {
    expect(pipe.transform('prores')).toBe('ProRes');
    expect(pipe.transform('H264')).toBe('H.264');
    expect(pipe.transform('hevc')).toBe('H.265 (HEVC)');
    expect(pipe.transform('ffv1')).toBe('ffv1');
    expect(pipe.transform(null)).toBe('');
  });
});

describe('PixelFormatPipe', () => {
  it('shows chroma subsampling and bit depth', () => {
    const pipe = create(PixelFormatPipe);
    expect(pipe.transform('yuv422p10le')).toBe('4:2:2, 10 bit');
    expect(pipe.transform('yuvj420p')).toBe('4:2:0, 8 bit');
    expect(pipe.transform('yuva444p12be')).toBe('4:4:4, 12 bit');
    expect(pipe.transform('yuv411p')).toBe('4:1:1, 8 bit');
    expect(pipe.transform('yuv444p12le', 'de-DE')).toBe('4:4:4, 12 Bit');
  });

  it('passes other formats through', () => {
    const pipe = create(PixelFormatPipe);
    expect(pipe.transform('rgb24')).toBe('rgb24');
    expect(pipe.transform('yuv440p')).toBe('yuv440p');
    expect(pipe.transform('')).toBe('');
  });
});
