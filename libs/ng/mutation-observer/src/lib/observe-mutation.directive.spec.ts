import {
  createDirectiveFactory,
  mockProvider,
  SpectatorDirective,
} from '@ngneat/spectator/jest';

import { ObserveMutationDirective } from './observe-mutation.directive';
import { MutationObserverService } from './mutation-observer.service';

describe('ObserveResizeDirective', () => {
  let spectator: SpectatorDirective<ObserveMutationDirective>;
  const createDirective = createDirectiveFactory({
    directive: ObserveMutationDirective,
    template: `<div observeResize>Testing Directive Providers</div>`,
    providers: [mockProvider(MutationObserverService)],
  });

  it('should get the instance', () => {
    spectator = createDirective();
    const instance = spectator.directive;
    expect(instance).toBeTruthy();
  });

  it('should call observe', () => {
    spectator = createDirective();
    const service = spectator.inject(MutationObserverService);
    expect(service.observe).toHaveBeenCalled();
  });
});
