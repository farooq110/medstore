import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';

interface StockData {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

@Component({
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrl: './stock-report.component.scss',
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
export class StockReportComponent {
  stockData = input<StockData>({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
