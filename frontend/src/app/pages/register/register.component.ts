import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Register, selectAuthLoading } from '../../store/auth-store';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonButton,
  IonSpinner,
  IonImg,
} from '@ionic/angular/standalone';
import { BasicInputComponent } from 'src/app/components/layout/shared/basic-input/basic-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonButton,
    IonSpinner,
    IonImg,
    BasicInputComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly registerForm: FormGroup;
  readonly isLoading = this.store.selectSignal(selectAuthLoading);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]{10,}$/)]],
      businessName: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required]],
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.value;
    this.store.dispatch(new Register(formData, { isLoading: true }));
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
