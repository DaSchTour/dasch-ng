import { Directive, ElementRef, Output } from '@angular/core';

import { ResizeObserverService } from './resize-observer.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[observeResize]',
  standalone: true,
})
export class ObserveResizeDirective {
  @Output() public readonly entries = this.resizeObserver.observe(this.elementRef.nativeElement);
  constructor(private readonly elementRef: ElementRef, private readonly resizeObserver: ResizeObserverService) {}
}
