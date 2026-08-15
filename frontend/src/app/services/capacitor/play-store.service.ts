/**
 * Play Store Redirect Service
 * Handles redirecting users to Play Store for app updates
 * For Android: Uses native Android intents (no Browser plugin needed)
 * For iOS: Uses Browser plugin for App Store redirect
 */

import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular/standalone';
import { CoreService } from './core.service';

@Injectable({
  providedIn: 'root',
})
export class PlayStoreService {
  private readonly PLAY_STORE_PACKAGE = 'com.invoicedesk.app';
  private readonly PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${this.PLAY_STORE_PACKAGE}`;
  private readonly PLAY_STORE_MARKET_URL = `market://details?id=${this.PLAY_STORE_PACKAGE}`;

  constructor(
    private readonly coreService: CoreService,
    private readonly platform: Platform
  ) {}

  /**
   * Redirect user to Play Store for app update
   * Android: Uses native intents directly
   * iOS: Uses Browser plugin
   */
  async redirectToPlayStore(): Promise<void> {
    try {
      console.log('[PlayStore] Attempting to open Play Store...');
      console.log('[PlayStore] Platform:', this.platform.platforms());

      if (this.platform.is('android')) {
        console.log('[PlayStore] Detected Android platform - using native intents');
        await this.openAndroidPlayStoreNative();
      } else if (this.platform.is('ios')) {
        console.log('[PlayStore] Detected iOS platform - using Browser plugin');
        await this.openIOSAppStore();
      } else {
        console.log('[PlayStore] Detected web/other platform');
        await this.openWebURL();
      }

      await this.coreService.showSuccessToast('Opening Play Store...');
    } catch (error) {
      console.error('[PlayStore] Failed to open Play Store:', error);
      await this.coreService.showErrorToast('Failed to open Play Store. Please search for "Invoice Desk" in Play Store manually.');
    }
  }

  /**
   * Open Android Play Store using native intents (no Browser plugin)
   * First tries market:// scheme (fastest if Play Store is installed)
   * Then tries web URL as fallback
   */
  private async openAndroidPlayStoreNative(): Promise<void> {
    try {
      // Method 1: Try market:// scheme first (direct to Play Store if installed)
      console.log('[PlayStore-Android] Attempting market:// intent:', this.PLAY_STORE_MARKET_URL);
      
      const marketLink = document.createElement('a');
      marketLink.href = this.PLAY_STORE_MARKET_URL;
      marketLink.target = '_system';
      marketLink.style.display = 'none';
      
      document.body.appendChild(marketLink);
      marketLink.click();
      document.body.removeChild(marketLink);

      // Give it a moment to see if it worked
      await this.delay(500);
      
      console.log('[PlayStore-Android] market:// intent launched');
      return;
    } catch (error) {
      console.warn('[PlayStore-Android] market:// failed, trying https URL:', error);

      try {
        // Method 2: Try HTTPS URL as fallback
        console.log('[PlayStore-Android] Attempting HTTPS URL:', this.PLAY_STORE_WEB_URL);
        
        const httpsLink = document.createElement('a');
        httpsLink.href = this.PLAY_STORE_WEB_URL;
        httpsLink.target = '_system';
        httpsLink.style.display = 'none';
        
        document.body.appendChild(httpsLink);
        httpsLink.click();
        document.body.removeChild(httpsLink);

        console.log('[PlayStore-Android] HTTPS URL launched');
        return;
      } catch (httpsError) {
        console.error('[PlayStore-Android] HTTPS URL also failed:', httpsError);
        throw new Error('Failed to open Play Store with both market:// and HTTPS URLs');
      }
    }
  }

  /**
   * Open iOS App Store using Browser plugin
   */
  private async openIOSAppStore(): Promise<void> {
    try {
      // iOS App Store URL - Update with your actual app ID
      const iosAppId = '1234567890'; // TODO: Update with actual iOS app ID
      const iosURL = `itms-apps://apps.apple.com/app/id${iosAppId}`;

      console.log('[PlayStore-iOS] Opening App Store:', iosURL);
      await Browser.open({
        url: iosURL,
        windowName: '_system',
      });
      console.log('[PlayStore-iOS] App Store opened successfully');
    } catch (error) {
      console.error('[PlayStore-iOS] Failed to open App Store:', error);

      // Fallback to web search
      try {
        console.log('[PlayStore-iOS] Trying web fallback');
        await Browser.open({
          url: 'https://apps.apple.com/search?term=invoice+desk',
          windowName: '_system',
        });
      } catch (webError) {
        console.error('[PlayStore-iOS] Web fallback also failed:', webError);
        throw new Error('Failed to open iOS App Store');
      }
    }
  }

  /**
   * Open web URL fallback (for non-mobile platforms)
   */
  private async openWebURL(): Promise<void> {
    try {
      console.log('[PlayStore-Web] Opening web URL:', this.PLAY_STORE_WEB_URL);
      
      const webLink = document.createElement('a');
      webLink.href = this.PLAY_STORE_WEB_URL;
      webLink.target = '_blank';
      webLink.style.display = 'none';
      
      document.body.appendChild(webLink);
      webLink.click();
      document.body.removeChild(webLink);

      console.log('[PlayStore-Web] Web URL opened');
    } catch (error) {
      console.error('[PlayStore-Web] Failed to open web URL:', error);
      throw error;
    }
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
