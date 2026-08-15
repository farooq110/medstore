import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';

interface SalesData {
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  totalPurchaseValue: number;
  totalProfit: number;
}

interface TopSalesPerson {
  salesPersonName: string;
  totalSales: number;
}

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonAccordionGroup,
    IonAccordion,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReportComponent {
  salesData = input<SalesData>({
    totalRevenue: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalPurchaseValue: 0,
    totalProfit: 0,
  });

  topSalesPeople = input<TopSalesPerson[]>([]);

  hasSalesPeopleData = computed(() => this.topSalesPeople().length > 0);

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
