import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import {
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import { CoreService } from 'src/app/services/capacitor/core.service';

@Component({
  selector: 'app-basic-input',
  standalone: true,
  templateUrl: './basic-input.component.html',
  styleUrls: ['./basic-input.component.scss'],
  imports: [
    IonInput,
    ReactiveFormsModule,
    IonInputPasswordToggle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInputComponent {
  readonly label = input<string>('');
  readonly errorLabel = input<string>('');
  @Input() formC: AbstractControl | null = null;
  readonly customError = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly autocomplete = input<string>('off');
  readonly disabled = input<boolean>(false);

  constructor(public coreService: CoreService) {}

  get formControl(): FormControl {
    return this.formC as FormControl;
  }

  get error() {
    if (this.errorLabel() === '' || this.formC === null) {
      return '';
    }
    return this.coreService.getErrorMessage(this.formC, this.errorLabel());
  }
}

