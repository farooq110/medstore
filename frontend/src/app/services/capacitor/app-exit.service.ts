/**
 * App Exit Service
 * Handles graceful app exit using Capacitor
 */

import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class AppExitService {
  /**
   * Exit the app gracefully
   */
  async exitApp(): Promise<void> {
    try {
      console.log('[AppExit] Exiting app...');
      await App.exitApp();
    } catch (error) {
      console.error('[AppExit] Failed to exit app:', error);
      // Fallback: In web environments, this will fail gracefully
      // On native platforms, the app will be closed
    }
  }
}
