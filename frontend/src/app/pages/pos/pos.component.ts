import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonBadge,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonNote,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, printOutline, checkmarkOutline, removeOutline, addOutline, cardOutline } from 'ionicons/icons';

// Import Store
import { ItemState } from '../../store/item-store/item.state';
import { ItemSelectors } from '../../store/item-store/item.selectors';
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { LoadItems } from '../../store/item-store/item.actions';
import { CreateOrder } from '../../store/order-store/order.actions';
import { Item } from '../../store/item-store/item.model';

interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  expiryDate: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
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
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonBadge,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonNote,
    IonButtons,
    IonBackButton,
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosComponent implements OnInit {
  CURRENCY = CURRENCY;
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  // Store Signals
  items = this.store.selectSignal(ItemSelectors.allItems);
  isLoading = this.store.selectSignal(OrderSelectors.isLoading);
  error = this.store.selectSignal(OrderSelectors.error);

  // Local state
  cartItems = signal<CartItem[]>([]);
  paymentForm: FormGroup;
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  showPaymentForm = signal(false);

  // Payment methods
  paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'card', label: '💳 Debit/Credit Card' },
    { value: 'cheque', label: '📋 Cheque' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
  ];

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.subtotal, 0)
  );

  discount = computed(() => {
    const discountPercent = this.paymentForm.get('discount')?.value || 0;
    return (this.subtotal() * discountPercent) / 100;
  });

  discountAmount = computed(() => this.discount());

  totalAmount = computed(() => this.subtotal() - this.discountAmount());

  paidAmount = computed(() => this.paymentForm.get('paidAmount')?.value || 0);

  change = computed(() => this.paidAmount() - this.totalAmount());

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['cash', Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
    });

    addIcons({ trashOutline, printOutline, checkmarkOutline, removeOutline, addOutline, cardOutline });
  }

  ngOnInit() {
    this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));
  }

  addToCart(item: Item) {
    if (!item._id) return;

    const available = item.stockQuantity || 0;
    if (available <= 0) {
      this.errorMessage.set(`${item.name} is out of stock`);
      return;
    }

    const existing = this.cartItems().find(c => c.itemId === item._id);
    if (existing) {
      if (existing.quantity < available) {
        existing.quantity++;
        existing.subtotal = existing.quantity * existing.unitPrice;
        this.cartItems.set([...this.cartItems()]);
      } else {
        this.errorMessage.set(`Cannot add more. Only ${available} units available.`);
      }
    } else {
      const cartItem: CartItem = {
        itemId: item._id,
        itemName: item.name,
        quantity: 1,
        unitPrice: item.sellingPrice,
        subtotal: item.sellingPrice,
        expiryDate: item.expiryDate?.toString() || '',
      };
      this.cartItems.update(cart => [...cart, cartItem]);
    }
    this.errorMessage.set(null);
  }

  updateQuantity(itemId: string, quantity: number) {
    const item = this.cartItems().find(c => c.itemId === itemId);
    if (!item) return;

    const storeItem = this.items().find(i => i._id === itemId);
    const available = storeItem?.stockQuantity || 0;

    if (quantity > available) {
      this.errorMessage.set(`Only ${available} units available`);
      return;
    }

    if (quantity > 0) {
      item.quantity = quantity;
      item.subtotal = quantity * item.unitPrice;
      this.cartItems.set([...this.cartItems()]);
    } else {
      this.removeFromCart(itemId);
    }
  }

  removeFromCart(itemId: string) {
    this.cartItems.update(cart => cart.filter(c => c.itemId !== itemId));
  }

  proceeedToPayment() {
    if (this.cartItems().length === 0) {
      this.errorMessage.set('Cart is empty');
      return;
    }
    this.showPaymentForm.set(true);
  }

  completeOrder() {
    if (this.paymentForm.invalid) {
      this.errorMessage.set('Please fill all payment details');
      return;
    }

    const { paymentMethod, discount, paidAmount } = this.paymentForm.value;

    // Create POS order
    const createOrderDto: any = {
      orderType: 'pos',
      clientId: 'pos-customer', // System POS user
      discount: discount || 0,
      paymentMethod,
      paidAmount,
      items: this.cartItems().map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    this.store.dispatch(new CreateOrder(createOrderDto)).subscribe({
      next: () => {
        this.successMessage.set('Order completed successfully! Printing bill...');
        setTimeout(() => {
          this.printBill();
          setTimeout(() => {
            this.resetCart();
          }, 1500);
        }, 500);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to complete order');
      },
    });
  }

  printBill() {
    const billContent = `
      ╔══════════════════════════════════╗
      ║        MEDSTORE POS BILL          ║
      ║   ${new Date().toLocaleString()}   ║
      ╠══════════════════════════════════╣
      ${this.cartItems()
        .map(
          item =>
            `║ ${item.itemName.substring(0, 22).padEnd(22)}   ║
             ║ ${item.quantity} × ${CURRENCY.symbol}${item.unitPrice} = ${CURRENCY.symbol}${item.subtotal.toFixed(2).padStart(8)}        ║`,
        )
        .join('\n')}
      ╠══════════════════════════════════╣
      ║ Subtotal: ${CURRENCY.symbol}${this.subtotal().toFixed(2).padStart(20)} ║
      ║ Discount: -${CURRENCY.symbol}${this.discountAmount().toFixed(2).padStart(18)} ║
      ║ Total: ${CURRENCY.symbol}${this.totalAmount().toFixed(2).padStart(23)} ║
      ║ Paid: ${CURRENCY.symbol}${this.paidAmount().toFixed(2).padStart(24)} ║
      ║ Change: ${CURRENCY.symbol}${this.change().toFixed(2).padStart(23)} ║
      ║ Payment: ${this.paymentForm.get('paymentMethod')?.value}${' '.repeat(19 - (this.paymentForm.get('paymentMethod')?.value || '').length)} ║
      ╚══════════════════════════════════╝
    `;

    console.log(billContent);
    window.print();
  }

  resetCart() {
    this.cartItems.set([]);
    this.paymentForm.reset({ paymentMethod: 'cash', discount: 0, paidAmount: 0 });
    this.showPaymentForm.set(false);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  cancelPayment() {
    this.showPaymentForm.set(false);
    this.paymentForm.reset({ paymentMethod: 'cash', discount: 0, paidAmount: 0 });
  }
}
