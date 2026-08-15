import { Component, ChangeDetectionStrategy, signal, computed, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { selectUserRole } from '../../store/auth-store';
import { CURRENCY } from '../../shared/constants/currency.constant';
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { LoadOrderById, RecordPayment, MarkDelivered, MarkDueCollected } from '../../store/order-store/order.actions';
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
  IonSpinner,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonText,
  IonInput,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonSelectOption,
 } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  checkmark,
  close,
  card,
  checkmarkCircle,
  alertCircle,
  location,
  time,
  car,
  cash,
} from 'ionicons/icons';

import { Order } from '../../store/order-store/order.model';
import { BasicSelectComponent } from '../../components/layout/shared/basic-select/basic-select.component';
import { FilterSelectComponent, FilterOption } from '../../components/layout/shared/filter-select/filter-select.component';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';

@Component({
  selector: 'app-delivery-collection',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
    IonSpinner,
    IonNote,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonText,
    IonInput,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonSelectOption,
    BasicSelectComponent,
    FilterSelectComponent,
    BasicInputComponent,
  ],
  templateUrl: './delivery-collection.component.html',
  styleUrl: './delivery-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryCollectionComponent implements OnInit {
  CURRENCY = CURRENCY;

  // Store signals
  readonly userRoleFromStore = this.store.selectSignal(selectUserRole);
  readonly selectedOrderFromStore = this.store.selectSignal(OrderSelectors.selectedOrder);

  // State signals
  order = signal<Order | null>(null);
  isLoading = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  error = signal<string | null>(null);
  userRole = signal<string | null>(null);
  orderId = signal<string>('');

  // Workflow state
  activeStep = signal<'select-task' | 'delivery' | 'payment' | 'collection' | 'summary'>('select-task');
  selectedTask = signal<'delivery' | 'payment_collection' | null>(null);
  paymentForm: FormGroup;
  paymentAmount = signal<number>(0);
  paymentType = signal<'full' | 'partial' | 'borrow'>('full');
  collectionPaymentType = signal<'full' | 'partial'>('full');
  processingDelivery = signal<boolean>(false);
  processingPayment = signal<boolean>(false);
  processingCollection = signal<boolean>(false);

  // Suggested amounts for payment types
  suggestedFullAmount = computed(() => this.dueAmount());
  suggestedBorrowAmount = computed(() => 0);
  suggestedPartialAmount = computed(() => {
    const due = this.dueAmount();
    // Suggest 50% or at least a reasonable amount
    return due > 0 ? Math.round(due * 0.5) : 0;
  });

  // Filter options for app-filter-select
  readonly paymentTypeOptions: FilterOption[] = [
    { value: 'full', label: 'Full Payment' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'borrow', label: 'Borrow (No Payment)' },
  ];

  readonly collectionTypeOptions: FilterOption[] = [
    { value: 'full', label: 'Full Collection' },
    { value: 'partial', label: 'Partial Collection' },
  ];

  // Computed values
  dueAmount = computed(() => this.order()?.dueAmount || 0);
  paidAmount = computed(() => this.order()?.paidAmount || 0);
  totalAmount = computed(() => this.order()?.totalAmount || 0);
  isDelivered = computed(() => this.order()?.isDelivered || false);
  isDueCollected = computed(() => this.order()?.dueCollected || false);
  paymentPercentage = computed(() => {
    const total = this.totalAmount();
    const paid = this.paidAmount();
    return total > 0 ? (paid / total) * 100 : 0;
  });

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['cash', Validators.required],
      notes: ['', Validators.maxLength(500)],
    });

    addIcons({
      arrowBack,
      checkmark,
      close,
      card,
      checkmarkCircle,
      alertCircle,
      location,
      time,
      car,
      cash,
    });

    // Set up reactive effect to track order changes from store
    effect(() => {
      const order = this.selectedOrderFromStore();
      if (order) {
        this.order.set(order);
        // Check if order workflow is complete
        if (order.orderStatus === 'completed' || 
            order.paymentStatus === 'fully_paid' ||
            order.dueCollected) {
          this.activeStep.set('summary');
        } else {
          // Workflow:
          // 1. If order NOT delivered yet and assigned for delivery -> show delivery
          // 2. If order IS delivered and assigned for payment_collection -> show collection
          // 3. If order IS delivered (but not assigned for payment_collection yet) -> show payment
          const assignedFor = order.assignedFor;
          const isDelivered = order.isDelivered;
          
          if (assignedFor === 'delivery' && !isDelivered) {
            this.selectedTask.set('delivery');
            this.activeStep.set('delivery');
          } else if (assignedFor === 'payment_collection' && !order.dueCollected) {
            this.selectedTask.set('payment_collection');
            this.activeStep.set('collection');
            // Initialize form with full collection amount
            this.paymentForm.patchValue({ amount: order.dueAmount });
          } else if (isDelivered && order.dueAmount > 0) {
            // Order is delivered but not assigned for payment_collection
            // Show payment form to record flexible payments
            this.activeStep.set('payment');
            // Initialize form with full payment amount (default payment type is 'full')
            this.paymentForm.patchValue({ amount: order.dueAmount });
          } else {
            this.activeStep.set('select-task');
          }
        }
      }
    });
  }

  ngOnInit() {
    // this.userRole.set(this.userRoleFromStore());
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   this.orderId.set(id);
    //   this.store.dispatch(new LoadOrderById(id));
    // }
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    this.userRole.set(this.userRoleFromStore());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.store.dispatch(new LoadOrderById(id));
    }
  }

  selectTask(task: 'delivery' | 'payment_collection') {
    this.selectedTask.set(task);
    if (task === 'delivery') {
      this.activeStep.set('delivery');
    } else {
      this.activeStep.set('collection');
    }
  }

  // ===== DELIVERY WORKFLOW =====
  markDelivered() {
    const order = this.order();
    if (!order || !order._id) return;

    if (confirm('Mark this order as delivered?')) {
      this.processingDelivery.set(true);
      this.store.dispatch(new MarkDelivered(order._id!)).subscribe({
        next: () => {
          this.processingDelivery.set(false);
          this.activeStep.set('payment');
        },
        error: (err: any) => {
          this.processingDelivery.set(false);
          alert('Error marking delivered: ' + (err.message || err));
        },
      });
    }
  }

  // ===== PAYMENT RECORDING WORKFLOW =====
  proceedToPayment() {
    this.activeStep.set('payment');
  }

  setPaymentType(value: string | string[]) {
    const val = Array.isArray(value) ? value[0] : value;
    const type = val as 'full' | 'partial' | 'borrow';
    this.paymentType.set(type);
    const due = this.dueAmount();
    
    // Auto-fill amount based on payment type
    switch (type) {
      case 'full':
        this.paymentForm.patchValue({ amount: due });
        break;
      case 'partial':
        // User manually enters amount, start with 0
        this.paymentForm.patchValue({ amount: 0 });
        break;
      case 'borrow':
        // Borrow means no payment (0 amount)
        this.paymentForm.patchValue({ amount: 0 });
        break;
    }
  }

  setCollectionPaymentType(value: string | string[]) {
    const val = Array.isArray(value) ? value[0] : value;
    const type = val as 'full' | 'partial';
    this.collectionPaymentType.set(type);
    const due = this.dueAmount();
    
    // Auto-fill amount based on collection payment type
    switch (type) {
      case 'full':
        this.paymentForm.patchValue({ amount: due });
        break;
      case 'partial':
        // User manually enters amount, start with 0
        this.paymentForm.patchValue({ amount: 0 });
        break;
    }
  }

  recordPayment() {
    if (this.paymentForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    const order = this.order();
    if (!order || !order._id) return;

    const formValue = this.paymentForm.value;
    const amount = parseFloat(formValue.amount);
    const paymentType = this.activeStep() === 'collection' ? this.collectionPaymentType() : this.paymentType();

    // Validation based on payment type
    if (paymentType === 'full') {
      if (amount !== this.dueAmount()) {
        alert(`Full payment amount should be ${this.formatCurrency(this.dueAmount())}`);
        return;
      }
    } else if (paymentType === 'partial') {
      if (amount <= 0 || amount >= this.dueAmount()) {
        alert(`Partial payment must be between 0 and ${this.formatCurrency(this.dueAmount() - 0.01)}`);
        return;
      }
    } else if (paymentType === 'borrow') {
      if (amount !== 0) {
        alert('Borrow payment must have 0 amount');
        return;
      }
    }

    const paymentData = {
      amount,
      method: formValue.paymentMethod,
      notes: formValue.notes || `Payment Type: ${paymentType.toUpperCase()}`,
    };

    this.processingPayment.set(true);
    this.store.dispatch(new RecordPayment({ orderId: order._id!, data: paymentData })).subscribe({
      next: () => {
        this.processingPayment.set(false);
        alert(`Payment recorded successfully! (Type: ${paymentType.toUpperCase()})`);
        this.paymentForm.reset({ paymentMethod: 'cash' });
        this.paymentType.set('full');
        
        // Check if order is now fully paid
        const updatedOrder = this.order();
        if (updatedOrder?.paymentStatus === 'fully_paid') {
          this.activeStep.set('summary');
        }
      },
      error: (err: any) => {
        this.processingPayment.set(false);
        alert('Error recording payment: ' + (err.message || err));
      },
    });
  }

  // ===== COLLECTION WORKFLOW =====
  markDueCollected() {
    const order = this.order();
    if (!order || !order._id) return;

    if (order.dueAmount > 0) {
      alert('Full due amount must be collected before marking as collected');
      return;
    }

    if (confirm('Mark due as fully collected?')) {
      this.processingCollection.set(true);
      this.store.dispatch(new MarkDueCollected(order._id!)).subscribe({
        next: () => {
          this.processingCollection.set(false);
          alert('Due marked as collected successfully!');
          this.activeStep.set('summary');
        },
        error: (err: any) => {
          this.processingCollection.set(false);
          alert('Error marking due collected: ' + (err.message || err));
        },
      });
    }
  }

  // ===== NAVIGATION =====
  goBack() {
    const role = this.userRole();
    if (role === 'owner') {
      this.router.navigate(['/owner/orders']);
    } else if (role === 'sales_person') {
      this.router.navigate(['/sales/orders']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  completeWorkflow() {
    this.goBack();
  }

  // ===== HELPERS =====
  getOrderTypeLabel(type: string): string {
    return type === 'pos' ? 'POS (In-Store)' : 'Delivery';
  }

  getOrderIcon(type: string): string {
    return type === 'pos' ? 'storefront' : 'open';
  }

  getClientName(client: any): string {
    return typeof client === 'object' ? client?.name : client;
  }

  getClientPhone(client: any): string {
    return typeof client === 'object' ? client?.phone : '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN');
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

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'partial':
        return 'Partial Payment';
      case 'fully_paid':
        return 'Fully Paid';
      case 'borrow':
        return 'Borrow';
      default:
        return status;
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'created':
        return 'warning';
      case 'assigned':
        return 'primary';
      case 'completed':
        return 'success';
      case 'backorder':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'created':
        return 'Created';
      case 'assigned':
        return 'Assigned';
      case 'completed':
        return 'Completed';
      case 'backorder':
        return 'Backorder';
      default:
        return status;
    }
  }

  getPaymentTypeDescription(type: 'full' | 'partial' | 'borrow'): string {
    switch (type) {
      case 'full':
        return 'Complete payment of the due amount';
      case 'partial':
        return 'Partial payment, remaining due carries forward';
      case 'borrow':
        return 'No payment now, full amount due later';
      default:
        return '';
    }
  }
}
