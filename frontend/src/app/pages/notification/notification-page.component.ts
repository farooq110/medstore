import { Component, ChangeDetectionStrategy, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { selectAuthUser, selectUserRole } from '../../store/auth-store';
import { AlertState } from '../../store/alert-store/alert.state';
import {
  LoadAlerts,
  DeleteAlert,
  FilterAlertsByType,
  FilterAlertsBySeverity,
} from '../../store/alert-store/alert.actions';
import { Alert } from '../../store/alert-store/alert.model';
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
  IonChip,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  flashOutline,
  informationCircleOutline,
  trashOutline,
  checkmarkOutline,
  arrowBackOutline,
  addCircleOutline,
  removeCircleOutline,
  ban,
  eyeOutline,
  close,
} from 'ionicons/icons';
import { AlertSelectors } from 'src/app/store/alert-store/alert.selectors';
import { FilterSelectComponent, FilterOption } from '../../components/layout/shared/filter-select/filter-select.component';

type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'backorder_pending';
type AlertSeverity = 'warning' | 'urgent';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    IonChip,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    FilterSelectComponent,
  ],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPageComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  readonly authUser = this.store.selectSignal(selectAuthUser);
  readonly userRole = this.store.selectSignal(selectUserRole);

  // Alert state selectors
  readonly alerts = this.store.selectSignal(AlertSelectors.allAlerts);
  readonly pagination = this.store.selectSignal(AlertSelectors.paginationWithParams('alerts'));
  readonly isLoading = this.store.selectSignal(AlertSelectors.isLoading);
  readonly error = this.store.selectSignal(AlertSelectors.error);
//   readonly filterCriteria = this.store.selectSignal(AlertSelectors.);

  // Filter form controls
  readonly typeFormControl = new FormControl<AlertType | 'all'>('all');
  readonly severityFormControl = new FormControl<AlertSeverity | 'all'>('all');
  readonly currentPage = signal(1);
  readonly filterTrigger = signal(0); // Trigger to update computed values

  readonly pageSize = 10;

  // Computed reactive values for FormControl changes
  readonly typeValue = computed(() => {
    this.filterTrigger(); // Track filter trigger
    return this.typeFormControl.value || 'all';
  });
  readonly severityValue = computed(() => {
    this.filterTrigger(); // Track filter trigger
    return this.severityFormControl.value || 'all';
  });

  // Filter options
  readonly typeFilterOptions: FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
  ];

  readonly severityFilterOptions: FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'warning', label: 'Warning' },
    { value: 'urgent', label: 'Urgent' },
  ];

  constructor() {
    addIcons({
      alertCircleOutline,
      flashOutline,
      informationCircleOutline,
      trashOutline,
      checkmarkOutline,
      arrowBackOutline,
      addCircleOutline,
      removeCircleOutline,
      ban,
      eyeOutline,
      close,
    });

    // Subscribe to FormControl changes to trigger computed recomputation
    this.typeFormControl.valueChanges.subscribe(() => {
      this.filterTrigger.update(v => v + 1);
    });

    this.severityFormControl.valueChanges.subscribe(() => {
      this.filterTrigger.update(v => v + 1);
    });

    // Load alerts when component initializes or filters change
    effect(() => {
      const type = this.typeValue();
      const severity = this.severityValue();
      const page = this.currentPage();

      const filters: any = {};
      if (type !== 'all') {
        filters.type = type;
      }
      if (severity !== 'all') {
        filters.severity = severity;
      }

      this.store.dispatch(
        new LoadAlerts(
          { page, limit: this.pageSize },
          Object.keys(filters).length > 0 ? filters : undefined,
          { 
            isLoading: page === 1,
            showToast: false, // Don't show toast for filtering
            successMessage: 'Alerts loaded successfully',
            errorMessage: 'Failed to load alerts'
          }
        )
      );
    });
  }

  getAlertIcon(type: AlertType): string {
    switch (type) {
      case 'low_stock':
        return 'alert-circle-outline';
      case 'out_of_stock':
        return 'alert-circle-outline';
      case 'expiring_soon':
        return 'flash-outline';
      case 'expired':
        return 'alert-circle-outline';
      case 'backorder_pending':
        return 'information-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }

  getAlertColor(severity: AlertSeverity): string {
    return severity === 'urgent' ? 'danger' : 'warning';
  }

  getTypeLabel(type: AlertType): string {
    const labels: Record<AlertType, string> = {
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired',
      backorder_pending: 'Backorder Pending',
    };
    return labels[type];
  }

  getSeverityLabel(severity: AlertSeverity): string {
    return severity === 'urgent' ? 'Urgent' : 'Warning';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onTypeChange(value: string | string[]): void {
    const val = Array.isArray(value) ? value[0] : value;
    this.typeFormControl.setValue(val as AlertType | 'all');
    this.currentPage.set(1);
  }

  onSeverityChange(value: string | string[]): void {
    const val = Array.isArray(value) ? value[0] : value;
    this.severityFormControl.setValue(val as AlertSeverity | 'all');
    this.currentPage.set(1);
  }

  async deleteAlert(alert: Alert): Promise<void> {
    const alert_obj = await this.alertController.create({
      header: 'Delete Alert',
      message: 'Are you sure you want to delete this alert?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (alert._id) {
              this.store.dispatch(new DeleteAlert(alert._id));
            }
          },
        },
      ],
    });
    await alert_obj.present();
  }

  addStock(alert: Alert): void {
    if (alert.itemId) {
      const itemId = typeof alert.itemId === 'object' ? (alert.itemId as any)._id : alert.itemId;
      this.router.navigate(['/owner/items/details', itemId], {
        state: { action: 'addStock' }
      });
    }
  }

  removeStock(alert: Alert): void {
    if (alert.itemId) {
      const itemId = typeof alert.itemId === 'object' ? (alert.itemId as any)._id : alert.itemId;
      this.router.navigate(['/owner/items/details', itemId], {
        state: { action: 'removeStock' }
      });
    }
  }

  disableItem(alert: Alert): void {
    if (alert.itemId) {
      const itemId = typeof alert.itemId === 'object' ? (alert.itemId as any)._id : alert.itemId;
      this.router.navigate(['/owner/items/details', itemId], {
        state: { action: 'disable' }
      });
    }
  }

  viewAlert(alert: Alert): void {
    const itemId = alert.itemId ? (typeof alert.itemId === 'object' ? (alert.itemId as any)._id : alert.itemId) : null;
    if (itemId) {
      this.router.navigate(['/owner/items/details', itemId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/owner/dashboard']);
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  onNextPage(): void {
    const pag = this.pagination();
    if (pag && this.currentPage() < (pag?.pages ?? 0)) {
      this.currentPage.update((p) => p + 1);
    }
  }

  getCurrentPageInfo(): string {
    const pag = this.pagination();
    if (!pag) return '';
    return `Page ${this.currentPage()} of ${pag.pages}`;
  }

  get hasNextPage(): boolean {
    const pag = this.pagination();
    return pag ? this.currentPage() < (pag?.pages ?? 0) : false;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  loadMore(event: any): void {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    const filters: any = {};
    const typeValue = this.typeFormControl.value || 'all';
    const severityValue = this.severityFormControl.value || 'all';
    
    if (typeValue !== 'all') {
      filters.type = typeValue;
    }
    if (severityValue !== 'all') {
      filters.severity = severityValue;
    }

    this.store
      .dispatch(
        new LoadAlerts(
          { page: (paginationValue?.page ?? 0) + 1, limit: this.pageSize },
          Object.keys(filters).length > 0 ? filters : undefined
        )
      )
      .subscribe({
        next: () => {
          event.target.complete();
        },
        error: () => {
          event.target.complete();
        },
      });
  }
}
