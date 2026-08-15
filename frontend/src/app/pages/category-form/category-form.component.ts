import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonToggle,
  IonItem,
  IonLabel,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';
import { Category } from '../../store/category-store/category.model';
import {
  SelectCategory,
  CreateCategory,
  UpdateCategory,
} from '../../store/category-store/category.actions';
import { CategorySelectors } from '../../store/category-store/category.selectors';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { BasicTextareaComponent } from '../../components/layout/shared/basic-textarea/basic-textarea.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonToggle,
    IonItem,
    IonLabel,
    BasicInputComponent,
    BasicTextareaComponent,
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent implements ViewWillLeave {
  form!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly selectedCategory = this.store.selectSignal(
    CategorySelectors.selectedCategory,
  );

  readonly isLoading = this.store.selectSignal(CategorySelectors.isLoading);
  readonly error = this.store.selectSignal(CategorySelectors.error);
  readonly isEdit = computed(() => !!this.selectedCategory());
  readonly title = computed(() =>
    this.isEdit() ? 'Edit Category' : 'Add Category',
  );

  constructor() {
    addIcons({ checkmarkOutline, closeOutline });
    this.initForm();
    effect(() => {
      const category = this.selectedCategory();
      if (!this.form) {
        return;
      }
      if (category) {
        this.patchForm(category);
      } else {
        this.resetForm();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
    });
  }

  private patchForm(category: Category): void {
    this.form.patchValue({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive !== false,
    });
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      isActive: true,
    });
  }

  save(): void {
    if (!this.form.valid) return;

    const payload = this.form.value;

    if (this.isEdit()) {
      const categoryId = this.selectedCategory()?._id;
      if (categoryId) {
        this.store.dispatch(
          new UpdateCategory({
            id: categoryId,
            data: payload,
          }, {
            isLoading: true,
            showToast: true,
          })
        );
      }
    } else {
      this.store.dispatch(new CreateCategory(payload, {
        isLoading: true,
        showToast: true,
      }));
    }

    this.router.navigate(['/owner/categories']);
  }

  cancel(): void {
    this.router.navigate(['/owner/categories']);
  }

  ionViewWillLeave(): void {
    this.store.dispatch(new SelectCategory(null));
  }
}
