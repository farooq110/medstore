import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.scss'],
  imports: [
    CommonModule,
    IonSelect,
    IonSelectOption,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelectComponent {
  readonly label = input<string>('');
  readonly value = input<string | string[]>('');
  readonly options = input<FilterOption[]>([]);
  readonly placeholder = input<string>('Select option');
  readonly disabled = input<boolean>(false);
  readonly defaultLabel = input<string>('All');
  readonly multiSelect = input<boolean>(false);
  readonly valueChange = output<string | string[]>();

  constructor() {
    addIcons({ closeCircleOutline });
  }

  onValueChange(newValue: string | string[]): void {
    // When multiSelect is false and array is passed, convert to string
    if (!this.multiSelect() && Array.isArray(newValue)) {
      this.valueChange.emit(newValue.length > 0 ? newValue[0] : '');
    } else if (this.multiSelect() && typeof newValue === 'string') {
      // When multiSelect is true and string is passed, convert to array
      this.valueChange.emit(newValue ? [newValue] : []);
    } else {
      // Otherwise emit as-is
      this.valueChange.emit(newValue);
    }
  }

  getSelectedLabel(): string {
    const currentValue = this.value();
    
    if (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) {
      return this.placeholder();
    }

    if (Array.isArray(currentValue)) {
      // Multi-select: show count and labels
      const selectedLabels = currentValue
        .map(val => this.options().find(opt => opt.value === val)?.label)
        .filter(Boolean);
      
      if (selectedLabels.length === 0) return this.placeholder();
      if (selectedLabels.length === 1) return selectedLabels[0]!;
      return `${selectedLabels.length} selected`;
    } else {
      // Single select
      const selected = this.options().find(opt => opt.value === currentValue);
      return selected?.label || this.placeholder();
    }
  }
}
