import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonSelect,
} from '@ionic/angular/standalone';
import { CoreService } from 'src/app/services/capacitor/core.service';

@Component({
  selector: 'app-basic-select',
  templateUrl: './basic-select.component.html',
  styleUrls: ['./basic-select.component.scss'],
  imports: [
    IonSelect,
    ReactiveFormsModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicSelectComponent {
  readonly label = input<string>('');
  readonly errorLabel = input<string>('');
  @Input() formC: any = null;
  readonly placeholder = input<string>('');
  readonly customError = input<string>('');
  readonly selectInterface = input<string>('modal'); // 'popover', 'modal', 'action-sheet'

  constructor(public coreService: CoreService) {
   
  }

  get error() {
    if (this.errorLabel() === '' || this.formC === null) return '';
    return this.coreService.getErrorMessage(this.formC, this.errorLabel());
  }
}
