import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonNote,
} from '@ionic/angular/standalone';
import { LoadItems, LoadItemById } from '../../store/item-store/item.actions';
import { ItemSelectors } from '../../store/item-store/item.selectors';
import { CategorySelectors } from '../../store/category-store/category.selectors';
import { LoadCategories } from '../../store/category-store/category.actions';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonNote,
  ],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly selectedItem = this.store.selectSignal(ItemSelectors.selectedItem);
  readonly categories = this.store.selectSignal(
    CategorySelectors.allCategories,
  );
  readonly isLoading = this.store.selectSignal(ItemSelectors.isLoading);
  readonly error = this.store.selectSignal(ItemSelectors.error);

  readonly categoryName = computed(() => {
    const item = this.selectedItem();
    // const categories = this.categories();
    if (!item) return 'Unknown';
    // const category = categories.find((c) => c._id === item.category);
    return item.category?.name || 'Unknown';
  });

  readonly stockStatus = computed(() => {
    const item = this.selectedItem();
    if (!item) return { color: 'medium', text: 'Unknown' };

    if (item.stockQuantity === 0) {
      return { color: 'danger', text: 'Out of Stock' };
    }
    if (item.stockQuantity <= item.lowStockThreshold) {
      return { color: 'warning', text: 'Low Stock' };
    }
    return { color: 'success', text: 'In Stock' };
  });

  readonly profit = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    return item.sellingPrice - (item.costPrice || 0);
  });

  readonly profitMargin = computed(() => {
    const item = this.selectedItem();
    if (!item || !item.costPrice || item.costPrice === 0) return 0;
    const margin = (this.profit() / item.costPrice) * 100;
    return parseFloat(margin.toFixed(2));
  });

  ngOnInit(): void {
    // this.store.dispatch(new LoadCategories({page: 1}));
    // this.route.paramMap.subscribe((params) => {
    //   const id = params.get('id');
    //   if (id) {
    //     this.store.dispatch(new LoadItemById(id));
    //   }
    // });
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   this.orderId.set(id);
    //   this.store.dispatch(new LoadOrderById(id));
    // }

    this.store.dispatch(new LoadCategories({ page: 1 }));

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.store.dispatch(new LoadItemById(id));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/owner/items']);
  }

  editItem(): void {
    const item = this.selectedItem();
    if (item?._id) {
      this.router.navigate(['/owner/items/form', item._id]);
    }
  }

  getFormattedDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isExpiringsSoon(): boolean {
    const item = this.selectedItem();
    if (!item?.expiryDate) return false;

    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }

  isExpired(): boolean {
    const item = this.selectedItem();
    if (!item?.expiryDate) return false;

    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    return expiryDate < today;
  }

  getDaysUntilExpiry(): number {
    const item = this.selectedItem();
    if (!item?.expiryDate) return 0;

    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    return Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
