import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login, selectAuthLoading } from '../../store/auth-store';
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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly ionicForm: FormGroup;
  readonly isLoading = this.store.selectSignal(selectAuthLoading);

  constructor() {
    this.ionicForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.ionicForm.invalid) return;

    const { email, password } = this.ionicForm.value;
    this.store.dispatch(new Login({ email, password }, { isLoading: true }));
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

