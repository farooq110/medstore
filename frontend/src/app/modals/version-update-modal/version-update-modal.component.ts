/**
 * Version Update Modal Component
 * Displays a modal prompting user to update the app
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-version-update-modal',
  standalone: true,
  imports: [CommonModule, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  templateUrl: './version-update-modal.component.html',
  styleUrls: ['./version-update-modal.component.scss'],
})
export class VersionUpdateModalComponent {
  @Input() isOpen: boolean = false;
  @Input() isCheckingForUpdate: boolean = false;
  @Input() localVersion: string | null = null;
  @Input() serverVersion: string | null = null;
  @Input() mismatchType: 'outdated' | 'newer' | null = null;

  @Output() onUpdate = new EventEmitter<void>();
  @Output() onExit = new EventEmitter<void>();

  /**
   * Determine if modal should show update message
   * Show only if app is outdated (needs update)
   */
  shouldShowUpdatePrompt(): boolean {
    return this.mismatchType === 'outdated';
  }

  /**
   * Handle update button click
   */
  handleUpdate(): void {
    this.onUpdate.emit();
  }

  /**

   * Handle exit button click
   */
  handleExit(): void {
    this.onExit.emit();
  }

  /**
   * Get appropriate message based on mismatch type
   */
  getUpdateMessage(): string {
    if (this.mismatchType === 'outdated') {
      return `A new version is available. Current: ${this.localVersion}, Latest: ${this.serverVersion}. Please update to continue with new features.`;
    }
    if (this.mismatchType === 'newer') {
      return `You have a newer version than currently available on the server. Current: ${this.localVersion}, Server: ${this.serverVersion}.`;
    }
    return 'Versions match.';
  }
}
