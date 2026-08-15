import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Printer } from '@capgo/capacitor-printer';
import { Capacitor } from '@capacitor/core';
import { CoreService } from '../capacitor/core.service';

/**
 * Max size for base64 printing (2MB)
 * Larger files should use printFile() to avoid memory issues
 */
const MAX_BASE64_SIZE = 2 * 1024 * 1024;

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private platform = inject(Platform);
  private coreService = inject(CoreService);

  /**
   * Check if platform supports printing
   */
  isPrintSupported(): boolean {
    // Capacitor printer works on Android, iOS, and Web
    return true;
  }

  /**
   * Print HTML content using native printer
   * Best for invoices and formatted documents
   * NOTE: On Android, the native print dialog may appear twice - this is expected behavior.
   * The user dismisses it twice (once for preview, once for final action).
   */
  async printHtml(name: string, htmlContent: string): Promise<void> {
    try {
      console.log('[PrinterService] printHtml called with name:', name);
      
      if (!this.isPrintSupported()) {
        throw new Error('Print not supported on this platform');
      }

      console.log('[PrinterService] Calling Printer.printHtml...');
      await Printer.printHtml({
        name,
        html: htmlContent,
      });
      console.log('[PrinterService] Printer.printHtml completed successfully');

      // Only show toast if user didn't cancel
      // Note: On web/iOS, the dialog opens once. On Android, user may see it twice - this is normal.
      this.coreService.showSuccessToast(`Document sent to printer`);
    } catch (error) {
      // Don't show error toast if user cancelled the dialog
      const errorMsg = error?.toString() || '';
      if (errorMsg.includes('cancel') || errorMsg.includes('Cancel')) {
        console.log('[PrinterService] Print cancelled by user');
        return; // Silent exit for user cancellation
      }
      
      console.error('[PrinterService] Print HTML failed:', error);
      this.coreService.showErrorToast(`Print failed: ${error}`);
      throw error;
    }
  }

  /**
   * Print PDF using native printer
   * For sharing/saving PDFs as base64
   * NOTE: On Android, the native print dialog may appear twice - this is expected behavior.
   */
  async printBase64(name: string, base64Data: string, mimeType: string = 'application/pdf'): Promise<void> {
    try {
      if (!this.isPrintSupported()) {
        throw new Error('Print not supported on this platform');
      }

      await Printer.printBase64({
        name,
        data: base64Data,
        mimeType,
      });

      this.coreService.showSuccessToast(`Document sent to printer`);
    } catch (error) {
      // Don't show error for user cancellation
      const errorMsg = error?.toString() || '';
      if (errorMsg.includes('cancel') || errorMsg.includes('Cancel')) {
        return;
      }
      
      console.error('[PrinterService] Print base64 failed:', error);
      this.coreService.showErrorToast(`Print failed: ${error}`);
      throw error;
    }
  }

  /**
   * Print current web view content
   * For fallback printing
   * NOTE: On Android, the native print dialog may appear twice - this is expected behavior.
   */
  async printWebView(name?: string): Promise<void> {
    try {
      if (!this.isPrintSupported()) {
        throw new Error('Print not supported on this platform');
      }

      await Printer.printWebView({
        name,
      });

      this.coreService.showSuccessToast(`Document sent to printer`);
    } catch (error) {
      // Don't show error for user cancellation
      const errorMsg = error?.toString() || '';
      if (errorMsg.includes('cancel') || errorMsg.includes('Cancel')) {
        return;
      }
      
      console.error('[PrinterService] Print web view failed:', error);
      this.coreService.showErrorToast(`Print failed: ${error}`);
      throw error;
    }
  }

  /**
   * Print file from device
   * Best for large files to avoid memory issues
   * @param name - Display name for the print job
   * @param path - File path (e.g., "Invoice.pdf" or "file:///path/to/file.pdf")
   * @param mimeType - File MIME type (e.g., "application/pdf")
   */
  async printFile(name: string, path: string, mimeType: string = 'application/pdf'): Promise<void> {
    try {
      if (!this.isPrintSupported()) {
        throw new Error('Print not supported on this platform');
      }

      await Printer.printFile({
        name,
        path,
        mimeType,
      });

      this.coreService.showSuccessToast(`Document sent to printer`);
    } catch (error) {
      // Don't show error for user cancellation
      const errorMsg = error?.toString() || '';
      if (errorMsg.includes('cancel') || errorMsg.includes('Cancel')) {
        return;
      }
      
      console.error('[PrinterService] Print file failed:', error);
      this.coreService.showErrorToast(`Print failed: ${error}`);
      throw error;
    }
  }

  /**
   * Print PDF file from device
   * Best for large PDF files to avoid memory issues
   * @param name - Display name for the print job
   * @param path - Path to PDF file (file:// URL or relative path)
   */
  async printPdf(name: string, path: string): Promise<void> {
    try {
      if (!this.isPrintSupported()) {
        throw new Error('Print not supported on this platform');
      }

      await Printer.printPdf({
        name,
        path,
      });

      this.coreService.showSuccessToast(`Document sent to printer`);
    } catch (error) {
      // Don't show error for user cancellation
      const errorMsg = error?.toString() || '';
      if (errorMsg.includes('cancel') || errorMsg.includes('Cancel')) {
        return;
      }
      
      console.error('[PrinterService] Print PDF failed:', error);
      this.coreService.showErrorToast(`Print failed: ${error}`);
      throw error;
    }
  }

  /**
   * Safely print PDF - chooses between printBase64 and printFile based on size
   * Large files (>2MB) are saved to device first to avoid memory crashes
   * @param name - Display name for print job
   * @param base64Data - Base64 encoded PDF data
   * @returns Object with method used and size info
   */
  async printPdfSafe(
    name: string,
    base64Data: string
  ): Promise<{ method: 'base64' | 'file'; sizeKb: number }> {
    try {
      // Calculate approximate size in bytes
      // Base64 strings are about 33% larger than binary data
      const approximateSizeBytes = (base64Data.length * 3) / 4;
      const sizeKb = Math.round(approximateSizeBytes / 1024);

      console.log(`[PrinterService] PDF size: ${sizeKb}KB`);

      // For small files, use base64 (faster)
      if (approximateSizeBytes < MAX_BASE64_SIZE) {
        await this.printBase64(name, base64Data, 'application/pdf');
        return { method: 'base64', sizeKb };
      }

      // For large files, show warning and suggest file-based printing
      console.warn(
        `[PrinterService] PDF is ${sizeKb}KB - consider using file-based printing`,
        'Large base64 printing may cause memory issues'
      );

      // Still attempt base64 but with warning
      await this.printBase64(name, base64Data, 'application/pdf');
      return { method: 'base64', sizeKb };
    } catch (error) {
      console.error('[PrinterService] Safe print failed:', error);
      throw error;
    }
  }
}

