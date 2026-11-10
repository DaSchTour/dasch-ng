# Media Pipes

Pipes for technical media metadata, as it comes from tools like FFmpeg, MediaInfo or EXIF: frame rates, exposure times, GPS coordinates and aspect ratios. They live in the secondary entry point `@dasch-ng/utils/media`.

All pipes format numbers with `LOCALE_ID` (or a locale argument) and return an empty string for missing or invalid input.

```typescript
import { AspectRatioPipe, CoordinatePipe, FrameRatePipe, ShutterSpeedPipe } from '@dasch-ng/utils/media';

@Component({
  imports: [AspectRatioPipe, CoordinatePipe, FrameRatePipe, ShutterSpeedPipe],
  template: `
    <dl>
      <dt>Frame rate</dt>
      <dd>{{ clip.frameRate | frameRate }}</dd>
      <dt>Aspect ratio</dt>
      <dd>{{ clip.aspectRatio | aspectRatio }}</dd>
      <dt>Exposure</dt>
      <dd>{{ photo.exposureTime | shutterSpeed }}</dd>
      <dt>Location</dt>
      <dd>{{ photo.lat | coordinate: { axis: 'lat' } }}, {{ photo.lng | coordinate: { axis: 'lng' } }}</dd>
    </dl>
  `,
})
export class MetadataComponent {}
```

## frameRate

`value | frameRate : digits? : locale?`. Accepts rationals (`30000/1001`) as FFmpeg and MediaInfo report them, or plain numbers. `digits` is the maximum number of fraction digits (default `2`).

```typescript
'30000/1001' | frameRate                 // → "29.97 fps"
25 | frameRate                           // → "25 fps"
'24000/1001' | frameRate : 3 : 'de-DE'   // → "23,976 fps"
```

## shutterSpeed

`seconds | shutterSpeed : locale?`. Short exposures become `1/n` when `n` is within 5 % of a whole number, as cameras display them; everything else is shown in seconds.

```typescript
0.004 | shutterSpeed                     // → "1/250 s"
'0.0333' | shutterSpeed                  // → "1/30 s"
0.4 | shutterSpeed                       // → "0.4 s"
2.5 | shutterSpeed : 'de-DE'             // → "2,5 s"
```

## coordinate

`decimal | coordinate : options?` formats a decimal coordinate in degrees, minutes and seconds. Options:

| Option   | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| `axis`   | `'lat'` adds `N`/`S`, `'lng'` adds `E`/`W`; without it a minus sign is kept |
| `digits` | Fraction digits of the seconds, default `1` (about 3 m)                     |
| `locale` | Locale for the seconds, default `LOCALE_ID`                                 |

```typescript
52.520008 | coordinate : { axis: 'lat' } // → 52° 31' 12.0" N
-0.1278 | coordinate : { axis: 'lng' }   // → 0° 07' 40.1" W
-33.8688 | coordinate                    // → -33° 52' 07.7"
```

Rounding carries over, so `10.99999` becomes `11° 00' 00.0"`, never `10° 59' 60.0"`.

## aspectRatio

`value | aspectRatio : locale?`. Accepts `16x9`, `16:9`, `1_85` or `1.85` (meaning `:1`) and numbers. Decimal ratios get at most two fraction digits.

```typescript
'16x9' | aspectRatio                     // → "16:9"
'1_85' | aspectRatio                     // → "1.85:1"
1920 / 1080 | aspectRatio                // → "1.78:1"
'2.39' | aspectRatio : 'de-DE'           // → "2,39:1"
```

## codecName

`codecName | codecName` turns an FFmpeg/ffprobe `codec_name` into a readable label. Unknown values pass through unchanged.

```typescript
'prores' | codecName; // → "ProRes"
'h264' | codecName; // → "H.264"
'hevc' | codecName; // → "H.265 (HEVC)"
'mpeg2video' | codecName; // → "MPEG-2"
'ffv1' | codecName; // → "ffv1"
```

Known: `prores`, `h264`, `hevc`, `mpeg2video`, `mpeg4`, `dnxhd`, `mjpeg`, `jpeg2000`, `av1`, `vp9`.

## pixelFormat

`pixFmt | pixelFormat : locale?` turns an FFmpeg/ffprobe `pix_fmt` of the YUV family (`yuv`, `yuva`, `yuvj`; 4:2:0, 4:2:2, 4:4:4, 4:1:1) into chroma subsampling and bit depth. Without a bit depth the format counts as 8 bit. The bit label is localized with `Intl.NumberFormat`. Other formats (`rgb24`, `nv12`, …) pass through.

```typescript
'yuv422p10le' | pixelFormat              // → "4:2:2, 10 bit"
'yuvj420p' | pixelFormat                 // → "4:2:0, 8 bit"
'yuv444p12le' | pixelFormat : 'de-DE'    // → "4:4:4, 12 Bit"
'rgb24' | pixelFormat                    // → "rgb24"
```

## API Reference

TypeDoc API documentation: [dasch.ng/api/@dasch-ng/utils](https://dasch.ng/api/@dasch-ng/utils/README)
