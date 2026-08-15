import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, print, download } from 'ionicons/icons';

@Component({
  selector: 'app-print-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonProgressBar,
  ],
  templateUrl: './print-preview-modal.component.html',
  styleUrl: './print-preview-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintPreviewModalComponent {
  @Input() isOpen = false;
  @Input() invoiceHtml = '';
  @Input() isLoading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() downloadPDF = new EventEmitter<void>();

  constructor() {
    addIcons({ close, print, download });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDismiss(): void {
    this.cancel.emit();
  }

  onPrint(): void {
    this.print.emit();
  }

  onDownloadPDF(): void {
    this.downloadPDF.emit();
  }
}
