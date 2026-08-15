import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAccordionGroup,
  IonAccordion,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

interface DebtSummary {
  totalClients: number;
  clientsWithDue: number;
  totalOutstanding: number;
}

interface TopClient {
  clientName: string;
  shopName: string;
  totalPurchase: number;
}

interface DebtReportData {
  summary: DebtSummary;
  topClients: TopClient[];
}

@Component({
  selector: 'app-debt-report',
  templateUrl: './debt-report.component.html',
  styleUrl: './debt-report.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonAccordionGroup,
    IonAccordion,
    IonCard,
    IonCardContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtReportComponent {
  debtData = input<DebtReportData>({
    summary: {
      totalClients: 0,
      clientsWithDue: 0,
      totalOutstanding: 0,
    },
    topClients: [],
  });

  constructor() {
    console.log('DebtReportComponent initialized with data:', this.debtData());
  }

  hasClientData = computed(() => this.debtData().topClients.length > 0);

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
