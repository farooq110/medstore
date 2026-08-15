import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonText,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';

interface ReportMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  totalCollected: number;
  totalOutstanding: number;
  totalClients: number;
  totalSalesPersons: number;
}

@Component({
  selector: 'app-overview-report',
  templateUrl: './overview-report.component.html',
  styleUrl: './overview-report.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonText,
    IonAccordionGroup,
    IonAccordion,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewReportComponent {
  metrics = input<ReportMetrics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalClients: 0,
    totalSalesPersons: 0,
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
