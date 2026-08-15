import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  closeOutline,
  closeCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import {
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';

export interface StockIssue {
  itemName: string;
  requestedQty: number;
  availableStock: number;
  reason: 'Out of Stock' | 'Quantity exceeds available';
}

export interface StockValidationState {
  visible: boolean;
  issues: StockIssue[];
  onConfirm?: () => void;
}

@Component({
  selector: 'app-stock-validation-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonBadge,
  ],
  templateUrl: './stock-validation-modal.component.html',
  styleUrl: './stock-validation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockValidationModalComponent {
  // Inputs
  isOpen = input<boolean>(false);
  issues = input<StockIssue[]>([]);

  // Outputs
  confirm = output<void>();
  cancel = output<void>();

  constructor() {
    addIcons({
      warningOutline,
      closeOutline,
      closeCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
    });
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isOutOfStock(reason: string): boolean {
    return reason === 'Out of Stock';
  }
}
