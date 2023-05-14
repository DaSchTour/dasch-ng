import { createPipeFactory, SpectatorPipe } from '@ngneat/spectator/jest';

import { JoinPipe } from './join.pipe';

describe('JoinPipe', () => {
  it('create an instance', () => {
    const pipe = new JoinPipe();

    expect(pipe).toBeTruthy();
  });

  let spectator: SpectatorPipe<JoinPipe>;
  const createPipe = createPipeFactory(JoinPipe);

  it('should join array with ", " by default', () => {
    spectator = createPipe(`{{ [1, 2, 3] | join }}`);
    expect(spectator.element).toHaveText('1, 2, 3');
  });

  it('should join array with first argument', () => {
    spectator = createPipe(`{{ [1, 2, 3] | join: '/' }}`);
    expect(spectator.element).toHaveText('1/2/3');
  });

  it('should return string as it is', () => {
    spectator = createPipe(`{{ 'Teststring' | join }}`);
    expect(spectator.element).toHaveText('Teststring');
  });

  it('should return empty string for null', () => {
    spectator = createPipe(`{{ null | join }}`);
    expect(spectator.element).toHaveText('');
  });
});
