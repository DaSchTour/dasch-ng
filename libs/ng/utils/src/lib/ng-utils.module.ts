import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IsEmptyPipe } from './is-empty.pipe';
import { IsNilPipe } from './is-nil.pipe';
import { JoinPipe } from './join.pipe';
import { DecimalBytesPipe } from './decimal-bytes.pipe';
import { NthPipe } from './nth.pipe';
import { IncludesPipe } from './includes.pipe';
import { SortByPipe } from './sort-by.pipe';
import { PropPipe } from './prop.pipe';
import { ReversePipe } from './reverse.pipe';
import { SizePipe } from './size.pipe';

const pipes = [
  DecimalBytesPipe,
  IncludesPipe,
  IsEmptyPipe,
  IsNilPipe,
  JoinPipe,
  NthPipe,
  PropPipe,
  ReversePipe,
  SizePipe,
  SortByPipe,
];
@NgModule({
  imports: [...pipes],
  exports: [...pipes],
})
export class NgUtilsModule {}
