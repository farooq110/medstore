import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import {
  IonInput,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { CoreService } from 'src/app/services/capacitor/core.service';

@Component({
  selector: 'app-quantity-counter',
  standalone: true,
  templateUrl: './quantity-counter.component.html',
  styleUrls: ['./quantity-counter.component.scss'],
  imports: [
    IonInput,
    IonButton,
    IonLabel,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityCounterComponent {
  readonly label = input<string>('Quantity');
  readonly errorLabel = input<string>('');
  readonly placeholder = input<string>('Enter quantity');
  readonly customError = input<string>('');
  readonly minValue = input<number>(1);
  readonly maxValue = input<number>(999);
  
  @Input() formC: AbstractControl | null = null;

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

  get currentValue(): number {
    return this.formControl?.value || this.minValue();
  }

  get isMinDisabled(): boolean {
    return this.currentValue <= this.minValue();
  }

  get isMaxDisabled(): boolean {
    return this.currentValue >= this.maxValue();
  }

  increase() {
    if (!this.isMaxDisabled) {
      const newValue = this.currentValue + 1;
      this.formControl?.setValue(newValue);
    }
  }

  decrease() {
    if (!this.isMinDisabled) {
      const newValue = this.currentValue - 1;
      this.formControl?.setValue(newValue);
    }
  }
}
