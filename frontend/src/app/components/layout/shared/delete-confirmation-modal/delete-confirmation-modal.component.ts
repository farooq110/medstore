import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline, trashOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IonModal, IonButton, IonIcon],
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrl: './delete-confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() itemName = '';
  @Input() title = 'Confirm Deletion';
  @Input() message = 'Are you sure you want to delete this item? This action cannot be undone.';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor() {
    addIcons({ warningOutline, trashOutline, closeOutline });
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
