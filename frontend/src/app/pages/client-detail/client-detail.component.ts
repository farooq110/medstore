import {
  Component,
  OnInit,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonItem,
  IonLabel,
  IonText,
  IonList,
  IonAccordionGroup,
  IonAccordion,
  IonNote,
  IonButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { chevronDownOutline, eyeOutline } from 'ionicons/icons';
import { LoadClientDetail } from '../../store/client-store/client.actions';
import { ClientSelectors } from '../../store/client-store/client.selectors';
import { ClientDetailData } from '../../store/client-store/client.model';
import { selectUserRole } from '../../store/auth-store';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonItem,
    IonLabel,
    IonText,
    IonList,
    IonAccordionGroup,
    IonAccordion,
    IonNote,
    IonButton,
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Store selectors
  readonly detailData = this.store.selectSignal(ClientSelectors.selectedClientDetails);
  readonly isLoading = this.store.selectSignal(ClientSelectors.isLoading);
  readonly error = this.store.selectSignal(ClientSelectors.error);
  readonly userRole = this.store.selectSignal(selectUserRole);

  // Computed getters for easy access to data
  readonly client = computed(() => this.detailData()?.client || null);
  readonly analytics = computed(() => this.detailData()?.analytics || null);
  readonly recentOrders = computed(() => this.detailData()?.recentOrders || []);
  
  // Computed stats for easy display
  readonly totalOrders = computed(() => this.analytics()?.orders.total || 0);
  readonly totalAmount = computed(() => this.analytics()?.payment.totalAmount || 0);
  readonly totalPaid = computed(() => this.analytics()?.payment.totalPaid || 0);
  readonly totalDue = computed(() => this.analytics()?.payment.totalDue || 0);
  readonly completedOrders = computed(() => this.analytics()?.orders.completed || 0);
  readonly pendingOrders = computed(() => this.analytics()?.orders.pending || 0);
  readonly avgOrderValue = computed(() => this.analytics()?.orders.avgOrderValue || 0);
  readonly paymentRate = computed(() => this.analytics()?.payment.paymentRate || 0);
  readonly availableCredit = computed(() => this.analytics()?.credit.available || 0);
  readonly creditUtilization = computed(() => this.analytics()?.credit.utilization || 0);
  readonly creditStatus = computed(() => this.analytics()?.credit.status || 'medium');

  constructor() {
    addIcons({ chevronDownOutline, eyeOutline });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.loadClientDetails(params['id']);
      }
    });
  }

  private loadClientDetails(clientId: string): void {
    this.store.dispatch(new LoadClientDetail(clientId,{ isLoading: true }));
  }

  getDueStatus(due: number): string {
    if (due === 0) return 'success';
    if (due < 5000) return 'warning';
    return 'danger';
  }

  getOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger',
      processing: 'secondary',
    };
    return statusMap[status] || 'medium';
  }

  viewPendingOrders(): void {
    const clientId = this.client()?._id;
    if (!clientId) return;

    const role = this.userRole();
    const route = role === 'owner' ? '/owner/orders' : '/sales/orders';

    // Navigate with filters applied - show both pending and partial payment status
    this.router.navigate([route], {
      state: {
        filters: {
          clientId: clientId,
          paymentStatus: ['pending', 'partial'],
        },
      },
    });
  }

  // goBack(): void {
  //   this.router.navigate(['/owner/clients']);
  // }
}
