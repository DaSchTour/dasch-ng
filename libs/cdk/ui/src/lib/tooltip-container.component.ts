import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, TemplateRef, ViewEncapsulation } from '@angular/core';

/** @internal Content of the tooltip overlay. Not part of the public API. */
@Component({
  selector: 'dasch-ui-tooltip',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    } @else {
      {{ content() }}
    }
  `,
  styles: `
    dasch-ui-tooltip {
      display: block;
      box-sizing: border-box;
      margin: var(--dasch-ui-tooltip-gap, 0.5rem);
      max-width: var(--dasch-ui-tooltip-max-width, 20rem);
      padding: var(--dasch-ui-tooltip-padding, 0.25rem 0.5rem);
      border-radius: var(--dasch-ui-tooltip-radius, 0.25rem);
      background: var(--dasch-ui-tooltip-background, #262626);
      color: var(--dasch-ui-tooltip-color, #fff);
      font-size: var(--dasch-ui-tooltip-font-size, 0.875rem);
      line-height: 1.4;
      overflow-wrap: anywhere;
      pointer-events: none;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tooltip', '[id]': 'id()' },
})
export class TooltipContainerComponent {
  readonly id = input.required<string>();
  readonly content = input<string | TemplateRef<unknown> | null | undefined>();
  protected readonly template = computed(() => {
    const content = this.content();
    return content instanceof TemplateRef ? content : null;
  });
}
