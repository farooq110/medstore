import { Injectable, inject, Injector, createComponent, EnvironmentInjector } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { CoreService } from '../capacitor/core.service';
import { PrinterService } from '../printer/printer.service';
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service';
import { InvoiceTemplateComponent } from '../../components/invoice-template/invoice-template.component';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private platform = inject(Platform);
  private coreService = inject(CoreService);
  private printerService = inject(PrinterService);
  private pdfGeneratorService = inject(PdfGeneratorService);
  private injector = inject(EnvironmentInjector);

  /**
   * Check if platform supports printing
   */
  isPrintSupported(): boolean {
    const platform = this.platform;
    // Support Android and Web (non-native platforms)
    return platform.is('android') || !Capacitor.isNativePlatform();
  }

  /**
   * Check if platform supports sharing
   */
  isShareSupported(): boolean {
    // Share API available on native platforms
    return Capacitor.isNativePlatform();
  }

  /**
   * Get CoreService instance for showing toasts/notifications
   */
  getCoreService(): CoreService {
    return this.coreService;
  }

  /**
   * Share invoice as PDF via native share
   */
  async shareInvoice(orderNumber: string, order: any, business?: any): Promise<void> {
    try {
      if (!this.isShareSupported()) {
        throw new Error('Share not supported on this platform');
      }
      // Generate invoice text content for sharing
      const content = this.generateInvoiceText(order, business);
      
      // Share via native share dialog (text format - more reliable on Android)
      await Share.share({
        title: `Invoice ${orderNumber}`,
        text: content,
        dialogTitle: `Share Invoice ${orderNumber}`,
      });

      this.coreService.showSuccessToast(`Invoice shared successfully`);
    } catch (error) {
      console.error('[InvoiceService] Share failed:', error);
      // Only show error if user didn't cancel
      if (!error?.toString().includes('cancelled')) {
        this.coreService.showErrorToast(`Share failed: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Print invoice using native printer
   * Uses Capacitor Printer for best compatibility
   */
  async printInvoice(orderNumber: string, order: any, business?: any): Promise<void> {
    try {
      // Generate HTML invoice
      const htmlContent = this.generateHTMLInvoice(order, business);
      
      // Use native printer service
      await this.printerService.printHtml(`Invoice ${orderNumber}`, htmlContent);
      console.log('[InvoiceService] printInvoice completed successfully');
    } catch (error) {
      console.error('[InvoiceService] Print failed:', error);
      // Don't rethrow cancellation errors - let user silently cancel if they want
      if (!error?.toString().includes('cancel') && !error?.toString().includes('Cancel')) {
        throw error;
      }
    }
  }

  /**
   * Download/Print invoice as PDF
   * Uses native printer with print-to-PDF option
   */
  async downloadPDF(orderNumber: string, order: any, business?: any): Promise<void> {
    try {
      // Generate HTML invoice
      const htmlContent = this.generateHTMLInvoice(order, business);
      
      // Use native printer - user can select "Save as PDF" from print dialog
      await this.printerService.printHtml(`Invoice ${orderNumber}`, htmlContent);
      
      this.coreService.showSuccessToast(`Invoice ready for download`);
      console.log('[InvoiceService] downloadPDF completed successfully');
    } catch (error) {
      console.error('[InvoiceService] PDF download failed:', error);
      // Don't rethrow cancellation errors - let user silently cancel if they want
      if (!error?.toString().includes('cancel') && !error?.toString().includes('Cancel')) {
        throw error;
      }
    }
  }

  /**
   * Download PDF file directly (actual file download, not print dialog)
   * Uses Capacitor PDF Generator plugin
   */
  async downloadPDFFile(orderNumber: string, order: any, business?: any): Promise<void> {
    try {
      console.log('[InvoiceService] Starting PDF file download...');
      
      // Generate simple HTML invoice content (no document wrapper)
      const htmlContent = this.generateSimpleInvoiceHTML(order, business);
      
      // Use Capacitor PDF Generator service
      const fileName = `Invoice_${orderNumber}_${Date.now()}`;
      await this.pdfGeneratorService.generateAndSavePDF(htmlContent, fileName);
    } catch (error) {
      console.error('[InvoiceService] PDF file download failed:', error);
      throw error;
    }
  }

  /**
   * Generate simple HTML invoice for PDF (no document wrapper, just content)
   */
  private generateSimpleInvoiceHTML(order: any, business?: any): string {
    // ${order?.email ? `<div style="font-size: 12px; color: #666;">Email: ${business.email}</div>` : '<div style="font-size: 12px; color: #666;">Email: N/A</div>'}
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; padding: 20px; max-width: 900px;">
        <div style="border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px;">
          ${order.business?.name ? `<div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${order?.business.name || 'Business'}</div>` : '<div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">Business</div>'}
          ${order?.business?.phone ? `<div style="font-size: 12px; color: #666;">Phone: ${order?.business.phone}</div>` : '<div style="font-size: 12px; color: #666;">Phone: N/A</div>'}
        </div>

        <div style="font-size: 20px; font-weight: bold; margin: 20px 0;">INVOICE #${order.orderNumber}</div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <div style="font-size: 12px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div style="font-size: 12px;"><strong>Status:</strong> ${order.orderStatus?.replace(/_/g, ' ').toUpperCase()}</div>
          </div>
        </div>

        <div style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">CLIENT INFORMATION</div>
        <div style="font-size: 12px; margin: 5px 0;"><strong>Name:</strong> ${this.getClientName(order.client)}</div>
        ${this.getClientPhone(order.client) ? `<div style="font-size: 12px; margin: 5px 0;"><strong>Phone:</strong> ${this.getClientPhone(order.client)}</div>` : ''}
        ${this.getClientEmail(order.client) ? `<div style="font-size: 12px; margin: 5px 0;"><strong>Email:</strong> ${this.getClientEmail(order.client)}</div>` : ''}
        ${this.getClientNTN(order.client) ? `<div style="font-size: 12px; margin: 5px 0;"><strong>NTN:</strong> ${this.getClientNTN(order.client)}</div>` : '<div style="font-size: 12px; margin: 5px 0;"><strong>NTN:</strong> N/A</div>'}

        <div style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ITEMS</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd;">Item</th>
              <th style="background-color: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd;">Quantity</th>
              <th style="background-color: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd;">Price</th>
              <th style="background-color: #f0f0f0; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items && order.items.length > 0 ? order.items.map((item: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.itemName}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.quantity}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.sellingPrice}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.subtotal}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">No items</td></tr>'}
          </tbody>
        </table>

        <div style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">FINANCIAL SUMMARY</div>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px; width: 300px; margin-left: auto;">
          <div style="flex: 1; padding-right: 20px; font-weight: bold;">Subtotal:</div>
          <div style="width: 100px; text-align: right;">${order.subtotal || 0}</div>
        </div>
        ${order.discount && order.discount > 0 ? `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 10px; width: 300px; margin-left: auto;">
            <div style="flex: 1; padding-right: 20px; font-weight: bold;">Discount:</div>
            <div style="width: 100px; text-align: right;">-${order.discount}</div>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px; width: 300px; margin-left: auto; background-color: #007bff; color: white; font-weight: bold; font-size: 14px; padding: 8px;">
          <div style="flex: 1; padding-right: 20px;">Total Amount:</div>
          <div style="width: 100px; text-align: right;">${order.totalAmount || 0}</div>
        </div>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px; width: 300px; margin-left: auto;">
          <div style="flex: 1; padding-right: 20px; font-weight: bold;">Paid Amount:</div>
          <div style="width: 100px; text-align: right;">${order.paidAmount || 0}</div>
        </div>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px; width: 300px; margin-left: auto;">
          <div style="flex: 1; padding-right: 20px; font-weight: bold;">Due Amount:</div>
          <div style="width: 100px; text-align: right;">${order.dueAmount || 0}</div>
        </div>

        <div style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ORDER DETAILS</div>
        <div style="font-size: 12px; margin: 5px 0;"><strong>Type:</strong> ${order.orderType === 'pos' ? 'POS (In-Store)' : 'Delivery'}</div>
        ${order.assignedTo ? `<div style="font-size: 12px; margin: 5px 0;"><strong>Assigned To:</strong> ${order.assignedTo?.name || order.assignedTo}</div>` : ''}
        ${order.createdBy ? `<div style="font-size: 12px; margin: 5px 0;"><strong>Created By:</strong> ${order.createdBy?.name || order.createdBy}</div>` : ''}

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">Thank you for your business!</div>
      </div>
    `;
  }

  /**
   * Generate plain text invoice content for sharing
   */
  generateInvoiceText(order: any, business?: any): string {
    const lines: string[] = [];

    // Business header
    if (business) {
      lines.push(`═════════════════════════════════════════════════`);
      lines.push(`${business.name || 'Business'}`);
      if (business.phone) lines.push(`Phone: ${business.phone}`);
      if (business.email) lines.push(`Email: ${business.email}`);
      lines.push(`═════════════════════════════════════════════════`);
      lines.push('');
    }

    // Invoice header
    lines.push(`INVOICE #${order.orderNumber}`);
    lines.push(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    lines.push(`Status: ${order.orderStatus?.replace(/_/g, ' ').toUpperCase()}`);
    lines.push('');

    // Client info
    lines.push('CLIENT INFORMATION:');
    lines.push(`Name: ${this.getClientName(order.client)}`);
    if (this.getClientPhone(order.client)) {
      lines.push(`Phone: ${this.getClientPhone(order.client)}`);
    }
    if (this.getClientEmail(order.client)) {
      lines.push(`Email: ${this.getClientEmail(order.client)}`);
    }
    if (this.getClientNTN(order.client)) {
      lines.push(`NTN: ${this.getClientNTN(order.client)}`);
    } else {
      lines.push(`NTN: N/A`);
    }
    lines.push('');

    // Items
    lines.push('ITEMS:');
    lines.push('─────────────────────────────────────────────────');
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any, index: number) => {
        lines.push(`${index + 1}. ${item.itemName}`);
        lines.push(`   Qty: ${item.quantity} × ${item.sellingPrice} = ${item.subtotal}`);
      });
    } else {
      lines.push('No items');
    }

    // Summary
    lines.push('');
    lines.push('═════════════════════════════════════════════════');
    lines.push(`Subtotal:      ${order.subtotal || 0}`);
    if (order.discount && order.discount > 0) {
      lines.push(`Discount:      -${order.discount}`);
    }
    lines.push(`Total Amount:  ${order.totalAmount || 0}`);
    lines.push(`Paid Amount:   ${order.paidAmount || 0}`);
    lines.push(`Due Amount:    ${order.dueAmount || 0}`);
    lines.push('═════════════════════════════════════════════════');
    lines.push('');

    // Order details
    lines.push('ORDER DETAILS:');
    lines.push(`Type: ${order.orderType === 'pos' ? 'POS (In-Store)' : 'Delivery'}`);
    if (order.assignedTo) {
      lines.push(`Assigned To: ${order.assignedTo?.name || order.assignedTo}`);
    }
    if (order.createdBy) {
      lines.push(`Created By: ${order.createdBy?.name || order.createdBy}`);
    }
    lines.push('');
    lines.push('═════════════════════════════════════════════════');
    lines.push('Thank you for your business!');
    lines.push('═════════════════════════════════════════════════');

    return lines.join('\n');
  }



  /**
   * Generate HTML invoice for printing and preview
   * Uses InvoiceTemplateComponent to render the invoice
   */
  generateHTMLInvoice(order: any, business?: any): string {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    try {
      // Create the component instance
      const componentRef = createComponent(InvoiceTemplateComponent, {
        environmentInjector: this.injector,
        hostElement: container,
      });

      // Set the component inputs
      componentRef.instance.order = order;

      // Detect changes to render the component
      componentRef.changeDetectorRef.detectChanges();

      // Get the rendered HTML
      const html = container.innerHTML;

      // Destroy the component
      componentRef.destroy();

      // Wrap the component HTML with proper document structure and styles
      return this.wrapInvoiceHTML(html);
    } finally {
      // Clean up the container
      document.body.removeChild(container);
    }
  }

  /**
   * Wrap invoice component HTML with document structure and styles
   */
  private wrapInvoiceHTML(invoiceHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* General Styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          html, body { 
            height: 100%; 
            background: white;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
          }
          
          .container { 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 20px; 
            background: white;
          }
          
          .header { 
            border-bottom: 2px solid #333; 
            margin-bottom: 20px; 
            padding-bottom: 10px; 
          }
          
          .business-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          
          .business-info { 
            font-size: 12px; 
            color: #666; 
          }
          
          .invoice-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 20px 0; 
          }
          
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px; 
          }
          
          .info-section { 
            font-size: 12px; 
          }
          
          .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            margin: 15px 0 10px 0; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
          }
          
          .info-item { 
            font-size: 12px; 
            margin: 5px 0; 
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          
          th { 
            background-color: #f0f0f0; 
            padding: 8px; 
            text-align: left; 
            font-size: 12px; 
            font-weight: bold; 
            border: 1px solid #ddd; 
          }
          
          td { 
            padding: 8px; 
            border: 1px solid #ddd; 
            font-size: 12px; 
          }
          
          .summary-row { 
            display: flex; 
            justify-content: flex-end; 
            margin-bottom: 10px; 
            width: 300px; 
            margin-left: auto; 
          }
          
          .summary-label { 
            flex: 1; 
            padding-right: 20px; 
            font-weight: bold; 
          }
          
          .summary-value { 
            width: 100px; 
            text-align: right; 
          }
          
          .total-row { 
            background-color: #007bff; 
            color: white; 
            font-weight: bold; 
            font-size: 14px; 
          }
          
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
          }

          /* Print Styles */
          @media print {
            /* Reset page margins */
            html { margin: 0; padding: 0; }
            body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              font-size: 11pt;
            }
            
            .container { 
              margin: 0; 
              padding: 0.5in; 
              max-width: 100%;
              page-break-inside: avoid;
            }
            
            /* Page break control */
            .section-title { 
              page-break-after: avoid; 
              page-break-inside: avoid;
            }
            
            table { 
              page-break-inside: avoid; 
            }
            
            th, td { 
              page-break-inside: avoid; 
            }
            
            /* Hide non-print elements */
            .no-print { 
              display: none !important; 
            }
            
            /* Print-friendly colors - avoid light grays that don't print well */
            .total-row { 
              background-color: #e8e8e8; 
              border: 1px solid #333;
            }
            
            /* Improve borders for print */
            .header { 
              border-bottom: 2px solid #000; 
            }
            
            .footer { 
              border-top: 2px solid #000; 
            }
            
            /* Avoid widow/orphan text issues */
            p { 
              orphans: 3; 
              widows: 3; 
            }
            
            /* Remove shadows and fancy effects */
            * { 
              box-shadow: none !important; 
              text-shadow: none !important; 
            }
          }

          /* Web platform optimizations */
          @media screen {
            body { background: #f5f5f5; }
            .container { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
      </body>
      </html>
    `;
  }



  /**
   * Helper methods
   */
  private getClientName(client: any): string {
    return typeof client === 'object' ? client?.name : client || 'N/A';
  }

  private getClientPhone(client: any): string {
    return typeof client === 'object' ? client?.phone : '';
  }

  private getClientEmail(client: any): string {
    return typeof client === 'object' ? client?.email : '';
  }

  private getClientNTN(client: any): string {
    return typeof client === 'object' ? client?.ntn : '';
  }
}
