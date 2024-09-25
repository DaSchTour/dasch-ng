import { createDirectiveFactory, mockProvider, SpectatorDirective } from '@ngneat/spectator/jest';

import { ObserveResizeDirective } from './observe-resize.directive';
import { ResizeObserverService } from './resize-observer.service';

describe('ObserveResizeDirective', () => {
  let spectator: SpectatorDirective<ObserveResizeDirective>;
  const createDirective = createDirectiveFactory({
    directive: ObserveResizeDirective,
    template: `<div observeResize>Testing Directive Providers</div>`,
    providers: [mockProvider(ResizeObserverService)],
  });

  it('should get the instance', () => {
    spectator = createDirective();
    const instance = spectator.directive;
    expect(instance).toBeTruthy();
  });

  it('should call observe', () => {
    spectator = createDirective();
    const service = spectator.inject(ResizeObserverService);
    expect(service.observe).toHaveBeenCalled();
  });
});
