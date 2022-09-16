The `MatRightSheet` service can be used to open Material Design panels to the bottom of the screen.
These panels are intended primarily as an interaction on mobile devices where they can be used as an
alternative to dialogs and menus.

<!-- example(right-sheet-overview) -->

You can open a bottom sheet by calling the `open` method with a component to be loaded and an
optional config object. The `open` method will return an instance of `MatRightSheetRef`:

```ts
const rightSheetRef = rightSheet.open(SocialShareComponent, {
  ariaLabel: 'Share on social media',
});
```

The `MatRightSheetRef` is a reference to the currently-opened bottom sheet and can be used to close
it or to subscribe to events. Note that only one bottom sheet can be open at a time. Any component
contained inside of a bottom sheet can inject the `MatRightSheetRef` as well.

```ts
rightSheetRef.afterDismissed().subscribe(() => {
  console.log('Bottom sheet has been dismissed.');
});

rightSheetRef.dismiss();
```

### Sharing data with the bottom sheet component.

If you want to pass in some data to the bottom sheet, you can do so using the `data` property:

```ts
const rightSheetRef = bottomSheet.open(HobbitSheet, {
  data: { names: ['Frodo', 'Bilbo'] },
});
```

Afterwards you can access the injected data using the `MAT_RIGHT_SHEET_DATA` injection token:

```ts
import { Component, Inject } from '@angular/core';
import { MAT_RIGHT_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'hobbit-sheet',
  template: 'passed in {{ data.names }}',
})
export class HobbitSheet {
  constructor(@Inject(MAT_RIGHT_SHEET_DATA) public data: any) {}
}
```

### Specifying global configuration defaults

Default bottom sheet options can be specified by providing an instance of `MatRightSheetConfig`
for `MAT_RIGHT_SHEET_DEFAULT_OPTIONS` in your application's root module.

```ts
@NgModule({
  providers: [
    {provide: MAT_RIGHT_SHEET_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ]
})
```

### Accessibility

By default, the bottom sheet has `role="dialog"` on the root element and can be labelled using the
`ariaLabel` property on the `MatRightSheetConfig`.

When a bottom sheet is opened, it will move focus to the first focusable element that it can find.
In order to prevent users from tabbing into elements in the background, the Material bottom sheet
uses a [focus trap](https://material.angular.io/cdk/a11y/overview#focustrap) to contain focus
within itself. Once a bottom sheet is closed, it will return focus to the element that was focused
before it was opened.

#### Focus management

By default, the first tabbable element within the bottom sheet will receive focus upon open.
This can be configured by setting the `cdkFocusInitial` attribute on another focusable element.

#### Keyboard interaction

By default pressing the escape key will close the bottom sheet. While this behavior can
be turned off via the `disableClose` option, users should generally avoid doing so
as it breaks the expected interaction pattern for screen-reader users.
