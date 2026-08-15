import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
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
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonSpinner,
  ViewWillLeave
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';
import { User } from '../../store/user-store/user.model';
import {
  SelectUser,
  CreateUser,
  UpdateUser,
} from '../../store/user-store/user.actions';
import { UserSelectors } from '../../store/user-store/user.selectors';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';

@Component({
  selector: 'app-sales-person-form',
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
    IonItem,
    IonLabel,
    IonToggle,
    IonButton,
    IonSpinner,
    BasicInputComponent,
  ],
  templateUrl: './sales-person-form.component.html',
  styleUrls: ['./sales-person-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPersonFormComponent implements ViewWillLeave {
  form!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly selectedUser = this.store.selectSignal(
    UserSelectors.selectedUser,
  );

  readonly isLoading = this.store.selectSignal(UserSelectors.isLoading);
  readonly error = this.store.selectSignal(UserSelectors.error);
  readonly isEdit = computed(() => !!this.selectedUser());
  readonly title = computed(() =>
    this.isEdit() ? 'Edit Sales Person' : 'Add Sales Person',
  );

  constructor() {
    addIcons({ checkmarkOutline, closeOutline });
    this.initForm();
    effect(() => {
      const user = this.selectedUser();
      if (!this.form) {
        return;
      }
      if (user) {
        this.patchForm(user);
      } else {
        this.resetForm();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isActive: [true],
    });
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      isActive: user.isActive,
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
    });
  }

  ionViewWillLeave(): void {
    this.resetForm();
    this.store.dispatch(new SelectUser(null));
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    const body: any = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      isActive: payload.isActive,
    };

    if (!this.isEdit() || payload.password) {
      body.password = payload.password;
    }

    const selected = this.selectedUser();
    const action =
      this.isEdit() && selected?._id
        ? new UpdateUser({ id: selected._id, data: body })
        : new CreateUser(body);

    this.store.dispatch(action).subscribe({
      next: () => {
        this.resetForm();
        this.store.dispatch(new SelectUser(null));
        this.router.navigate(['/owner/sales-persons']);
      },
    });
  }

  cancel(): void {
    this.resetForm();
    this.store.dispatch(new SelectUser(null));
    this.router.navigate(['/owner/sales-persons']);
  }
}
