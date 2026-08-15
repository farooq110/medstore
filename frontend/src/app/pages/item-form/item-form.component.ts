import { Component, ChangeDetectionStrategy, inject, OnInit, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonSelectOption,
  IonSpinner,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { LoadItems, CreateItem, UpdateItem, SelectItem } from '../../store/item-store/item.actions';
import { ItemSelectors } from '../../store/item-store/item.selectors';
import { CategorySelectors } from '../../store/category-store/category.selectors';
import { LoadCategories } from '../../store/category-store/category.actions';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { BasicSelectComponent } from '../../components/layout/shared/basic-select/basic-select.component';
import { BasicTextareaComponent } from '../../components/layout/shared/basic-textarea/basic-textarea.component';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonSelectOption,
    IonSpinner,
    BasicInputComponent,
    BasicSelectComponent,
    BasicTextareaComponent,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormComponent implements OnInit, ViewWillLeave {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  private readonly selectedItem = this.store.selectSignal(ItemSelectors.selectedItem);
  
  readonly categories = this.store.selectSignal(CategorySelectors.allCategories);
  readonly isLoading = this.store.selectSignal(ItemSelectors.isLoading);
  readonly error = this.store.selectSignal(ItemSelectors.error);
  
  readonly selectedCategory = signal<any>(null);
  
  readonly isEdit = computed(() => !!this.selectedItem());
  readonly title = computed(() => this.isEdit() ? 'Edit Item' : 'Create Item');

  itemForm!: FormGroup;

  constructor() {
    this.initForm();
    
    // Get selected category from router state if available using currentNavigation signal
    effect(() => {
      const navigation = this.router.currentNavigation();
      if (navigation?.extras?.state && navigation.extras.state['selectedCategory']) {
        this.selectedCategory.set(navigation.extras.state['selectedCategory']);
      }
    });
    
    // Effect to populate form when selectedItem changes
    effect(() => {
      const item = this.selectedItem();
      if (!this.itemForm) {
        return;
      }
      if (item) {
        this.patchForm(item);
      } else {
        this.resetForm();
      }
    });

    // Effect to set the category field if selectedCategory was passed
    effect(() => {
      const category = this.selectedCategory();
      if (category && this.itemForm) {
        this.itemForm.patchValue({ category: category._id });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadCategories({page: 1, limit: 10}));
    this.store.dispatch(new LoadItems({ page: 1, limit: 10 }));
  }

  ionViewWillLeave(): void {
    this.resetForm();
    this.store.dispatch(new SelectItem(null));
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      lowStockThreshold: ['', [Validators.required, Validators.min(1)]],
      sellingPrice: ['', [Validators.required, Validators.min(0)]],
      costPrice: ['', Validators.min(0)],
      expiryDate: ['', Validators.required],
      // sku: [''],
      description: ['', Validators.maxLength(500)],
    });
  }

  private patchForm(item: any): void {
    // Format expiryDate to YYYY-MM-DD format for date input
    let formattedExpiryDate = '';
    if (item.expiryDate) {
      const date = new Date(item.expiryDate);
      formattedExpiryDate = date.toISOString().split('T')[0];
    }

    this.itemForm.patchValue({
      name: item.name,
      category: item.category,
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
      sellingPrice: item.sellingPrice,
      costPrice: item.costPrice,
      expiryDate: formattedExpiryDate,
      // sku: item.sku,
      description: item.description,
    });
  }

  private resetForm(): void {
    this.itemForm.reset();
  }

  save(): void {
    if (this.itemForm.invalid) return;

    const payload = this.itemForm.getRawValue();
    const selectedItem = this.selectedItem();

    if (this.isEdit() && selectedItem?._id) {
      this.store.dispatch(
        new UpdateItem({
          id: selectedItem._id,
          data: payload,
        }, {
          isLoading: true,
          showToast: true,
        })
      ).subscribe({
        next: () => {
          this.resetForm();
          this.store.dispatch(new SelectItem(null));
          this.router.navigate(['/owner/items']);
        },
      });
    } else {
      this.store.dispatch(new CreateItem(payload, {
        isLoading: true,
        showToast: true,
      })).subscribe({
        next: () => {
          this.resetForm();
          this.store.dispatch(new SelectItem(null));
          this.router.navigate(['/owner/items']);
        },
      });
    }
  }

  cancel(): void {
    this.resetForm();
    this.store.dispatch(new SelectItem(null));
    this.router.navigate(['/owner/items']);
  }
}
