import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonItem,
  IonIcon,
  IonText,
  IonRippleEffect,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-basic-button',
  standalone: true,
  templateUrl: './basic-button.component.html',
  styleUrls: ['./basic-button.component.scss'],
  imports: [
    IonItem,
    IonIcon,
    IonText,
    IonRippleEffect,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicButtonComponent {
  readonly isDisable = input<boolean>(false);
  readonly label = input<string>('');
  readonly actionComplete = output<void>();
  readonly type = input<string>('button');
  readonly icon = input<string>('');
  readonly iconSvg = input<string>('');
  readonly background = input<string>('');
  readonly color = input<string>('');
  readonly border = input<string>('');
  readonly justify = input<string>('');

  constructor() {}

  callAction() {
    this.actionComplete.emit();
  }
}
