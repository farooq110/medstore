import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  effect,
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { ItemService } from '../../store/item-store/item.service';
import { CURRENCY } from '../../shared/constants/currency.constant';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonSelectOption,
  IonList,
  IonItem,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
 } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  closeOutline,
  closeCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

// Import Store Classes & Selectors
import { ClientSelectors } from '../../store/client-store/client.selectors';
import { ItemSelectors } from '../../store/item-store/item.selectors';
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { UserSelectors } from '../../store/user-store/user.selectors';
import { selectUserRole, selectAuthUser } from '../../store/auth-store';

// Import Actions
import { LoadClients } from '../../store/client-store/client.actions';
import { LoadItems } from '../../store/item-store/item.actions';
import { CreateOrder } from '../../store/order-store/order.actions';
import { LoadUsers } from '../../store/user-store/user.actions';

// Import Models
import { Client } from '../../store/client-store/client.model';
import { Item } from '../../store/item-store/item.model';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { BasicSelectComponent } from '../../components/layout/shared/basic-select/basic-select.component';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { QuantityCounterComponent } from '../../components/layout/shared/quantity-counter/quantity-counter.component';
import {
  TypeaheadComponent,
  TypeaheadItem,
} from '../../components/layout/shared/typeahead/typeahead.component';
import { StockValidationModalComponent, StockIssue } from './components/stock-validation-modal/stock-validation-modal.component';

interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  sellingPrice: number;
  subtotal: number;
  isBackorder: boolean;
  expiryDate: string;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    DecimalPipe,
    NgClass,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonSpinner,
    ConfirmModalComponent,
    IonText,
    IonButtons,
    IonBackButton,
    IonSelectOption,
    IonList,
    IonItem,
    IonCheckbox,
    IonGrid,
    IonRow,
    IonCol,
    BasicSelectComponent,
    BasicInputComponent,
    QuantityCounterComponent,
    TypeaheadComponent,
    StockValidationModalComponent,
  ],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOrderComponent implements OnInit {
  CURRENCY = CURRENCY;

  // Stepper state
  currentStep = signal<1 | 2 | 3>(1);

  // Forms for each step
  clientForm: FormGroup;
  itemForm: FormGroup;
  summaryForm: FormGroup;

  // Store Signals
  clients = this.store.selectSignal(ClientSelectors.allClients);
  items = this.store.selectSignal(ItemSelectors.allItems);
  itemPagination = this.store.selectSignal(
    ItemSelectors.paginationWithParams('items'),
  );
  isLoading = this.store.selectSignal(OrderSelectors.isLoading);
  error = this.store.selectSignal(OrderSelectors.error);
  salesPersons = this.store.selectSignal(UserSelectors.salesPersons);
  userRole = this.store.selectSignal(selectUserRole);
  authUser = this.store.selectSignal(selectAuthUser);

  // Use clients from store (server-side filtered based on user role)
  filteredClients = this.clients;

  // Typeahead items for modal
  typeaheadItems = computed(() =>{
    const a = this.items().map(
      (item) =>
        ({
          text: `${item.name}`,
          value: item._id!,
          price: item.sellingPrice,
          stockQuantity: item.stockQuantity,
        }) as TypeaheadItem,
    )

    return a

  }
  );

  selectedItemIds = signal<string[]>([]);

  // Local state
  cartItems = signal<CartItem[]>([]);
  selectedClient = signal<Client | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  confirmDialog = signal<{
    visible: boolean;
    message?: string;
    onConfirm?: () => void;
  }>({ visible: false });

  // Out of stock confirmation modal
  outOfStockDialog = signal<{
    visible: boolean;
    itemName: string;
    itemId?: string;
    onConfirm?: () => void;
  }>({ visible: false, itemName: '' });

  // Stock validation modal
  stockValidationDialog = signal<{
    visible: boolean;
    issues: StockIssue[];
    onConfirm?: () => void;
  }>({ visible: false, issues: [] });

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.subtotal, 0),
  );

  // discount = computed(() => {
  //   const discountPercent = this.summaryForm.get('discount')?.value || 0;
  //   return (this.subtotal() * discountPercent) / 100;
  // });

  totalAmount = computed(
    () => this.subtotal(),
    // - this.discount()
  );

  // POS Cash Payment - Getter
  get cashGiven(): number | null {
    if (!this.summaryForm) return null;
    return this.summaryForm.get('cashGiven')?.value || null;
  }

  // Check if POS payment is valid (cashGiven >= totalAmount)
  get isPOSPaymentValid(): boolean {
    const orderType = this.clientForm.get('orderType')?.value;
    if (orderType !== 'pos') return true; // Not POS, so valid
    
    const cash = this.cashGiven || 0;
    const total = this.totalAmount();
    return cash >= total;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private itemService: ItemService,
  ) {
    addIcons({
      warningOutline,
      closeOutline,
      closeCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
    });

    this.clientForm = this.fb.group({
      clientId: ['', Validators.required],
      orderType: ['delivery', Validators.required],
      assignTo: [''],
    });

    this.itemForm = this.fb.group({
      itemId: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });

    this.summaryForm = this.fb.group({
      cashGiven: [null],
    });

    // Update client selection and auto-fill assignTo
    this.clientForm
      .get('clientId')
      ?.valueChanges.subscribe((clientId: string) => {
        const clients = this.store.selectSnapshot(
          (s: any) => s.clients.clients as Client[],
        );
        const client = clients.find((c) => c._id === clientId) || null;
        this.selectedClient.set(client);

        // Auto-fill assignTo if client has an assigned sales person
        if (client && client.salesPerson) {
          const salesPersonId = typeof client.salesPerson === 'string' ? client.salesPerson : client.salesPerson._id;
          this.clientForm.get('assignTo')?.setValue(salesPersonId, { emitEvent: false });
        } else {
          this.clientForm.get('assignTo')?.setValue('', { emitEvent: false });
        }
      });

    // Handle role-based initialization when role becomes available
    effect(() => {
      const role = this.userRole();
      const userId = this.authUser()?.['_id'];

      // Only proceed if role is available
      if (role) {
        // Always load clients and items when role becomes available
        this.store.dispatch(new LoadClients({ page: 1, limit: 50 }));
        this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));

        if (role === 'sales_person' && userId) {
          this.clientForm.get('assignTo')?.setValue(userId, { emitEvent: false });
        } else if (role === 'owner') {
          // Only load users for owner
          this.store.dispatch(new LoadUsers({ page: 1, limit: 100 }));
        }
      }
    });
  }

  ngOnInit() {
    // Data loading is handled in the effect() in constructor
    // which waits for userRole and authUser signals to be available
  }

  // Helper method to get typed FormControl
  getControl(form: FormGroup, controlName: string): FormControl {
    return form.get(controlName) as FormControl;
  }

  // Helper method to get or create FormControl for item quantity
  private itemQuantityControls = new Map<string, FormControl>();

  getItemQuantityControl(itemId: string): FormControl {
    if (!this.itemQuantityControls.has(itemId)) {
      const cartItem = this.cartItems().find(item => item.itemId === itemId);
      const quantityControl = new FormControl(
        cartItem?.quantity || 1,
        [Validators.required, Validators.min(1)]
      );
      
      // Subscribe to changes and update cart
      quantityControl.valueChanges.subscribe((newQuantity) => {
        if (newQuantity !== null && newQuantity !== undefined) {
          this.updateItemQuantity(itemId, newQuantity);
        }
      });
      
      this.itemQuantityControls.set(itemId, quantityControl);
    }
    return this.itemQuantityControls.get(itemId)!;
  }

  private updateItemQuantity(itemId: string, newQuantity: number) {
    this.cartItems.update((cart) => {
      return cart.map((item) => {
        if (item.itemId === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.sellingPrice,
          };
        }
        return item;
      });
    });
  }

  // Step 1: Client & Order Type
  nextStep1() {
    if (this.clientForm.invalid) {
      this.errorMessage.set('Please select a client and order type');
      return;
    }
    this.errorMessage.set(null);
    this.currentStep.set(2);
  }

  // Step 2: Add Items
  addItem() {
    if (this.itemForm.invalid) {
      this.errorMessage.set('Please select an item and quantity');
      return;
    }

    const itemId = this.itemForm.get('itemId')?.value;
    const quantity = this.itemForm.get('quantity')?.value;

    const items = this.store.selectSnapshot(
      (state: any) => state.items.items as Item[],
    );
    let item = items.find((i) => i._id === itemId) || null;

    if (!item) {
      /* BACKORDER FEATURE DISABLED
      const placeholder = {
        name: `Placeholder - ${itemId}`,
        category: 'unknown',
        stockQuantity: 0,
        lowStockThreshold: 10,
        expiryDate: new Date().toISOString(),
        sellingPrice: 0,
      } as any;

      this.confirmDialog.set({
        visible: true,
        message: `We couldn't find this item in inventory. Create a placeholder and add ${quantity} unit(s) as a backorder?`,
        onConfirm: () => {
          this.itemService.createItem(placeholder).subscribe({
            next: (res) => {
              const created = res.data as Item;
              this.addCartEntry(created, quantity);
              this.itemForm.reset({ itemId: '', quantity: 1 });
              this.errorMessage.set(null);
            },
            error: (err) => {
              this.errorMessage.set('Failed to create placeholder item');
            },
          });
          this.confirmDialog.set({ visible: false });
        },
      });
      return;
      */
      this.errorMessage.set(`Item "${itemId}" not found in inventory`);
      return;
    }

    const available = item.stockQuantity || 0;
    if (available === 0) {
      /* BACKORDER FEATURE DISABLED
      this.confirmDialog.set({
        visible: true,
        message: `"${item.name}" is out of stock. Add ${quantity} unit(s) as backorder?`,
        onConfirm: () => {
          this.addCartEntry(item!, quantity);
          this.itemForm.reset({ itemId: '', quantity: 1 });
          this.errorMessage.set(null);
          this.confirmDialog.set({ visible: false });
        },
      });
      return;
      */
      this.errorMessage.set(`"${item.name}" is out of stock`);
      return;
    }

    if (available < quantity) {
      /* BACKORDER FEATURE DISABLED
      this.confirmDialog.set({
        visible: true,
        message: `Only ${available} unit(s) available. Add ${available} now and ${quantity - available} as backorder?`,
        onConfirm: () => {
          this.addCartEntry(item!, quantity);
          this.itemForm.reset({ itemId: '', quantity: 1 });
          this.errorMessage.set(null);
          this.confirmDialog.set({ visible: false });
        },
      });
      return;
      */
      this.errorMessage.set(`Only ${available} unit(s) available for "${item.name}"`);
      return;
    }

    this.addCartEntry(item, quantity);
    this.itemForm.reset({ itemId: '', quantity: 1 });
    this.errorMessage.set(null);
  }

  private addCartEntry(item: Item, quantity: number) {
    const available = item.stockQuantity || 0;

    /* BACKORDER FEATURE DISABLED - Removed backorder split logic
    if (available === 0) {
      this.cartItems.update((cart) => [
        ...cart,
        {
          itemId: item._id!,
          itemName: item.name,
          quantity,
          sellingPrice: item.sellingPrice,
          subtotal: quantity * item.sellingPrice,
          isBackorder: true,
          expiryDate: item.expiryDate?.toString() || '',
        },
      ]);

      return;
    }

    if (available < quantity) {
      const providedQty = available;
      const backorderQty = quantity - available;

      if (providedQty > 0) {
        this.cartItems.update((cart) => [
          ...cart,
          {
            itemId: item._id!,
            itemName: item.name,
            quantity: providedQty,
            sellingPrice: item.sellingPrice,
            subtotal: providedQty * item.sellingPrice,
            isBackorder: false,
            expiryDate: item.expiryDate?.toString() || '',
          },
        ]);
      }

      this.cartItems.update((cart) => [
        ...cart,
        {
          itemId: item._id!,
          itemName: item.name,
          quantity: backorderQty,
          sellingPrice: item.sellingPrice,
          subtotal: backorderQty * item.sellingPrice,
          isBackorder: true,
          expiryDate: item.expiryDate?.toString() || '',
        },
      ]);
      return;
    }
    */

    const existing = this.cartItems().find(
      (c) => c.itemId === item._id /* && !c.isBackorder */
    );
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * existing.sellingPrice;
      this.cartItems.set([...this.cartItems()]);
    } else {
      this.cartItems.update((cart) => [
        ...cart,
        {
          itemId: item._id!,
          itemName: item.name,
          quantity,
          sellingPrice: item.sellingPrice,
          subtotal: quantity * item.sellingPrice,
          isBackorder: false,
          expiryDate: item.expiryDate?.toString() || '',
        },
      ]);
    }
  }

  backStep2() {
    this.currentStep.set(1);
    this.errorMessage.set(null);
  }

  itemSelectionChanged(selectedValues: string[]) {
    // Auto add selected items
    if (selectedValues.length > 0) {
      const items = this.store.selectSnapshot(
        (state: any) => state.items.items as Item[],
      );
      selectedValues.forEach((itemId) => {
        const item = items.find((i) => i._id === itemId);
        if (item && !this.cartItems().find((c) => c.itemId === itemId)) {
          this.addCartEntry(item, 1);
        }
      });
      this.errorMessage.set(null);
    }
    
    // Keep selectedItemIds in sync with cart items
    this.selectedItemIds.set(this.cartItems().map((item) => item.itemId));
  }

  onItemSearch(searchQuery: string): void {
    console.log('🔍 Typeahead search called with query:', searchQuery);

    const q = (searchQuery ?? '').trim();

    // Dispatch LoadItems with search query
    this.store.dispatch(new LoadItems({ page: 1, limit: 10 }, q ? { search: q } : {}));
  }

  itemSelectionCancel() {
    this.selectedItemIds.set([]);
    this.cartItems.set([]);
  }

  onItemCheckboxChange(event: CustomEvent<{ checked: boolean; value: string }>, item: TypeaheadItem) {
    const { checked, value } = event.detail;

    if (checked) {
      // Add item directly to selected items
      this.selectedItemIds.update((values) => [...values, value]);
    } else {
      this.selectedItemIds.update((values) =>
        values.filter((v) => v !== value),
      );
    }
  }

  nextStep2() {
    if (this.cartItems().length === 0) {
      this.errorMessage.set('Please add at least one item');
      return;
    }

    // Get all items from store
    const allItems = this.store.selectSnapshot(
      (state: any) => state.items.items as Item[],
    );

    // Check for stock issues
    const stockIssues: StockIssue[] = [];

    this.cartItems().forEach((cartItem) => {
      const dbItem = allItems.find((i) => i._id === cartItem.itemId);
      if (dbItem) {
        if (dbItem.stockQuantity <= 0) {
          stockIssues.push({
            itemName: cartItem.itemName,
            requestedQty: cartItem.quantity,
            availableStock: dbItem.stockQuantity,
            reason: 'Out of Stock',
          });
        } else if (cartItem.quantity > dbItem.stockQuantity) {
          stockIssues.push({
            itemName: cartItem.itemName,
            requestedQty: cartItem.quantity,
            availableStock: dbItem.stockQuantity,
            reason: 'Quantity exceeds available',
          });
        }
      }
    });

    // If there are stock issues, show modal
    if (stockIssues.length > 0) {
      this.stockValidationDialog.set({
        visible: true,
        issues: stockIssues,
        onConfirm: () => {
          // User confirmed, proceed to step 3
          this.errorMessage.set(null);
          this.prepareStep3();
          this.currentStep.set(3);
        },
      });
      return;
    }

    // No stock issues, proceed to step 3
    this.errorMessage.set(null);
    this.prepareStep3();
    this.currentStep.set(3);
  }

  /**
   * Prepare Step 3 - Fill cashGiven with totalAmount for POS orders
   */
  private prepareStep3() {
    const orderType = this.clientForm.get('orderType')?.value;
    if (orderType === 'pos') {
      const total = this.totalAmount();
      this.summaryForm.get('cashGiven')?.setValue(total, { emitEvent: false });
    }
  }

  backStep3() {
    this.currentStep.set(2);
    this.errorMessage.set(null);
  }

  removeItem(itemId: string) {
    this.cartItems.update((cart) => cart.filter((c) => c.itemId !== itemId));
    // Clean up the quantity control for this item
    this.itemQuantityControls.delete(itemId);
    // Also remove from selectedItemIds so typeahead updates the count
    this.selectedItemIds.update((ids) => ids.filter((id) => id !== itemId));
  }

  cancelStepper() {
    this.resetForm();
  }

  submitOrder() {
    const { clientId, orderType, assignTo } = this.clientForm.value;
    // const { discount } = this.summaryForm.value;

    if (!clientId || !orderType || this.cartItems().length === 0) {
      this.errorMessage.set('Please complete all steps');
      return;
    }

    // Stock validation already done in nextStep2, proceed with order creation
    this.createOrderSubmission(clientId, orderType, assignTo);
  }

  private createOrderSubmission(clientId: string, orderType: string, assignTo: string) {
    const createOrderDto: any = {
      clientId,
      orderType,
      // For POS: no assignment needed, payment happens immediately
      // For Delivery: assignment is optional
      assignedTo: orderType === 'pos' ? undefined : assignTo,
      assignedFor: orderType === 'pos' ? undefined : (orderType === 'delivery' ? 'delivery' : undefined),
      items: this.cartItems().map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
      })),
      notes: '',
    };

    // Add cash payment info for POS orders
    if (orderType === 'pos') {
      const cashGiven = this.summaryForm.get('cashGiven')?.value || 0;
      createOrderDto.cashGiven = Math.max(0, parseFloat(cashGiven) || 0);
    }

    this.store.dispatch(new CreateOrder(createOrderDto, {
      isLoading: true,
      showToast: true,
      successMessage: orderType === 'pos' ? 'Order created & payment completed!' : 'Order created successfully!',
      errorMessage: 'Failed to create order'
    })).subscribe({
      next: () => {
        this.successMessage.set(orderType === 'pos' ? 'Order completed! Payment received.' : 'Order created successfully!');
        this.stockValidationDialog.set({ visible: false, issues: [] });
        setTimeout(() => {
          this.resetForm();
          this.successMessage.set(null);
          // For POS, navigate to receipt or orders list
          // For Delivery, stay on form for next order or navigate
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to create order');
      },
    });
  }

  private resetForm() {
    this.currentStep.set(1);
    this.clientForm.reset({ clientId: '', orderType: 'delivery' });
    this.itemForm.reset({ itemId: '', quantity: 1 });
    // this.summaryForm.reset({ discount: 0 });
    this.cartItems.set([]);
    this.selectedClient.set(null);
    this.selectedItemIds.set([]);
    this.errorMessage.set(null);
  }

  confirmOutOfStockOk() {
    const cb = this.outOfStockDialog().onConfirm;
    if (cb) {
      try {
        cb();
      } catch (e) {}
    }
    this.outOfStockDialog.set({ visible: false, itemName: '' });
  }

  confirmOutOfStockCancel() {
    const itemId = this.outOfStockDialog().itemId;
    if (itemId) {
      // Remove the item from selected items
      this.selectedItemIds.update((values) =>
        values.filter((v) => v !== itemId),
      );
    }
    this.outOfStockDialog.set({ visible: false, itemName: '' });
  }

  confirmStockValidationOk() {
    const cb = this.stockValidationDialog().onConfirm;
    if (cb) {
      try {
        cb();
      } catch (e) {}
    }
    this.stockValidationDialog.set({ visible: false, issues: [] });
  }

  confirmStockValidationCancel() {
    this.stockValidationDialog.set({ visible: false, issues: [] });
    this.currentStep.set(2); // Go back to add items step
  }

  confirmOk() {
    const cb = this.confirmDialog().onConfirm;
    if (cb) {
      try {
        cb();
      } catch (e) {}
    }
    this.confirmDialog.set({ visible: false });
  }

  confirmCancel() {
    this.confirmDialog.set({ visible: false });
  }

  // Load more clients (infinite scroll)
  loadMoreItems(e: any) {
    this.store
      .dispatch(
        new LoadItems(
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
}
