import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { inject } from '@angular/core';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';

interface PasswordFormValue {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    BasicInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettingsComponent {
  private fb = inject(FormBuilder);

  loading = input<boolean>(false);
  onUpdatePassword = output<{ oldPassword: string; password: string; confirmPassword: string }>();

  passwordForm!: FormGroup;
  showPasswords = signal({
    old: false,
    new: false,
    confirm: false,
  });

  private formValues = signal<PasswordFormValue>({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });

  // Computed signal to check if form has any input
  hasChanges = computed(() => {
    const current = this.formValues();
    return current.oldPassword !== '' || current.password !== '' || current.confirmPassword !== '';
  });

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(1)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Subscribe to form value changes and update signal
    this.passwordForm.valueChanges.subscribe((values) => {
      this.formValues.set({
        oldPassword: values.oldPassword || '',
        password: values.password || '',
        confirmPassword: values.confirmPassword || '',
      });
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid || !this.hasChanges()) {
      return;
    }
    this.onUpdatePassword.emit(this.passwordForm.value);
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm'): void {
    this.showPasswords.update((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  getOldPasswordError(): string {
    const control = this.passwordForm.get('oldPassword');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Current password is required';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.passwordForm.get('password');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'New password is required';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (!control || !control.touched) {
      return '';
    }
    if (control.errors?.['required']) {
      return 'Please confirm your password';
    }
    if (this.passwordForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

  resetForm(): void {
    this.passwordForm.reset();
    this.formValues.set({
      oldPassword: '',
      password: '',
      confirmPassword: '',
    });
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
  }
}
