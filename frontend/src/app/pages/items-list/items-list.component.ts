import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngxs/store';
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
  IonButton,
  IonIcon,
  IonList,
  IonButtons,
  IonSearchbar,
  IonNote,
  IonBadge,
  IonSpinner,
  IonBackButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonText,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkOutline,
  arrowBack,
} from 'ionicons/icons';
import {
  LoadItems,
  DeleteItem,
  SelectItem,
  ClearItemFilter,
} from '../../store/item-store/item.actions';
import { ItemSelectors } from '../../store/item-store/item.selectors';
import { CategorySelectors } from '../../store/category-store/category.selectors';
import { LoadCategories } from '../../store/category-store/category.actions';
import { DeleteConfirmationModalComponent } from '../../components/layout/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { debounceTime, Subject } from 'rxjs';
import {
  FilterSelectComponent,
  FilterOption,
} from '../../components/layout/shared/filter-select/filter-select.component';
import { Category } from 'src/app/store/category-store';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    IonText,
    CommonModule,
    FormsModule,
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
    IonButton,
    IonIcon,
    IonList,
    IonButtons,
    IonSearchbar,
    IonNote,
    IonBadge,
    IonSpinner,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonChip,
    DeleteConfirmationModalComponent,
    FilterSelectComponent,
  ],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  items = this.store.selectSignal(ItemSelectors.allItems);
  categories = this.store.selectSignal(CategorySelectors.allCategories);
  isLoading = this.store.selectSignal(ItemSelectors.isLoading);
  pagination = this.store.selectSignal(
    ItemSelectors.paginationWithParams('items'),
  );

  searchTerm = signal('');
  selectedCategory = signal<string>('');
  stockStatusFilter = signal<string>('');
  deleteModalOpen = signal(false);
  deleteItemId = signal<string | null>(null);
  deleteItemName = signal<string>('');

  // Stock status filter options
  readonly stockStatusOptions = computed(
    () =>
      [
        { value: 'lowStock', label: 'Low Stock' },
        { value: 'expiringSoon', label: 'Expiring Soon' },
      ] as FilterOption[],
  );

  // Category filter options
  readonly categoryOptions = computed(
    () =>
      this.categories().map((cat) => ({
        value: cat._id || '',
        label: cat.name,
      })) as FilterOption[],
  );

  private searchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      closeOutline,
      checkmarkOutline,
      arrowBack,
    });

    // Setup debounced search (300ms)
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });

    // Setup debounced filter (300ms)
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    // this.store.dispatch(new LoadCategories({ page: 1, limit: 100 }));
    // // Check for filters passed through navigation state
    // const navigationExtras = history.state;
    // if (navigationExtras?.filters?.stockStatus) {
    //   this.stockStatusFilter.set(navigationExtras.filters.stockStatus);
    //   // Load items with filter directly
    //   this.applyFilters();
    // } else {
    //   // Load items without filter
    //   this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));
    // }
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    this.store.dispatch(new LoadCategories({ page: 1, limit: 100 }));

    // Check for filters passed through navigation state
    const navigationExtras = history.state;
    if (navigationExtras?.filters?.stockStatus) {
      this.stockStatusFilter.set(navigationExtras.filters.stockStatus);
      // Load items with filter directly
      this.applyFilters();
    } else {
      // Load items without filter
      this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onCategoryChange(value: string | string[]): void {
    const val = Array.isArray(value) ? value[0] : value;
    this.selectedCategory.set(val);
    this.filterSubject.next();
  }

  onStockStatusChange(value: string | string[]): void {
    const val = Array.isArray(value) ? value[0] : value;
    this.stockStatusFilter.set(val);
    this.filterSubject.next();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm() ||
      this.selectedCategory() ||
      this.stockStatusFilter()
    );
  }

  clearSearchFilter(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
  }

  clearCategoryFilter(): void {
    this.selectedCategory.set('');
    this.filterSubject.next();
  }

  clearStockStatusFilter(): void {
    this.stockStatusFilter.set('');
    this.filterSubject.next();
  }

  getCategoryNameById(categoryId: string): string {
    const category = this.categories().find((c) => c._id === categoryId);
    return category?.name || 'Unknown';
  }

  getStockStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      lowStock: 'Low Stock',
      expiringSoon: 'Expiring Soon',
    };
    return labels[status] || status;
  }

  private applyFilters(): void {
    this.store.dispatch(
      new LoadItems(
        { page: 1, limit: 10 },
        {
          search: this.searchTerm() || undefined,
          category: this.selectedCategory() || undefined,
          lowStock: this.stockStatusFilter() === 'lowStock',
          expiringSoon: this.stockStatusFilter() === 'expiringSoon',
        },
      ),
    );
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.stockStatusFilter.set('');
    this.store.dispatch(new ClearItemFilter());
    this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));
  }

  navigateToCreate(): void {
    this.store.dispatch(new SelectItem(null)).subscribe({
      next: () => this.router.navigate(['/owner/items/form']),
    });
  }

  navigateToEdit(item: any): void {
    this.store.dispatch(new SelectItem(item)).subscribe({
      next: () => this.router.navigate(['/owner/items/form']),
    });
  }

  deleteItem(id: string | undefined): void {
    if (!id) return;
    const item = this.items().find((i) => i._id === id);
    if (item) {
      this.deleteItemId.set(id);
      this.deleteItemName.set(item.name);
      this.deleteModalOpen.set(true);
    }
  }

  confirmDelete(): void {
    const id = this.deleteItemId();
    if (id) {
      this.store.dispatch(new DeleteItem(id, {
        isLoading: true,
        showToast: true,
      }));
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteItemId.set(null);
    this.deleteItemName.set('');
  }

  viewDetails(id: string): void {
    this.router.navigate(['/owner/items/details', id]);
  }

  getCategoryName(category: Category): string {
    return category?.name || 'Unknown';
  }

  getStockStatus(quantity: number, threshold: number): string {
    if (quantity === 0) return 'danger';
    if (quantity <= threshold) return 'warning';
    return 'success';
  }

  // Load more items (infinite scroll)
  loadMore(event: InfiniteScrollCustomEvent) {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    this.store
      .dispatch(
        new LoadItems(
          {
            page: (paginationValue?.page ?? 0) + 1,
            limit: 10,
          },
          {
            search: this.searchTerm() || undefined,
            category: this.selectedCategory() || undefined,
            lowStock: this.stockStatusFilter() === 'lowStock',
            expiringSoon: this.stockStatusFilter() === 'expiringSoon',
          },
        ),
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
