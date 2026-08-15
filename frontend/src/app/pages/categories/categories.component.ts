import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonButtons,
  IonSearchbar,
  IonNote,
  IonBadge,
  IonBackButton,
  IonSpinner,
  IonGrid,
  IonChip,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline,folderOutline } from 'ionicons/icons';
import {
  LoadCategories,
  SelectCategory,
  DeleteCategory,
} from '../../store/category-store/category.actions';
import { CategorySelectors } from '../../store/category-store/category.selectors';
import { DeleteConfirmationModalComponent } from '../../components/layout/shared/delete-confirmation-modal/delete-confirmation-modal.component';

interface CategoryForm {
  name: FormControl;
  description: FormControl;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    IonChip,
    IonGrid,
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
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonList,
    IonButtons,
    IonSearchbar,
    IonNote,
    IonBadge,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly page = signal(1);
  readonly limit = signal(10);

  categories = this.store.selectSignal(CategorySelectors.allCategories);
  isLoading = this.store.selectSignal(CategorySelectors.isLoading);
  error = this.store.selectSignal(CategorySelectors.error);
  readonly pagination = this.store.selectSignal(CategorySelectors.paginationWithParams("categories"));

  searchTerm = signal('');
  deleteModalOpen = signal(false);
  deleteCategoryId = signal<string | null>(null);
  deleteCategoryName = signal<string>('');

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      folderOutline
    });
  }

  ngOnInit(): void {
    // this.store.dispatch(new LoadCategories({ page: 1, limit: 10 }));
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
   this.store.dispatch(new LoadCategories({ page: 1, limit: 10 }));
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm();
  }

  clearSearchFilter(): void {
    this.searchTerm.set('');
    this.applyFilters();
  }

  private applyFilters(): void {
    this.store.dispatch(
      new LoadCategories({ page: 1, limit: 10 }, {
        search: this.searchTerm() || undefined,
      }),
    );
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.store.dispatch(new LoadCategories({ page: 1, limit: 10 }));
  }

  navigateToCreate(): void {
    this.store.dispatch(new SelectCategory(null));
    this.router.navigate(['/owner/category-form']);
  }

  navigateToEdit(category: any): void {
    this.store.dispatch(new SelectCategory(category));
    this.router.navigate(['/owner/category-form']);
  }

  navigateToCreateItem(category: any): void {
    // Navigate to item form with the selected category in router state
    this.router.navigate(['/owner/items/form'], {
      state: { selectedCategory: category },
    });
  }

  deleteCategory(id: string | undefined): void {
    if (!id) return;
    const category = this.categories().find((c) => c._id === id);
    if (category) {
      this.deleteCategoryId.set(id);
      this.deleteCategoryName.set(category.name);
      this.deleteModalOpen.set(true);
    }
  }

  confirmDelete(): void {
    const id = this.deleteCategoryId();
    if (id) {
      this.store.dispatch(new DeleteCategory(id, {
        isLoading: true,
        showToast: true,
      }));
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteCategoryId.set(null);
    this.deleteCategoryName.set('');
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    this.store
      .dispatch(
        new LoadCategories({ page: (paginationValue?.page ?? 0) + 1 }))
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

import { FormControl } from '@angular/forms';
