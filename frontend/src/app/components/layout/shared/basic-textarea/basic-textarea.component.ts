import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { IonTextarea } from '@ionic/angular/standalone';
import { CoreService } from 'src/app/services/capacitor/core.service';

@Component({
  selector: 'app-basic-textarea',
  standalone: true,
  templateUrl: './basic-textarea.component.html',
  styleUrls: ['./basic-textarea.component.scss'],
  imports: [IonTextarea, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicTextareaComponent {
  readonly label = input<string>('');
  readonly errorLabel = input<string>('');
  @Input() formC: AbstractControl | null = null;
  readonly customError = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);

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
