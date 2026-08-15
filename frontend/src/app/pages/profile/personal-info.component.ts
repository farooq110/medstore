import { ChangeDetectionStrategy, Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { AuthUser } from '../../store/auth-store/auth.model';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { Store } from '@ngxs/store';
import { UpdateProfile } from '../../store/auth-store/auth.actions';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    BasicInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInfoComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  user = input<AuthUser | null>(null);
  loading = input<boolean>(false);
  onUpdate = output<{ name: string; phone: string }>();

  personalForm!: FormGroup;
  private originalValues = signal<{ name: string; phone: string } | null>(null);
  private formValues = signal<{ name: string; phone: string }>({ name: '', phone: '' });

  // Computed signal to check if form has meaningful changes
  hasChanges = computed(() => {
    const original = this.originalValues();
    const current = this.formValues();
    
    if (!original) return false;
    
    return (
      current.name !== original.name ||
      current.phone !== original.phone
    );
  });

  constructor() {
    this.initializeForm();
    
    // Watch for changes to user input and update form when user data arrives
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.updateFormWithUserData(currentUser);
      }
    });
  }

  private initializeForm(): void {
    this.personalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
    });

    // Subscribe to form value changes and update signal
    this.personalForm.valueChanges.subscribe((values) => {
      this.formValues.set({
        name: values.name || '',
        phone: values.phone || '',
      });
    });
  }

  private updateFormWithUserData(user: AuthUser): void {
    if (!this.personalForm) return;
    
    const userData = {
      name: user.name || '',
      phone: user.phone || '',
    };
    
    // Store original values
    this.originalValues.set(userData);
    
    // Update form values signal to match original (so no changes initially)
    this.formValues.set(userData);
    
    this.personalForm.patchValue({
      ...userData,
      email: user.email || '',
      role: this.formatRole(user.role),
    }, { emitEvent: false });
  }

  private formatRole(role?: string | null): string {
    if (!role) return '';
    return role
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ');
  }

  onSubmit(): void {
    if (this.personalForm.invalid || !this.hasChanges()) {
      return;
    }
    const formValue = this.personalForm.value;
    // Dispatch UpdateProfile action with name and phone
    this.store.dispatch(
      new UpdateProfile(
        {
          name: formValue.name,
          phone: formValue.phone,
        },
        {
          isLoading: true,
          showToast: true,
          successMessage: 'Profile updated successfully',
          errorMessage: 'Failed to update profile',
        }
      )
    );
  }

  resetForm(): void {
    const original = this.originalValues();
    if (original) {
      this.personalForm.patchValue({
        name: original.name,
        phone: original.phone,
      }, { emitEvent: false });
      
      // Update form values signal to match original
      this.formValues.set(original);
    }
  }

  getNameError(): string {
    const control = this.personalForm.get('name');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Name is required';
    }
    if (control.errors['minlength']) {
      return 'Name is too short';
    }
    return '';
  }

  getPhoneError(): string {
    const control = this.personalForm.get('phone');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Phone is required';
    }
    if (control.errors['minlength']) {
      return 'Phone number is invalid';
    }
    return '';
  }
}
