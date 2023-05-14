import { createPipeFactory, SpectatorPipe } from '@ngneat/spectator/jest';

import { ReversePipe } from './reverse.pipe';

xdescribe('ReversePipe ', () => {
  let spectator: SpectatorPipe<ReversePipe>;
  const createPipe = createPipeFactory({
    pipe: ReversePipe,
    template: `{{ prop | reverse }}`,
  });

  it('should change the background color', () => {
    spectator = createPipe({
      hostProps: {
        prop: [1, 2, 3],
      },
    });

    expect(spectator.element).toBe('[3, 2, 1]');
  });
});
