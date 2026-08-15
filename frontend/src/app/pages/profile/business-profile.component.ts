import { ChangeDetectionStrategy, Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { AuthUser } from '../../store/auth-store/auth.model';
import { addIcons } from 'ionicons';
import { buildOutline } from 'ionicons/icons';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { Store } from '@ngxs/store';
import { UpdateBusiness } from '../../store/auth-store/auth.actions';

interface BusinessFormValue {
  name: string;
  phone: string;
  address: string;
  website: string;
  country: string;
}

@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonIcon,
    IonCard,
    IonCardContent,
    BasicInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessProfileComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  user = input<AuthUser | null>(null);
  loading = input<boolean>(false);
  onUpdate = output<{ name: string; phone?: string; address?: string; website?: string; country: string }>();

  businessForm!: FormGroup;
  private originalValues = signal<BusinessFormValue | null>(null);
  private formValues = signal<BusinessFormValue>({
    name: '',
    phone: '',
    address: '',
    website: '',
    country: '',
  });

  // Computed signal to check if form has meaningful changes
  hasChanges = computed(() => {
    const original = this.originalValues();
    const current = this.formValues();
    
    if (!original) return false;
    
    return (
      current.name !== original.name ||
      current.phone !== original.phone ||
      current.address !== original.address ||
      current.website !== original.website ||
      current.country !== original.country
    );
  });

  constructor() {
    addIcons({ buildOutline });
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
    this.businessForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      address: [''],
      website: ['', this.urlValidator.bind(this)],
      country: ['', Validators.required],
    });

    // Subscribe to form value changes and update signal
    this.businessForm.valueChanges.subscribe((values) => {
      this.formValues.set({
        name: values.name || '',
        phone: values.phone || '',
        address: values.address || '',
        website: values.website || '',
        country: values.country || '',
      });
    });
  }

  private updateFormWithUserData(user: AuthUser): void {
    if (!this.businessForm) return;
    
    const business = typeof user?.business === 'object' ? user.business : null;
    
    const userData: BusinessFormValue = {
      name: business?.name || '',
      phone: business?.phone || '',
      address: business?.address || '',
      website: business?.website || '',
      country: business?.country || '',
    };
    
    // Store original values
    this.originalValues.set(userData);
    
    // Update form values signal to match original (so no changes initially)
    this.formValues.set(userData);
    
    this.businessForm.patchValue(userData, { emitEvent: false });
  }

  urlValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }
    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  onSubmit(): void {
    if (this.businessForm.invalid || !this.hasChanges()) {
      return;
    }
    const formValue = this.businessForm.value;
    // Dispatch UpdateBusiness action
    this.store.dispatch(
      new UpdateBusiness(
        {
          name: formValue.name,
          phone: formValue.phone,
          address: formValue.address,
          website: formValue.website,
          country: formValue.country,
        },
        {
          isLoading: true,
          showToast: true,
          successMessage: 'Business profile updated successfully',
          errorMessage: 'Failed to update business profile',
        }
      )
    );
  }

  resetForm(): void {
    const original = this.originalValues();
    if (original) {
      this.businessForm.patchValue(original, { emitEvent: false });
      
      // Update form values signal to match original
      this.formValues.set(original);
    }
  }

  getNameError(): string {
    const control = this.businessForm.get('name');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Business name is required';
    }
    if (control.errors['minlength']) {
      return 'Business name is too short';
    }
    return '';
  }

  getWebsiteError(): string {
    const control = this.businessForm.get('website');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['invalidUrl']) {
      return 'Invalid website URL';
    }
    return '';
  }

  getCountryError(): string {
    const control = this.businessForm.get('country');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Country is required';
    }
    return '';
  }
}
