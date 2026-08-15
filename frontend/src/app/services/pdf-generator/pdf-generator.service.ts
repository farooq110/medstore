import { Injectable, inject } from '@angular/core';
import { PdfGenerator } from '@capgo/capacitor-pdf-generator';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import html2pdf from 'html2pdf.js';
import { CoreService } from '../capacitor/core.service';

/**
 * PDF Generator Service
 * 
 * Handles PDF generation from HTML content with platform-aware support:
 * - Native platforms: Uses @capgo/capacitor-pdf-generator
 * - Web platform: Falls back to html2pdf.js
 * - File system operations via Filesystem API (native only)
 */
@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  private coreService = inject(CoreService);

  /**
   * Generate PDF from HTML content and save to file system
   * Uses native Capacitor plugin on mobile, html2pdf fallback on web
   * @param htmlContent - HTML string to convert to PDF
   * @param fileName - Name of the PDF file (without extension)
   * @returns Promise with the file path
   */
  async generateAndSavePDF(htmlContent: string, fileName: string): Promise<string> {
    try {
      console.log('[PdfGeneratorService] Starting PDF generation:', fileName);
      
      // Check if running on native platform
      const isNative = Capacitor.isNativePlatform();
      console.log('[PdfGeneratorService] Platform is native:', isNative);

      if (isNative) {
        return await this.generatePDFNative(htmlContent, fileName);
      } else {
        return await this.generatePDFWeb(htmlContent, fileName);
      }
    } catch (error) {
      console.error('[PdfGeneratorService] PDF generation failed:', error);
      this.coreService.showErrorToast(`PDF generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate PDF using Capacitor plugin (native platforms)
   */
  private async generatePDFNative(htmlContent: string, fileName: string): Promise<string> {
    try {
      console.log('[PdfGeneratorService] Using native Capacitor PDF generator');

      // Generate PDF from HTML using Capacitor plugin
      const result = await PdfGenerator.fromData({
        data: htmlContent,
        baseUrl: 'about:blank',
      } as any);

      console.log('[PdfGeneratorService] PDF generated, result type:', result.type);

      if (result.type === 'base64' && result.base64) {
        // Save base64 to file
        const filePath = await this.saveBase64ToFile(result.base64, fileName);
        console.log('[PdfGeneratorService] PDF saved to:', filePath);
        
        // Share the PDF file
        try {
          await Share.share({
            title: 'Share Invoice PDF',
            text: 'Share your invoice',
            url: filePath,
            dialogTitle: 'How would you like to share?',
          });
          console.log('[PdfGeneratorService] PDF shared via native system');
          this.coreService.showSuccessToast(`PDF shared successfully`);
        } catch (shareError: any) {
          if (!shareError?.toString().includes('cancelled') && !shareError?.toString().includes('Cancel')) {
            console.log('[PdfGeneratorService] Share cancelled or unavailable, PDF saved to cache');
            this.coreService.showSuccessToast(`PDF saved: ${fileName}.pdf`);
          }
        }
        
        return filePath;
      } else if (result.type === 'share') {
        // Shared successfully
        console.log('[PdfGeneratorService] PDF shared successfully');
        this.coreService.showSuccessToast(`PDF shared successfully`);
        return 'shared';
      }

      throw new Error('Unknown PDF generation result type');
    } catch (error) {
      console.error('[PdfGeneratorService] Native PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate PDF using html2pdf (web platform)
   */
  private async generatePDFWeb(htmlContent: string, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[PdfGeneratorService] Using web-based html2pdf library');

        // Create a temporary container for html2pdf
        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        try {
          // Convert HTML to PDF using html2pdf
          const fileNameWithExt = `${fileName}.pdf`;
          const options = {
            margin: [10, 10, 10, 10] as [number, number, number, number],
            filename: fileNameWithExt,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              logging: false,
              allowTaint: true,
              useCORS: true,
              backgroundColor: '#ffffff',
            },
            jsPDF: { 
              orientation: 'portrait' as const, 
              unit: 'mm', 
              format: 'a4',
            },
            pagebreak: { mode: 'avoid-all' },
          };

          console.log('[PdfGeneratorService] Converting to PDF...');
       
          // Chain the promise properly - wait for PDF generation to complete
          html2pdf()
            .set(options)
            .from(element)
            .save()
            .then(() => {
              console.log('[PdfGeneratorService] PDF generated successfully:', fileNameWithExt);
              // this.coreService.showSuccessToast(`PDF downloaded: ${fileNameWithExt}`);
              resolve(fileNameWithExt);
            })
            .catch((error: any) => {
              console.error('[PdfGeneratorService] html2pdf save failed:', error);
              reject(error);
            })
            .finally(() => {
              // Clean up after PDF generation is complete
              if (document.body.contains(element)) {
                document.body.removeChild(element);
              }
            });
        } catch (error) {
          console.error('[PdfGeneratorService] Web PDF generation setup failed:', error);
          // Clean up on error
          if (document.body.contains(element)) {
            document.body.removeChild(element);
          }
          reject(error);
        }
      } catch (error) {
        console.error('[PdfGeneratorService] Web PDF generation failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate PDF and share directly
   * @param htmlContent - HTML string to convert to PDF
   * @param fileName - Name for the shared PDF
   */
  async generateAndSharePDF(htmlContent: string, fileName: string): Promise<void> {
    try {
      console.log('[PdfGeneratorService] Starting PDF generation for sharing:', fileName);

      const isNative = Capacitor.isNativePlatform();
      
      if (!isNative) {
        console.log('[PdfGeneratorService] Share not available on web platform, using download instead');
        await this.generateAndSavePDF(htmlContent, fileName);
        return;
      }

      if (!this.isShareSupported()) {
        throw new Error('Share not supported on this platform');
      }

      // Generate PDF from HTML with share intent
      const result = await PdfGenerator.fromData({
        data: htmlContent,
        baseUrl: 'about:blank',
      } as any);

      if (result.type === 'share' && result.completed) {
        console.log('[PdfGeneratorService] PDF shared successfully');
        this.coreService.showSuccessToast(`PDF shared successfully`);
      } else if (result.type === 'base64' && result.base64) {
        // Fallback: if share result returned base64, save to cache and share
        const filePath = await this.saveBase64ToCacheForSharing(result.base64, fileName);
        console.log('[PdfGeneratorService] PDF saved to cache, initiating share');
        
        // Share the cached file
        try {
          await Share.share({
            title: 'Share Invoice PDF',
            text: 'Share your invoice',
            url: filePath,
            dialogTitle: 'How would you like to share?',
          });
          console.log('[PdfGeneratorService] PDF shared via native system');
          this.coreService.showSuccessToast(`PDF shared successfully`);
        } catch (shareError: any) {
          if (!shareError?.toString().includes('cancelled') && !shareError?.toString().includes('Cancel')) {
            console.warn('[PdfGeneratorService] Share cancelled or unavailable');
          }
        }
      } else {
        throw new Error('PDF generation did not return share result');
      }
    } catch (error) {
      console.error('[PdfGeneratorService] PDF sharing failed:', error);
      
      if (!error?.toString().includes('cancelled') && !error?.toString().includes('Cancel')) {
        this.coreService.showErrorToast(`PDF share failed: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Save base64 string to cache directory for sharing
   * Uses app cache directory which doesn't require permissions
   * @param base64Data - Base64 encoded PDF data
   * @param fileName - Name for the file (without extension)
   * @returns Promise with the full file path
   */
  private async saveBase64ToFile(base64Data: string, fileName: string): Promise<string> {
    try {
      const fileNameWithExt = `${fileName}.pdf`;
      
      // Save to app cache directory (no permissions required)
      const result = await Filesystem.writeFile({
        path: fileNameWithExt,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      console.log('[PdfGeneratorService] File saved to cache:', result.uri);
      return result.uri;
    } catch (error) {
      console.error('[PdfGeneratorService] File save to cache failed:', error);
      throw new Error(`Failed to save PDF file: ${error}`);
    }
  }

  /**
   * Save base64 string to cache for sharing
   * Uses app cache directory which doesn't require permissions
   * @param base64Data - Base64 encoded PDF data
   * @param fileName - Name for the file (without extension)
   * @returns Promise with the full file path
   */
  private async saveBase64ToCacheForSharing(base64Data: string, fileName: string): Promise<string> {
    try {
      const fileNameWithExt = `${fileName}.pdf`;
      
      // Save to app cache directory (no permissions required)
      const result = await Filesystem.writeFile({
        path: fileNameWithExt,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      console.log('[PdfGeneratorService] File saved to cache:', result.uri);
      return result.uri;
    } catch (error) {
      console.error('[PdfGeneratorService] File save to cache failed:', error);
      throw new Error(`Failed to save PDF file: ${error}`);
    }
  }

  /**
   * Check if platform supports sharing
   */
  private isShareSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get CoreService instance for notifications
   */
  getCoreService(): CoreService {
    return this.coreService;
  }
}
