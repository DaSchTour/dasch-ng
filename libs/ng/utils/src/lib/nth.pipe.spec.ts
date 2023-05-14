import { createPipeFactory, SpectatorPipe } from '@ngneat/spectator/jest';

import { NthPipe } from './nth.pipe';

describe('NthPipe', () => {
  it('create an instance', () => {
    const pipe = new NthPipe();

    expect(pipe).toBeTruthy();
  });

  let spectator: SpectatorPipe<NthPipe>;
  const createPipe = createPipeFactory(NthPipe);

  it('should return second element', () => {
    spectator = createPipe(`{{ [1, 2, 3] | nth: 1 }}`);
    expect(spectator.element).toHaveText('2');
  });

  it('should return empty if out of range', () => {
    spectator = createPipe(`{{ [1, 2, 3] | nth: 3 }}`);
    expect(spectator.element).toHaveText('');
  });
});
