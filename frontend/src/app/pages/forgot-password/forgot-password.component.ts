import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonImg,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { ForgotPassword } from '../../store/auth-store/auth.actions';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonImg,
    BasicInputComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);

  forgotPasswordForm!: FormGroup;
  isLoading = signal(false);
  forgotPasswordMessage = signal('');

  constructor() {
    addIcons({ arrowBackOutline, checkmarkCircleOutline, alertCircleOutline });
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.store.dispatch(new ForgotPassword(
      this.forgotPasswordForm.value,
      {
        isLoading: true,
      }
    ))
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
