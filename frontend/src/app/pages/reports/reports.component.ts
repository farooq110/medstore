import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButton,
  IonFooter,
  IonSpinner,
  IonText,
  IonToggle,
  IonItem
} from '@ionic/angular/standalone';
import { Store } from '@ngxs/store';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  trendingUpOutline,
  walletOutline,
  alertCircleOutline,
  timeOutline,
  calendarOutline,
  closeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { LoadReports, LoadFilteredSalesReport } from '../../store/report-store/report.actions';
import {
  selectReportsData,
  selectReportsLoading,
  selectFilteredSalesData,
  selectFilteredSalesLoading,
} from '../../store/report-store/report.selectors';
import { ApiService } from '../../services/api.service';
import { OverviewReportComponent } from './components/overview-report/overview-report.component';
import { SalesReportComponent } from './components/sales-report/sales-report.component';
import { StockReportComponent } from './components/stock-report/stock-report.component';
import { ExpiryReportComponent } from './components/expiry-report/expiry-report.component';
import { DebtReportComponent } from './components/debt-report/debt-report.component';

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

interface SalesData {
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  totalPurchaseValue: number;
  totalProfit: number;
}

interface StockData {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

interface ExpiryData {
  expiredCount: number;
  expiringSoonCount: number;
}

interface TopSalesPerson {
  salesPersonName: string;
  totalSales: number;
}

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
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    OverviewReportComponent,
    SalesReportComponent,
    StockReportComponent,
    ExpiryReportComponent,
    DebtReportComponent,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonButton,
    IonFooter,
    IonSpinner,
    IonText,
    IonToggle,
    IonItem
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private readonly store = inject(Store);

  @ViewChild('dateModal') dateModal: any;
  @ViewChild('datePickerDatetime') datePickerDatetime: any;

  reportType = signal<
    'overview' | 'sales' | 'expiry' | 'stock' | 'debt'
  >('overview');

  // Sales filters - default to current month/year
  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  tempYear = signal<number>(new Date().getFullYear());
  tempMonth = signal<number>(new Date().getMonth() + 1);
  selectAllMonths = signal<boolean>(false);
  tempSelectAllMonths = signal<boolean>(false);
  
  filteredSalesData = this.store.selectSignal(selectFilteredSalesData);
  isSalesFilterLoading = this.store.selectSignal(selectFilteredSalesLoading);
  filteredTopSalesPeople = computed(() => {
    const data = this.filteredSalesData();
    if (data?.topSalesPeople) {
      return (data.topSalesPeople || []).map((person: any) => ({
        salesPersonName: person.salesPersonName,
        totalSales: person.totalSales || 0,
      })) as TopSalesPerson[];
    }
    return [];
  });

  reportsData = this.store.selectSignal(selectReportsData);
  reportsLoading = this.store.selectSignal(selectReportsLoading);

  // Overview metrics from server data
  metrics = computed(() => {
    const data = this.reportsData();
    if (data?.overview) {
      return {
        totalOrders: data.overview.totalOrders || 0,
        totalRevenue: data.overview.totalRevenue || 0,
        averageOrderValue: data.overview.averageOrderValue || 0,
        completedOrders: data.overview.completedOrders || 0,
        pendingOrders: data.overview.pendingOrders || 0,
        totalCollected: data.overview.totalCollected || 0,
        totalOutstanding: data.overview.totalOutstanding || 0,
        totalClients: data.overview.totalClients || 0,
        totalSalesPersons: data.overview.totalSalesPersons || 0,
      } as ReportMetrics;
    }
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalClients: 0,
      totalSalesPersons: 0,
    } as ReportMetrics;
  });

  // Sales Report Data from filtered API
  salesData = computed(() => {
    const data = this.filteredSalesData();
    if (data?.summary) {
      return {
        totalRevenue: data.summary?.totalRevenue || 0,
        totalCollected: data.summary?.totalCollected || 0,
        totalOutstanding: data.summary?.totalOutstanding || 0,
        totalPurchaseValue: data.summary?.totalProfit || 0,
        totalProfit: data.summary?.totalProfit || 0,
      };
    }
    return {
      totalRevenue: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      totalPurchaseValue: 0,
      totalProfit: 0,
    };
  });

  // Top salespeople from filtered API
  topSalesPersonData = computed(() => {
    return this.filteredTopSalesPeople();
  });

  // Expiry Report Data from server
  expiryData = computed(() => {
    const data = this.reportsData();
    if (data?.expiry) {
      return {
        expiredCount: data.expiry.summary?.expiredCount || 0,
        expiringSoonCount: data.expiry.summary?.expiringSoonCount || 0,
      };
    }
    return {
      expiredCount: 0,
      expiringSoonCount: 0,
    };
  });

  // Stock Report Data from server
  stockData = computed(() => {
    const data = this.reportsData();
    if (data?.stock) {
      return {
        totalItems: data.stock.summary?.totalItems || 0,
        lowStockCount: data.stock.summary?.lowStockCount || 0,
        outOfStockCount: data.stock.summary?.outOfStockCount || 0,
        totalValue: data.stock.summary?.totalValue || 0,
      };
    }
    return {
      totalItems: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValue: 0,
    };
  });

  // Client Debt Report Data from server
  debtData = computed(() => {
    const data = this.reportsData();
    if (data?.debt) {
      return {
        summary: {
          totalClients: data.debt.summary?.totalClients || 0,
          clientsWithDue: data.debt.summary?.clientsWithDue || 0,
          totalOutstanding: data.debt.summary?.totalOutstanding || 0,
        },
        topClients: (data.debt.topClients || [])?.map((client: any) => ({
          clientName: client.clientName,
          shopName: client.shopName,
          totalPurchase: client.totalPurchase || 0,
        })),
      } as DebtReportData;
    }
    return {
      summary: {
        totalClients: 0,
        clientsWithDue: 0,
        totalOutstanding: 0,
      },
      topClients: [],
    };
  });

  constructor() {
    addIcons({
      barChartOutline,
      trendingUpOutline,
      walletOutline,
      alertCircleOutline,
      timeOutline,
      calendarOutline,
      closeOutline,
      checkmarkCircleOutline,
    });

    // Load reports data from server on component init
    this.store.dispatch(new LoadReports({}, {}));

    // Load filtered sales data when year or month changes
    effect(() => {
      const year = this.selectedYear();
      const month = this.selectedMonth();
      const allMonths = this.selectAllMonths();
      
      this.store.dispatch(new LoadFilteredSalesReport(year, month, allMonths));
    });
  }

  setReportType(value: any): void {
    const validTypes = [
      'overview',
      'sales',
      'expiry',
      'stock',
      'debt',
    ];
    if (validTypes.includes(value)) {
      this.reportType.set(
        value as
          | 'overview'
          | 'sales'
          | 'expiry'
          | 'stock'
          | 'debt',
      );
    }
  }

  filterDateValue = computed(() => {
    const year = this.selectedYear();
    const month = String(this.selectedMonth()).padStart(2, '0');
    return `${year}-${month}-01T00:00:00`;
  });

  filterDateDisplay = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[this.selectedMonth() - 1];
    const year = this.selectedYear();
    return `${month} ${year}`;
  });

  getCurrentDateISO(): string {
    return new Date().toISOString();
  }

  openDateModal(): void {
    this.tempYear.set(this.selectedYear());
    this.tempMonth.set(this.selectedMonth());
    this.tempSelectAllMonths.set(this.selectAllMonths());
    this.dateModal?.present();
  }

  closeDateModal(): void {
    this.dateModal?.dismiss();
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  formatMonthForDateTime(month: number): string {
    return month.toString().padStart(2, '0');
  }

  toggleAllMonths(): void {
    this.tempSelectAllMonths.set(!this.tempSelectAllMonths());
  }

  onDateChange(event: any): void {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      this.tempYear.set(year);
      this.tempMonth.set(month);
    }
  }

  onYearOnlyChange(event: any): void {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      this.tempYear.set(year);
    }
  }

  confirmDateSelection(): void {
    const yearChanged = this.tempYear() !== this.selectedYear();
    const monthChanged = this.tempMonth() !== this.selectedMonth();
    const allMonthsChanged = this.tempSelectAllMonths() !== this.selectAllMonths();
    
    if (yearChanged || monthChanged || allMonthsChanged) {
      this.selectedYear.set(this.tempYear());
      this.selectedMonth.set(this.tempMonth());
      this.selectAllMonths.set(this.tempSelectAllMonths());
    }
    this.dateModal?.dismiss();
  }

  cancelDateSelection(): void {
    this.tempYear.set(this.selectedYear());
    this.tempMonth.set(this.selectedMonth());
    this.tempSelectAllMonths.set(this.selectAllMonths());
    this.dateModal?.dismiss();
  }

  onFilterDateChange(event: any): void {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      this.selectedYear.set(year);
      this.selectedMonth.set(month);
      this.dateModal?.dismiss();
    }
  }
}
