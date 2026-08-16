import { ChangeDetectionStrategy, Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { AuthUser, Business } from '../../store/auth-store/auth.model';
import { addIcons } from 'ionicons';
import { buildOutline, cameraOutline, trashOutline, cloudUploadOutline } from 'ionicons/icons';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { Store } from '@ngxs/store';
import { UpdateBusiness } from '../../store/auth-store/auth.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface BusinessFormValue {
  name: string;
  phone: string;
  address: string;
  website: string;
  country: string;
  ntn: string;
  logoUrl: string;
}

@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButton,
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
  private coreService = inject(CoreService);
  private sanitizer = inject(DomSanitizer);

  user = input<AuthUser | null>(null);
  loading = input<boolean>(false);
  onUpdate = output<{ name: string; phone?: string; address?: string; website?: string; country: string; ntn?: string; logo?: string }>();

  businessForm!: FormGroup;
  private originalValues = signal<BusinessFormValue | null>(null);
  private formValues = signal<BusinessFormValue>({
    name: '',
    phone: '',
    address: '',
    website: '',
    country: '',
    ntn: '',
    logoUrl: '',
  });

  logoPreview: SafeUrl | null = null;
  private fileInput: HTMLInputElement | null = null;

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
      current.country !== original.country ||
      current.ntn !== original.ntn ||
      current.logoUrl !== original.logoUrl
    );
  });

  constructor() {
    addIcons({ buildOutline, cameraOutline, trashOutline, cloudUploadOutline });
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
      ntn: [''],
      logoUrl: [''],
    });

    // Subscribe to form value changes and update signal
    this.businessForm.valueChanges.subscribe((values) => {
      this.formValues.set({
        name: values.name || '',
        phone: values.phone || '',
        address: values.address || '',
        website: values.website || '',
        country: values.country || '',
        ntn: values.ntn || '',
        logoUrl: values.logoUrl || '',
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
      ntn: business?.ntn || '',
      logoUrl: business?.logo || '',
    };

    // Store original values
    this.originalValues.set(userData);

    // Update form values signal to match original (so no changes initially)
    this.formValues.set(userData);

    this.businessForm.patchValue(userData, { emitEvent: false });

    // Set logo preview from existing URL
    if (business?.logo) {
      this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(business.logo);
    }
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

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.coreService.showErrorToast('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.coreService.showErrorToast('Image must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = e.target.result as string;
      this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(base64String);
      this.businessForm.patchValue({ logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.accept = 'image/*';
      this.fileInput.addEventListener('change', (e) => this.onFileSelect(e));
    }
    this.fileInput.click();
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.businessForm.patchValue({ logoUrl: '' });
  }

  getBusinessLogo(): string | null {
    const business = this.user()?.business;
    if (typeof business === 'object' && business) {
      return business.logo || null;
    }
    return null;
  }

  onSubmit(): void {
    if (this.businessForm.invalid || !this.hasChanges()) {
      return;
    }
    const formValue = this.businessForm.value;
    const original = this.originalValues();

    // Build the business update payload
    const businessPayload: any = {
      name: formValue.name,
      phone: formValue.phone,
      address: formValue.address,
      website: formValue.website,
      country: formValue.country,
      ntn: formValue.ntn || null,
    };

    // Handle logo: include if changed
    if (formValue.logoUrl !== original?.logoUrl) {
      businessPayload.logo = formValue.logoUrl || null;
    }

    // Dispatch UpdateBusiness action for all business fields including NTN and logo
    this.store.dispatch(
      new UpdateBusiness(
        businessPayload,
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

      // Reset logo preview
      if (original.logoUrl) {
        this.logoPreview = this.sanitizer.bypassSecurityTrustUrl(original.logoUrl);
      } else {
        this.logoPreview = null;
      }
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
