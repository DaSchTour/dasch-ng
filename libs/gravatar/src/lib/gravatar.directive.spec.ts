import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { GravatarDirective } from './gravatar.directive';

describe('GravatarDirective', () => {
  let spectator: SpectatorDirective<GravatarDirective>;
  const createDirective = createDirectiveFactory(GravatarDirective);

  it('should add given src to img element', () => {
    spectator = createDirective(`<img gravatar src='https://local.my/img.jpeg' />`);
    expect(spectator.element).toHaveAttribute('src', 'https://local.my/img.jpeg');
  });

  it('should add hashed email if no src is given', () => {
    spectator = createDirective(`<img gravatar email='just@test.ng' fallback='blank' size='16' />`);
    expect(spectator.element).toHaveAttribute('src', '//www.gravatar.com/avatar/318a468c6a62fe02884bd75feeb45166?s=16&d=blank');
  });
});
