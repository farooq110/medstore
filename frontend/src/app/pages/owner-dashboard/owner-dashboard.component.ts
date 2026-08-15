import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { selectAuthUser, selectUserRole } from '../../store/auth-store';
import { Logout } from '../../store/auth-store/auth.actions';
import { DashboardState } from '../../store/dashboard-store/dashboard.state';
import { LoadDashboardSummary } from '../../store/dashboard-store/dashboard.actions';
import { CURRENCY } from '../../shared/constants/currency.constant';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonNote,
  IonButtons,
  ViewDidEnter,

} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  cashOutline,
  warningOutline,
  calendarOutline,  
  addOutline,
  peopleOutline,
  barChartOutline,
  listOutline,
  alertCircleOutline,
  flashOutline,
  informationCircleOutline,
  folderOutline,
  cubeOutline,
  businessOutline,
  logOutOutline,
  personOutline,
  personCircle
} from 'ionicons/icons';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonNote,
    IonButtons,
    CustomButtonComponent,
    DecimalPipe,
    NgClass
  ],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerDashboardComponent implements OnInit, ViewDidEnter {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly authUser = this.store.selectSignal(selectAuthUser);
  readonly userRole = this.store.selectSignal(selectUserRole);
  readonly CURRENCY = CURRENCY;

  // Dashboard state selectors
  readonly totalOrders = this.store.selectSignal(DashboardState.totalOrders);
  readonly totalDue = this.store.selectSignal(DashboardState.totalDue);
  readonly lowStockItems = this.store.selectSignal(DashboardState.lowStockItems);
  readonly expiringItems = this.store.selectSignal(DashboardState.expiringItems);
  readonly thisMonthOrderCount = this.store.selectSignal(DashboardState.thisMonthOrderCount);
  readonly outstandingPendingCount = this.store.selectSignal(DashboardState.outstandingPendingCount);
  readonly isLoading = this.store.selectSignal(DashboardState.isLoading);

  readonly widgets = computed(() => [
    {
      title: 'Total Orders',
      value: this.totalOrders(),
      icon: 'cart-outline',
      color: 'primary',
      subtitle: `+${this.thisMonthOrderCount()} this month`,
    },
    {
      title: 'Outstanding Due',
      value: this.totalDue(),
      icon: 'cash-outline',
      color: 'warning',
      subtitle: `${this.outstandingPendingCount()} pending`,
    },
    {
      title: 'Low Stock Items',
      value: this.lowStockItems(),
      icon: 'warning-outline',
      color: 'danger',
      subtitle: 'Need restocking',
    },
    {
      title: 'Expiring Soon',
      value: this.expiringItems(),
      icon: 'calendar-outline',
      color: 'secondary',
      subtitle: '≤ 30 days',
    },
  ]);

  readonly widgetRows = computed(() => {
    const widgets = this.widgets();
    const rows = [];
    for (let i = 0; i < widgets.length; i += 2) {
      rows.push(widgets.slice(i, i + 2));
    }
    return rows;
  });

  constructor() {
    addIcons({
      cartOutline,
      cashOutline,
      warningOutline,
      calendarOutline,
      addOutline,
      peopleOutline,
      barChartOutline,
      listOutline,
      alertCircleOutline,
      flashOutline,
      informationCircleOutline,
      folderOutline,
      cubeOutline,
      businessOutline,
      logOutOutline,
      personOutline,
      personCircle
    });
  }

  ngOnInit(): void {
    // Load dashboard summary data from API
    // this.store.dispatch(new LoadDashboardSummary());
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    this.store.dispatch(new LoadDashboardSummary());
  }

  logout(): void {
    this.store.dispatch(new Logout());
  }

  navigateToLowStockItems(): void {
    this.router.navigate(['/owner/items'], {
      state: { filters: { stockStatus: 'lowStock' } }
    });
  }

  navigateToExpiringItems(): void {
    this.router.navigate(['/owner/items'], {
      state: { filters: { stockStatus: 'expiringSoon' } }
    });
  }

  navigateToAllOrders(): void {
    this.router.navigate(['/owner/orders']);
  }

  navigateToOutstandingOrders(): void {
    this.router.navigate(['/owner/orders'], {
      state: { filters: { paymentStatus: ['pending', 'partial'], sortBy: 'latest' } }
    });
  }

  handleWidgetClick(widgetTitle: string): void {
    if (widgetTitle === 'Low Stock Items') {
      this.navigateToLowStockItems();
    } else if (widgetTitle === 'Expiring Soon') {
      this.navigateToExpiringItems();
    } else if (widgetTitle === 'Total Orders') {
      this.navigateToAllOrders();
    } else if (widgetTitle === 'Outstanding Due') {
      this.navigateToOutstandingOrders();
    }
  }

  // Quick Actions Navigation Methods
  navigateToCreateOrder(): void {
    this.router.navigate(['/owner/create-order']);
  }

  navigateToSalesPersons(): void {
    this.router.navigate(['/owner/sales-persons']);
  }

  navigateToReports(): void {
    this.router.navigate(['/owner/reports']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/owner/orders']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/owner/categories']);
  }

  navigateToItems(): void {
    this.router.navigate(['/owner/items']);
  }

  navigateToClients(): void {
    this.router.navigate(['/owner/clients']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/owner/notifications']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/owner/profile']);
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'urgent':
        return 'alert-circle-outline';
      case 'warning':
        return 'flash-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  }
}
