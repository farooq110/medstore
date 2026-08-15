import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonAlert } from '@ionic/angular/standalone';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [IonAlert],
  template: `
    <ion-alert
      [isOpen]="visible"
      header="Confirm"
      [message]="message"
      [buttons]="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: onCancel.bind(this)
        },
        {
          text: 'Confirm',
          role: 'confirm',
          handler: onConfirm.bind(this)
        }
      ]"
    ></ion-alert>
  `,
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() message = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
