import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  inject,
  effect,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { selectUserRole } from '../../store/auth-store';
import { CURRENCY } from '../../shared/constants/currency.constant';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonLabel,
  IonBadge,
  IonSearchbar,
  IonSpinner,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonChip,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonText,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eye,
  open,
  checkmark,
  close,
  alertCircle,
  cube,
  add,
  card,
  personAdd,
  checkmarkDone,
  time,
  download,
  checkmarkCircle,
  addOutline,
} from 'ionicons/icons';

// Import Store
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { ClientSelectors } from '../../store/client-store/client.selectors';
import { LoadClients } from '../../store/client-store/client.actions';
import {
  LoadOrders,
  SelectOrder,
  MarkDelivered,
  MarkDueCollected,
  /* BACKORDER FEATURE DISABLED
  MarkBackorderPurchased,
  */
  LoadOrderStatusCounts,
} from '../../store/order-store/order.actions';
import { Order } from '../../store/order-store/order.model';

import {
  FilterSelectComponent,
  FilterOption,
} from '../../components/layout/shared/filter-select/filter-select.component';
import {
  TypeaheadComponent,
  TypeaheadItem,
} from '../../components/layout/shared/typeahead/typeahead.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    IonList,
    IonChip,
    IonTitle,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonLabel,
    IonBadge,
    IonSearchbar,
    IonSpinner,
    IonNote,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    FilterSelectComponent,
    IonText,
    IonItem,
    TypeaheadComponent,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  CURRENCY = CURRENCY;

  @ViewChild('clientTypeaheadModal') clientTypeaheadModal!: TypeaheadComponent;

  private readonly store = inject(Store);
  private readonly router = inject(Router);

  // Store signals
  allOrders = this.store.selectSignal(OrderSelectors.allOrders);
  isLoading = this.store.selectSignal(OrderSelectors.isLoading);
  error = this.store.selectSignal(OrderSelectors.error);
  userRole = this.store.selectSignal(selectUserRole);
  pagination = this.store.selectSignal(
    OrderSelectors.paginationWithParams('orders')
  );

  // Status counts from store
  statusCounts = this.store.selectSignal(OrderSelectors.statusCounts);

  // Clients from store
  clients = this.store.selectSignal(ClientSelectors.allClients);
  clientStorePagination = this.store.selectSignal(ClientSelectors.pagination);

  // Local state signals
  searchText = signal<string>('');
  statusFilter = signal<string>('all');
  paymentStatusFilter = signal<string[]>([]);
  clientIdFilter = signal<string>('');
  
  // Client typeahead signals
  clientSearchQuery = signal<string>('');
  selectedClientIds = signal<string[]>([]);

  // Computed client pagination for typeahead
  clientPagination = computed(() => {
    const paginated = this.clientStorePagination();
    return {
      page: paginated?.page ?? 1,
      hasMore: paginated?.hasMore ?? false,
    };
  });

  // Payment status filter options
  readonly paymentStatusOptions = computed(
    () =>
      [
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partial' },
        { value: 'fully_paid', label: 'Fully Paid' },
        { value: 'borrow', label: 'Borrow' },
      ] as FilterOption[]
  );

  // Client filter options (backward compatibility)
  readonly clientFilterOptions = computed(() =>
    this.clients().map((client) => ({
      value: client._id || '',
      label: `${client.name}`,
    })) as FilterOption[]
  );

  // Typeahead items for client filter - computed directly from store clients
  readonly typeaheadClients = computed(() =>
    this.clients().map((client) => ({
      text: `${client.name}`,
      value: client._id || '',
    })) as TypeaheadItem[]
  );

  // Computed filtered orders - orders already filtered by server
  filteredOrders = computed(() => {
    return this.allOrders();
  });

  constructor() {
    addIcons({
      eye,
      open,
      checkmark,
      close,
      alertCircle,
      cube,
      add,
      card,
      personAdd,
      checkmarkDone,
      time,
      download,
      checkmarkCircle,
      addOutline,
    });

    // Load clients for filter dropdown and typeahead
    effect(() => {
      const role = this.userRole();
      if (role) {
        this.store.dispatch(new LoadClients({ page: 1, limit: 10 }));
      }
    });

    // Setup signal-based effects for filter changes
    // Track searchText changes with debounce
    // let searchTimeout: any;
    // effect(() => {
    //   this.searchText();
    //   clearTimeout(searchTimeout);
    //   searchTimeout = setTimeout(() => {
    //     this.applyFilters();
    //   }, 300);
    // });

    // // Track paymentStatusFilter changes with debounce
    // let filterTimeout: any;
    // effect(() => {
    //   this.paymentStatusFilter();
    //   clearTimeout(filterTimeout);
    //   filterTimeout = setTimeout(() => {
    //     this.applyFilters();
    //   }, 300);
    // });
  }

  ngOnInit() {
    // Check for filters passed through navigation state
    // const navigationExtras = history.state;
    // if (navigationExtras?.filters) {
    //   // Apply payment status filter from dashboard
    //   if (navigationExtras.filters.paymentStatus) {
    //     this.paymentStatusFilter.set(navigationExtras.filters.paymentStatus);
    //     this.applyFilters();
    //   } else if (navigationExtras.filters.status === 'pending' || navigationExtras.filters.status === 'partial') {
    //     this.paymentStatusFilter.set(navigationExtras.filters.status);
    //     this.applyFilters();
    //   } else if (navigationExtras.filters.status) {
    //     // Order status filter
    //     this.statusFilter.set(navigationExtras.filters.status);
    //     this.applyFilters();
    //   } else {
    //     // Load default orders
    //     this.store.dispatch(new LoadOrders({ page: 1, limit: 10 }));
    //   }
    // } else {
    //   // Load default orders without filter
    //   this.store.dispatch(new LoadOrders({ page: 1, limit: 10 }));
    // }
    // this.store.dispatch(new LoadOrderStatusCounts());
  }

  ionViewDidEnter(): void {
    const navigationExtras = history.state;
    if (navigationExtras?.filters) {
      // Apply client ID filter
      if (navigationExtras.filters.clientId) {
        this.clientIdFilter.set(navigationExtras.filters.clientId);
      }

      // Apply payment status filter from dashboard
      if (navigationExtras.filters.paymentStatus) {
        const paymentStatus = navigationExtras.filters.paymentStatus;
        this.paymentStatusFilter.set(Array.isArray(paymentStatus) ? paymentStatus : [paymentStatus]);
      }

      if (
        navigationExtras.filters.status === 'pending' ||
        navigationExtras.filters.status === 'partial'
      ) {
        this.paymentStatusFilter.set([navigationExtras.filters.status]);
      }

      if (navigationExtras.filters.status) {
        // Order status filter
        this.statusFilter.set(navigationExtras.filters.status);
      }
    }
    this.applyFilters();
    this.store.dispatch(new LoadOrderStatusCounts());
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'created':
        return 'warning';
      case 'assigned':
        return 'primary';
      case 'completed':
        return 'success';
      /* BACKORDER FEATURE DISABLED
      case 'backorder':
        return 'danger';
      */
      default:
        return 'medium';
    }
  }

  getPaymentStatusBadgeColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'danger';
      case 'partial':
        return 'warning';
      case 'fully_paid':
        return 'success';
      case 'borrow':
        return 'secondary';
      default:
        return 'medium';
    }
  }

  getClientName(client: any): string {
    return typeof client === 'object' ? client?.name : client;
  }

  getCreatedByName(createdBy: any): string {
    return typeof createdBy === 'object' ? createdBy?.name : createdBy;
  }

  viewOrderDetails(orderId: string) {
    const userRole = this.userRole();
    switch (userRole) {
      case 'owner':
        this.router.navigate(['/owner/orders', orderId]);
        break;
      case 'sales_person':
        this.router.navigate(['/sales/orders', orderId]);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  viewClientDetails(client: any) {
    const clientId = typeof client === 'object' ? client?._id : client;
    const userRole = this.userRole();
    if (clientId) {
      switch (userRole) {
        case 'owner':
          this.router.navigate(['/owner/clients', clientId]);
          break;
        case 'sales_person':
          this.router.navigate(['/sales/clients', clientId]);
          break;
        default:
          this.router.navigate(['/login']);
      }
    }
  }

  assignOrder(orderId: string) {
    this.store.dispatch(new SelectOrder(orderId)).subscribe({
      next: () => {
        this.router.navigate(['/owner/assign-order', orderId]);
      },
    });
  }

  // Navigate to delivery/collection workflow
  deliverOrder(orderId: string) {
    const role = this.userRole();
    if (role === 'owner') {
      this.router.navigate(['/owner/delivery-collection', orderId]);
    } else if (role === 'sales_person') {
      this.router.navigate(['/sales/delivery-collection', orderId]);
    }
  }

  // Navigate to collection workflow
  collectDueFromOrder(orderId: string) {
    const role = this.userRole();
    if (role === 'owner') {
      this.router.navigate(['/owner/delivery-collection', orderId]);
    } else if (role === 'sales_person') {
      this.router.navigate(['/sales/delivery-collection', orderId]);
    }
  }

  markDelivered(orderId: string) {
    const order = this.allOrders().find((o) => o._id === orderId);
    if (!order) return;

    if (confirm('Mark items as delivered?')) {
      this.store.dispatch(new MarkDelivered(orderId)).subscribe({
        next: () => {
          console.log('Items marked as delivered');
        },
        error: (err) => {
          console.error('Failed to mark items as delivered:', err);
        },
      });
    }
  }

  markDueCollected(orderId: string) {
    const order = this.allOrders().find((o) => o._id === orderId);
    if (!order) return;

    if (confirm('Mark due as fully collected?')) {
      this.store.dispatch(new MarkDueCollected(orderId)).subscribe({
        next: () => {
          console.log('Due marked as collected');
        },
        error: (err) => {
          console.error('Failed to mark due as collected:', err);
        },
      });
    }
  }

  /* BACKORDER FEATURE DISABLED
  markBackorderPurchased(orderId: string) {
    const order = this.allOrders().find((o) => o._id === orderId);
    if (!order) return;

    if (confirm('Mark backorder items as purchased?')) {
      this.store.dispatch(new MarkBackorderPurchased(orderId)).subscribe({
        next: () => {
          console.log('Backorder items marked as purchased');
        },
        error: (err) => {
          console.error('Failed to mark backorder as purchased:', err);
        },
      });
    }
  }
  */

  markBackorderPurchased(orderId: string) {
    // BACKORDER FEATURE DISABLED
  }

  recordPayment(orderId: string) {
    const role = this.userRole();
    if (role === 'owner') {
      this.router.navigate(['/owner/delivery-collection', orderId]);
    } else if (role === 'sales_person') {
      this.router.navigate(['/sales/delivery-collection', orderId]);
    }
  }

  canAssignAgent(order: Order): boolean {
    const role = this.userRole();
    return (
      role === 'owner' &&
      order?.orderType === 'delivery' &&
      (order?.assignedTo === undefined || order?.assignedTo === null)
    );
  }

  canRecordPayment(): boolean {
    const role = this.userRole();
    return role === 'sales_person' || role === 'owner';
  }

  canMarkDelivered(): boolean {
    const role = this.userRole();
    return role === 'sales_person' || role === 'owner';
  }

  canMarkDueCollected(): boolean {
    const role = this.userRole();
    return role === 'sales_person' || role === 'owner';
  }

  /* BACKORDER FEATURE DISABLED
  canMarkBackorderPurchased(): boolean {
    const role = this.userRole();
    return role === 'owner';
  }
  */

  canMarkBackorderPurchased(): boolean {
    return false; // BACKORDER FEATURE DISABLED
  }

  canCreateOrder(): boolean {
    const role = this.userRole();
    return role === 'owner' || role === 'sales_person';
  }

  navigateToCreateOrder() {
    const role = this.userRole();
    if (role === 'owner') {
      this.router.navigate(['/owner/create-order']);
    } else if (role === 'sales_person') {
      this.router.navigate(['/sales/create-order']);
    }
  }

  onStatusFilterChange(status: any) {
    const filterStatus = (status?.toString() || 'all') as string;
    this.statusFilter.set(filterStatus);
    const filterOptions =
      filterStatus !== 'all' ? { status: filterStatus } : undefined;
    this.store.dispatch(new LoadOrders({ page: 1, limit: 10 }, filterOptions));
  }

  getOrderTypeLabel(type: string): string {
    return type === 'pos' ? 'POS (In-Store)' : 'Delivery';
  }

  getOrderIcon(type: string): string {
    return type === 'pos' ? 'cube' : 'open';
  }

  onSearchChange(searchValue: any) {
    this.searchText.set(searchValue || '');
    this.applyFilters();
  }

  onPaymentStatusChange(value: string | string[]): void {
    if (Array.isArray(value)) {
      this.paymentStatusFilter.set(value);
    } else {
      // Handle single value if needed
      this.paymentStatusFilter.set(value ? [value] : []);
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchText() || this.paymentStatusFilter().length > 0 || this.clientIdFilter());
  }

  onClientFilterChange(value: string | string[]): void {
    const val = Array.isArray(value) ? value[0] : value;
    this.clientIdFilter.set(val);
    this.applyFilters();
  }

  onClientSearch(searchQuery: string): void {
    console.log('🔍 Client typeahead search called with query:', searchQuery);
    this.clientSearchQuery.set(searchQuery);
    const q = (searchQuery ?? '').trim();
    
    this.store.dispatch(
      new LoadClients(
        { page: 1, limit: 10 },
        q ? { search: q } : {}
      )
    );
  }

  loadMoreClients(e: any): void {
    this.store
      .dispatch(
        new LoadClients(
          {
            page: (e?.page ?? 0) + 1,
            limit: 10,
          },
          {
            ...(e?.search ? { search: e.search } : {}),
          },
        ),
      )
      .subscribe({
        next: () => {
          e.event.target.complete();
        },
        error: () => {
          e.event.target.complete();
        },
      });
  }

  onClientSelectionChange(selectedValues: string[]): void {
    // Single select - only take the first value
    const clientId = selectedValues.length > 0 ? selectedValues[0] : '';
    this.clientIdFilter.set(clientId);
    this.selectedClientIds.set(clientId ? [clientId] : []);
    this.applyFilters();
  }

  onClientSelectionCancel(): void {
    this.selectedClientIds.set([]);
  }

  onClientItemClick(client: TypeaheadItem): void {
    // Single select - set the client and close modal
    this.clientIdFilter.set(client.value);
    this.selectedClientIds.set([client.value]);
    this.applyFilters();
    
    // Close the typeahead modal
    if (this.clientTypeaheadModal) {
      setTimeout(() => {
        const modal = this.clientTypeaheadModal['modal'];
        if (modal) {
          modal.dismiss();
        }
      }, 0);
    }
  }

  clearClientFilter(): void {
    this.clientIdFilter.set('');
    this.selectedClientIds.set([]);
    this.applyFilters();
  }

  getClientFilterLabel(clientId: string): string {
    const client = this.clients().find((c) => c._id === clientId);
    return client
      ? `${client.name}`
      : clientId;
  }

  clearSearchFilter(): void {
    this.searchText.set('');
    this.applyFilters();
  }

  clearPaymentStatusFilter(): void {
    this.paymentStatusFilter.set([]);
    this.applyFilters();
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      partial: 'Partial',
      fully_paid: 'Fully Paid',
      borrow: 'Borrow',
    };
    return labels[status] || status;
  }

  getPaymentStatusLabels(statuses: string[]): string {
    return statuses.map(status => this.getPaymentStatusLabel(status)).join(', ');
  }

  private applyFilters(): void {
    const paymentStatusArray = this.paymentStatusFilter();
    this.store.dispatch(
      new LoadOrders(
        { page: 1, limit: 10 },
        {
          search: this.searchText() || undefined,
          paymentStatus: paymentStatusArray.length > 0 ? paymentStatusArray : undefined,
          status: this.statusFilter() || undefined,
          clientId: this.clientIdFilter() || undefined,
        }
      )
    );
  }

  clearAllFilters(): void {
    this.searchText.set('');
    this.paymentStatusFilter.set([]);
    this.statusFilter.set('all');
    this.clientIdFilter.set('');
    this.store.dispatch(new LoadOrders({ page: 1, limit: 10 }));
  }

  /* BACKORDER FEATURE DISABLED
  // Helper method to check if order has backorder items
  hasBackorderItems(order: Order): boolean {
    return order.items.some((item) => item.isBackorder);
  }

  // Helper method to count backorder items
  countBackorderItems(order: Order): number {
    return order.items.filter((i) => i.isBackorder).length;
  }
  */

  hasBackorderItems(order: Order): boolean {
    return false; // BACKORDER FEATURE DISABLED
  }

  countBackorderItems(order: Order): number {
    return 0; // BACKORDER FEATURE DISABLED
  }

  // Format price without decimal values
  formatPrice(price: number): string {
    return Math.round(price).toString();
  }

  // Load more orders (infinite scroll)
  loadMore(event: InfiniteScrollCustomEvent) {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    this.store
      .dispatch(
        new LoadOrders(
          {
            page: (paginationValue?.page ?? 0) + 1,
            limit: 10,
          },
          {
            search: this.searchText() || undefined,
            paymentStatus: this.paymentStatusFilter().length > 0 ? this.paymentStatusFilter() : undefined,
            clientId: this.clientIdFilter() || undefined,
          }
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
