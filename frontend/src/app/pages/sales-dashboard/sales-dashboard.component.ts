import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from '../../store/auth-store/auth.actions';
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { LoadSalesDashboard } from '../../store/order-store/order.actions';
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
  IonBadge,
  IonList,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  cashOutline,
  timeOutline,
  peopleOutline,
  addOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  hourglass,
  logOutOutline,
  listOutline,
  personCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
    IonBadge,
    IonList,
    IonButtons,
    CustomButtonComponent,
  ],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly todayDate = signal(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  readonly dashboardData = this.store.selectSignal(OrderSelectors.salesDashboardData);
  readonly isLoading = this.store.selectSignal(OrderSelectors.isLoading);

  readonly recentOrders = computed(() => this.dashboardData()?.recentOrders || []);
  readonly statusCounts = computed(() => this.dashboardData()?.statusCounts || { createdCount: 0, assignedCount: 0, completedCount: 0 });
  readonly revenueToday = computed(() => this.dashboardData()?.revenueToday || 0);
  readonly totalRevenue = computed(() => this.dashboardData()?.totalRevenue || 0);
  readonly totalOrdersCount = computed(() => this.dashboardData()?.totalOrdersCount || 0);
  readonly pendingPayment = computed(() => this.dashboardData()?.pendingPayment || 0);

  readonly stats = computed(() => [
    {
      label: 'Total Orders',
      value: this.totalOrdersCount(),
      icon: 'cart-outline',
      color: 'primary',
      subtitle: 'All time',
    },
    {
      label: 'Total Revenue',
      value: 'Rs.' + this.totalRevenue().toLocaleString('en-PK'),
      icon: 'cash-outline',
      color: 'success',
      subtitle: 'All time',
    },
    // {
    //   label: "Today's Orders",
    //   value: this.statusCounts().createdCount + this.statusCounts().assignedCount,
    //   icon: 'cart-outline',
    //   color: 'primary',
    //   subtitle: 'Created today',
    // },
    // {
    //   label: 'Revenue Today',
    //   value: 'Rs.' + this.revenueToday().toLocaleString('en-PK'),
    //   icon: 'cash-outline',
    //   color: 'success',
    //   subtitle: 'Today sales',
    // },
    {
      label: 'Pending Payment',
      value: 'Rs.' + this.pendingPayment().toLocaleString('en-PK'),
      icon: 'time-outline',
      color: 'warning',
      subtitle: 'Awaiting payment',
    },
    {
      label: 'Active Orders',
      value: this.statusCounts().assignedCount,
      icon: 'people-outline',
      color: 'secondary',
      subtitle: 'In progress',
    },
  ]);

  readonly statsRows = computed(() => {
    const allStats = this.stats();
    const rows = [];
    for (let i = 0; i < allStats.length; i += 2) {
      rows.push(allStats.slice(i, i + 2));
    }
    return rows;
  });

  constructor() {
    addIcons({
      cartOutline,
      cashOutline,
      timeOutline,
      peopleOutline,
      addOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      hourglass,
      logOutOutline,
      listOutline,
      personCircle
    });
  }

  ngOnInit() {
    // this.store.dispatch(new LoadSalesDashboard());
  }

  ionViewDidEnter(): void {
      // Refresh dashboard data when the view has fully entered
      this.store.dispatch(new LoadSalesDashboard());
    }

  logout(): void {
    this.store.dispatch(new Logout());
  }

  navigateToProfile(): void {
    this.router.navigate(['/sales/profile']);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'checkmark-circle-outline';
      case 'assigned':
        return 'time-outline';
      case 'created':
      default:
        return 'hourglass';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'assigned':
        return 'warning';
      case 'created':
      default:
        return 'medium';
    }
  }

  getClientName(client: any): string {
    return typeof client === 'object' && client?.name ? client.name : String(client || '');
  }

  viewOrder(orderId: string): void {
    this.router.navigate([`/sales/orders/${orderId}`]);
  }

  handleStatClick(statLabel: string): void {
    switch (statLabel) {
      case 'Total Orders':
        this.router.navigate(['/sales/orders'], {
          state: { filters: {} }
        });
        break;
      case 'Total Revenue':
        this.router.navigate(['/sales/orders'], {
          state: { filters: { sortBy: 'revenue' } }
        });
        break;
      case "Today's Orders":
        this.router.navigate(['/sales/orders'], {
          state: { filters: { status: 'created' } }
        });
        break;
      case 'Revenue Today':
        this.router.navigate(['/sales/orders'], {
          state: { filters: { status: 'created', sortBy: 'revenue' } }
        });
        break;
      case 'Pending Payment':
        this.router.navigate(['/sales/orders'], {
          state: { filters: { paymentStatus: 'pending' } }
        });
        break;
      case 'Active Orders':
        this.router.navigate(['/sales/orders'], {
          state: { filters: { status: 'assigned' } }
        });
        break;
    }
  }

  navigateToClients(): void {
    this.router.navigate(['/owner/clients']);
  }

  navigateToCreateOrder(): void {
    this.router.navigate(['/sales/create-order']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/sales/orders']);
  }
}
