import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { selectUserRole } from '../../store/auth-store';
import { CURRENCY } from '../../shared/constants/currency.constant';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonText,
  IonAlert,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  checkmark,
  close,
  card,
  personAdd,
  cube,
  calendar,
  person,
  call,
  mail,
  location,
  pricetag,
  cube as itemIcon,
  checkmarkCircle,
  alertCircle,
  time,
  storefront,
  print,
  shareSocial,
  download,
} from 'ionicons/icons';

// Import Store
import { OrderSelectors } from '../../store/order-store/order.selectors';
import {
  LoadOrderById,
  MarkDelivered,
} from '../../store/order-store/order.actions';
import { Order } from '../../store/order-store/order.model';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { PrintPreviewModalComponent } from '../../modals/print-preview-modal/print-preview-modal.component';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonNote,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonText,
    IonAlert,
    IonProgressBar,
    PrintPreviewModalComponent,
    TitleCasePipe
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private coreService = inject(CoreService);
  CURRENCY = CURRENCY;

  // Services
  private readonly invoiceService = inject(InvoiceService);

  // Store signals
  selectedOrder = this.store.selectSignal(OrderSelectors.selectedOrder);
  isLoading = this.store.selectSignal(OrderSelectors.isLoading);
  error = this.store.selectSignal(OrderSelectors.error);
  userRole = this.store.selectSignal(selectUserRole);
  orderId = signal<string>('');
  confirmAlert = signal<{
    visible: boolean;
    message?: string;
    action?: string;
  }>({
    visible: false,
  });

  // Invoice action states to prevent duplicate calls
  isPrintingInvoice = signal<boolean>(false);
  isSharingInvoice = signal<boolean>(false);
  isDownloadingPDF = signal<boolean>(false);

  // Print preview modal state
  printPreviewOpen = signal<boolean>(false);
  printPreviewHtml = signal<string>('');
  printPreviewAction = signal<'print' | 'download' | null>(null);

  // Alert buttons
  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => this.dismissAlert(),
    },
    {
      text: 'Confirm',
      handler: () => this.confirmAction(this.confirmAlert().action || ''),
    },
  ];

  // Computed signals
  orderStatusPercentage = computed(() => {
    const order = this.selectedOrder();
    if (!order) return 0;
    const statuses = ['created', 'assigned', 'items_provided', 'completed'];
    const currentIndex = statuses.indexOf(order.orderStatus);
    return ((currentIndex + 1) / statuses.length) * 100;
  });

  paymentPercentage = computed(() => {
    const order = this.selectedOrder();
    if (!order) return 0;
    if (order.totalAmount === 0) return 0;
    return (order.paidAmount / order.totalAmount) * 100;
  });

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    addIcons({
      arrowBack,
      checkmark,
      close,
      card,
      personAdd,
      cube,
      calendar,
      person,
      call,
      mail,
      location,
      pricetag,
      itemIcon,
      checkmarkCircle,
      alertCircle,
      time,
      storefront,
      print,
      shareSocial,
      download,
    });
  }

  ngOnInit() {
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   this.orderId.set(id);
    //   this.store.dispatch(new LoadOrderById(id));
    // }
  }

  ionViewWillEnter(): void {
    // Refresh dashboard data when the view has fully entered
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.store.dispatch(new LoadOrderById(id, { isLoading: true }));
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'created':
        return 'warning';
      case 'assigned':
        return 'primary';
      case 'items_provided':
        return 'secondary';
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

  getClientPhone(client: any): string {
    return typeof client === 'object' ? client?.phone : '';
  }

  getClientEmail(client: any): string {
    return typeof client === 'object' ? client?.email : '';
  }

  getClientAddress(client: any): string {
    return typeof client === 'object' ? client?.address : '';
  }

  getCreatedByName(createdBy: any): string {
    return typeof createdBy === 'object' ? createdBy?.name : createdBy;
  }

  getOrderTypeLabel(type: string): string {
    return type === 'pos' ? 'POS (In-Store)' : 'Delivery';
  }

  getOrderIcon(type: string): string {
    return type === 'pos' ? 'cube' : 'storefront';
  }

  canAssignAgent(): boolean {
    const role = this.userRole();
    const order = this.selectedOrder();
    return role === 'owner' && order?.orderType === 'delivery' && (order?.assignedTo === undefined || order?.assignedTo === null);
  }

  canMarkItemsProvided(): boolean {
    // const role = this.userRole();
    const order = this.selectedOrder();

    if(order?.orderType === 'pos'){
      return true; // POS orders do not require marking items as provided (assumed provided at creation)
    }
    // Only delivery orders can mark items as provided
    // Only show button when status is 'assigned' (not completed, not created)
    // return (
    //   (role === 'sales_person' || role === 'owner') &&
    //   order?.orderType === 'delivery' &&
    //   order?.orderStatus === 'assigned'
    // );
    return order?.isDelivered?? false
  }

  canRecordPayment(): boolean {
    const role = this.userRole();
    const order = this.selectedOrder();

    if(!order?.isDelivered){
      return false; // Cannot record payment if items are not marked as provided
    }
    // POS orders: no payment recording (payment recorded automatically at creation)
    if (order?.orderType === 'pos') {
      return false;
    }
    // Delivery orders: only allow payment recording after items are marked as provided (status = completed)
    return (
      (role === 'sales_person' || role === 'owner') &&
      (order?.orderStatus === 'assigned')
    );
  }

  /* BACKORDER FEATURE DISABLED
  canMarkBackorderPurchased(): boolean {
    const role = this.userRole();
    const order = this.selectedOrder();
    return (
      role === 'owner' &&
      order?.orderStatus === 'backorder' &&
      order?.items?.some((item) => item.isBackorder)
    );
  }

  hasBackorderItems(order: Order | null): boolean {
    return order?.items.some((item) => item.isBackorder) || false;
  }

  countBackorderItems(order: Order | null): number {
    return order?.items.filter((i) => i.isBackorder).length || 0;
  }
  */

  canMarkBackorderPurchased(): boolean {
    return false; // BACKORDER FEATURE DISABLED
  }

  hasBackorderItems(order: Order | null): boolean {
    return false; // BACKORDER FEATURE DISABLED
  }

  countBackorderItems(order: Order | null): number {
    return 0; // BACKORDER FEATURE DISABLED
  }

  assignAgent() {
    const orderId = this.orderId();
    const userRole = this.userRole();
    switch (userRole) {
      case 'owner':
        this.router.navigate(['/owner/order-assign-agent', orderId]);
        break;
      case 'sales_person':
        this.router.navigate(['/sales/order-assign-agent', orderId]);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  markItemsProvided() {
    const order = this.selectedOrder();
    if (!order) return;

    this.confirmAlert.set({
      visible: true,
      message: 'Mark all items as provided? This action cannot be undone.',
      action: 'markProvided',
    });
  }

  recordPayment() {
    const orderId = this.orderId();
    const userRole = this.userRole();
    switch (userRole) {
      case 'sales_person':
        this.router.navigate(['/sales/delivery-collection', orderId]);
        break;
      case 'owner':
        this.router.navigate(['/owner/delivery-collection', orderId]);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  /* BACKORDER FEATURE DISABLED
  markBackorderPurchased() {
    const orderId = this.orderId();
    this.router.navigate(['/owner/order-backorder-purchased', orderId]);
  }
  */

  markBackorderPurchased() {
    // BACKORDER FEATURE DISABLED
  }

  confirmAction(action: string) {
    const order = this.selectedOrder();
    if (!order) return;

    if (action === 'markProvided') {
      this.store.dispatch(new MarkDelivered(order._id!)).subscribe({
        next: () => {
          alert('Items marked as delivered successfully');
          this.confirmAlert.set({ visible: false });
        },
        error: (err) => {
          alert('Error: ' + err.message);
        },
      });
    }
  }

  dismissAlert() {
    this.confirmAlert.set({ visible: false });
  }

  goBack() {
    const userRole = this.userRole();
    switch (userRole) {
      case 'owner':
        this.router.navigate(['/owner/orders']);
        break;
      case 'sales_person':
        this.router.navigate(['/sales/orders']);
        break;
      case 'delivery_agent':
        this.router.navigate(['/delivery/orders']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  formatDate(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      created: 'Order Created',
      assigned: 'Agent Assigned',
      items_provided: 'Items Provided',
      completed: 'Order Completed',
      /* BACKORDER FEATURE DISABLED
      backorder: 'Backorder Pending',
      */
    };
    return labels[status] || status;
  }

  getDueStatus(order: Order | null): string {
    if (!order) return '-';
    if (order.dueAmount === 0) return 'No Due';
    if (order.paymentStatus === 'borrow') return 'Borrowed';
    return `Due: ${CURRENCY.symbol}${order.dueAmount}`;
  }

  formatCurrency(amount: number): string {
    return `${CURRENCY.symbol}${amount.toLocaleString('ur-PK')}`;
  }

  /**
   * Invoice Services - Print, Share, PDF
   */

  isPrintSupported(): boolean {
    return this.invoiceService.isPrintSupported();
  }

  isShareSupported(): boolean {
    return this.invoiceService.isShareSupported();
  }

  async handlePrint(): Promise<void> {
    try {
      console.log('[OrderDetail] Print clicked');
      
      // Prevent duplicate print calls
      if (this.isPrintingInvoice()) {
        console.warn('[OrderDetail] Print already in progress, ignoring duplicate click');
        return;
      }
      
      const order = this.selectedOrder();
      if (order) {
        // Show preview modal first
        const htmlContent = this.invoiceService.generateHTMLInvoice(order);
        this.printPreviewHtml.set(htmlContent);
        this.printPreviewAction.set('print');
        this.printPreviewOpen.set(true);
        console.log('[OrderDetail] Print preview modal opened');
      }
    } catch (error) {
      console.error('[OrderDetail] Print preview failed:', error);
      this.invoiceService.getCoreService().showErrorToast('Failed to load preview');
    }
  }

  async confirmPrint(): Promise<void> {
    try {
      console.log('[OrderDetail] Print confirmed from preview');
      
      if (this.isPrintingInvoice()) {
        console.warn('[OrderDetail] Print already in progress, ignoring duplicate click');
        return;
      }
      
      this.isPrintingInvoice.set(true);
      this.printPreviewOpen.set(false);
      
      const order = this.selectedOrder();
      if (order) {
        await this.invoiceService.printInvoice(order.orderNumber, order);
        console.log('[OrderDetail] Print completed');
      }
    } catch (error) {
      console.error('[OrderDetail] Print action failed:', error);
    } finally {
      // Debounce: keep flag true for 2 seconds to prevent rapid re-clicks
      setTimeout(() => {
        this.isPrintingInvoice.set(false);
        console.log('[OrderDetail] Print flag reset');
      }, 2000);
    }
  }

  async handleShare(): Promise<void> {
    try {
      console.log('[OrderDetail] Share clicked - isSharing:', this.isSharingInvoice());
      
      // Prevent duplicate share calls
      if (this.isSharingInvoice()) {
        console.warn('[OrderDetail] Share already in progress, ignoring duplicate click');
        return;
      }
      
      this.isSharingInvoice.set(true);
      console.log('[OrderDetail] Starting share...');
      
      const order = this.selectedOrder();
      if (order) {
        await this.invoiceService.shareInvoice(order.orderNumber, order);
        console.log('[OrderDetail] Share completed');
      }
    } catch (error) {
      console.error('[OrderDetail] Share action failed:', error);
    } finally {
      // Debounce: keep flag true for 2 seconds to prevent rapid re-clicks
      setTimeout(() => {
        this.isSharingInvoice.set(false);
        console.log('[OrderDetail] Share flag reset');
      }, 2000);
    }
  }

  async handleDownloadPDF(): Promise<void> {
    try {
      console.log('[OrderDetail] PDF download clicked');
      
      // Prevent duplicate download calls
      if (this.isDownloadingPDF()) {
        console.warn('[OrderDetail] PDF download already in progress, ignoring duplicate click');
        return;
      }
      
      const order = this.selectedOrder();
      if (order) {
        // Show preview modal first
        const htmlContent = this.invoiceService.generateHTMLInvoice(order);
        this.printPreviewHtml.set(htmlContent);
        this.printPreviewAction.set('download');
        this.printPreviewOpen.set(true);
        console.log('[OrderDetail] PDF preview modal opened');
      }
    } catch (error) {
      console.error('[OrderDetail] PDF preview failed:', error);
      this.invoiceService.getCoreService().showErrorToast('Failed to load preview');
    }
  }

  async confirmDownloadPDF(): Promise<void> {
    try {
      console.log('[OrderDetail] PDF download confirmed from preview');
      
      if (this.isDownloadingPDF()) {
        console.warn('[OrderDetail] PDF download already in progress, ignoring duplicate click');
        return;
      }
      
      this.isDownloadingPDF.set(true);
      this.printPreviewOpen.set(false);
      
      const order = this.selectedOrder();
      if (order) {
        await this.invoiceService.downloadPDFFile(order.orderNumber, order);
        console.log('[OrderDetail] PDF download completed');
        this.coreService.showSuccessToast(`Invoice Shared`);
      }
    } catch (error) {
      console.error('[OrderDetail] PDF download failed:', error);
    } finally {
      // Debounce: keep flag true for 2 seconds to prevent rapid re-clicks
      setTimeout(() => {
        this.isDownloadingPDF.set(false);
        console.log('[OrderDetail] PDF download flag reset');
      }, 2000);
    }
  }

  onPreviewCancel(): void {
    console.log('[OrderDetail] Print preview cancelled');
    this.printPreviewOpen.set(false);
    this.printPreviewAction.set(null);
  }

  onPreviewPrint(): void {
    this.confirmPrint();
  }

  onPreviewDownloadPDF(): void {
    this.confirmDownloadPDF();
  }
}
