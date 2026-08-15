import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonText,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, checkmarkCircleOutline, alertCircleOutline, arrowBackOutline } from 'ionicons/icons';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonIcon,
    IonText,
    IonToolbar,
    IonHeader,
    IonButtons,
    IonTitle,
    BasicInputComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  resetToken = signal('');
  isPasswordValid = signal(false);
  passwordStrength = signal(0);

  constructor() {
    addIcons({ lockClosedOutline, checkmarkCircleOutline, alertCircleOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.resetToken.set(params['token'] || '');
    });
    this.initializeForm();
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.resetPasswordForm.get('password')?.valueChanges.subscribe((value) => {
      this.checkPasswordStrength(value);
    });
  }

  checkPasswordStrength(password: string): void {
    let strength = 0;
    
    if (!password) {
      this.passwordStrength.set(0);
      return;
    }

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    this.passwordStrength.set(Math.min(strength, 5));
  }

  getPasswordStrengthLabel(): string {
    const strength = this.passwordStrength();
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[strength] || 'Enter password';
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    const colors = ['danger', 'warning', 'warning', 'success', 'success', 'success'];
    return colors[strength] || 'medium';
  }

  validatePasswordMatch(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    
    return password && confirmPassword && password === confirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.validatePasswordMatch()) {
      this.errorMessage.set('Passwords do not match or are invalid');
      return;
    }

    if (!this.resetToken()) {
      this.errorMessage.set('Invalid reset link');
      return;
    }

    const password = this.resetPasswordForm.get('password')?.value;
    this.isLoading.set(true);
    this.errorMessage.set('');

    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: this.resetToken(),
        password: password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        this.isLoading.set(false);
        
        if (data.success) {
          this.successMessage.set(data.msg || 'Password reset successful!');
          this.resetPasswordForm.reset();
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage.set(data.msg || 'Failed to reset password');
        }
      })
      .catch(error => {
        this.isLoading.set(false);
        this.errorMessage.set('An error occurred. Please try again.');
        console.error('Reset password error:', error);
      });
  }

  getPasswordError(): string {
    const control = this.resetPasswordForm.get('password');
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    if (control.errors['required']) {
      return 'Password is required';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    const control = this.resetPasswordForm.get('confirmPassword');

    if (!control || !control.touched) {
      return '';
    }

    if (!confirmPassword) {
      return 'Please confirm your password';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
