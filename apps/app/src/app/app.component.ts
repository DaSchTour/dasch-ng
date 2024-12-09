import { Component, inject } from '@angular/core';
import { MatRightSheet } from '@dasch-ng/material-right-sheet';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  selector: 'dasch-ng-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  title = 'app';
  private readonly rightSheet = inject(MatRightSheet);

  openRightSheet() {
    this.rightSheet.open(NxWelcomeComponent);
  }
}
