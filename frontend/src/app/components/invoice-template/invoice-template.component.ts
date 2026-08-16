import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-template.component.html',
  styleUrl: './invoice-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceTemplateComponent {
  @Input() order: any;

  getClientName(client: any): string {
    return typeof client === 'object' ? client?.name : client || 'N/A';
  }

  getClientPhone(client: any): string {
    return typeof client === 'object' ? client?.phone : '';
  }

  getClientEmail(client: any): string {
    return typeof client === 'object' ? client?.email : '';
  }

  getClientNTN(client: any): string {
    return typeof client === 'object' ? client?.ntn : 'N/A';
  }

  getBusinessNTN(order: any): string {
    return order?.business?.ntn || '';
  }

  getBusinessLogo(order: any): string {
    return order?.business?.logo || '';
  }

  getOrderStatus(status: string): string {
    return status?.replace(/_/g, ' ').toUpperCase() || '';
  }
}