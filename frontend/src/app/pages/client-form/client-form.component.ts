import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonToggle,
  IonSpinner,
  ViewWillLeave,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ClientSelectors } from '../../store/client-store/client.selectors';
import { UserSelectors } from '../../store/user-store/user.selectors';
import {
  CreateClient,
  UpdateClient,
  SelectClient,
} from '../../store/client-store/client.actions';
import { LoadUsers } from '../../store/user-store/user.actions';
import { BasicInputComponent } from '../../components/layout/shared/basic-input/basic-input.component';
import { BasicTextareaComponent } from '../../components/layout/shared/basic-textarea/basic-textarea.component';
import { BasicSelectComponent } from '../../components/layout/shared/basic-select/basic-select.component';
import { Client } from '../../store/client-store/client.model';
import { User } from '../../store/user-store/user.model';

// Custom validators
function ntnValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Allow empty value (optional field)
  }
  const value = control.value.trim();
  const ntnPattern = /^[0-9]{10}$|^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
  
  if (!ntnPattern.test(value)) {
    return { invalidNTN: true };
  }
  return null;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonToggle,
    IonSpinner,
    IonSelectOption,
    ReactiveFormsModule,
    BasicInputComponent,
    BasicTextareaComponent,
    BasicSelectComponent,
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormComponent implements ViewWillLeave {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly selectedClient = this.store.selectSignal(
    ClientSelectors.selectedClient,
  );

  readonly salesPersons = this.store.selectSignal(UserSelectors.salesPersons);
  readonly isEdit = computed(() => !!this.selectedClient());
  clientForm!: FormGroup;
  isSubmitting = false;

  constructor() {
    effect(() => {
      const client = this.selectedClient();
      if (!this.clientForm) {
        return;
      }
      if (client) {
        this.patchForm(client);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.store.dispatch(new LoadUsers({ page: 1, limit: 100 }));
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      shopName: ['', []],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
      address: ['', [Validators.required]],
      creditLimit: [0, [Validators.required, Validators.min(0)]],
      salesPerson: ['', []],
      ntn: ['', [ntnValidator]],
      isActive: [true],
    });
  }

  private patchForm(client: Client): void {
    this.clientForm.patchValue({
      name: client.name,
      shopName: client.shopName || '',
      email: client.email || '',
      phone: client.phone,
      address: client.address,
      creditLimit: client.creditLimit,
      salesPerson: client.salesPerson ? (typeof client.salesPerson === 'string' ? client.salesPerson : client.salesPerson._id) : '',
      ntn: client.ntn || '',
      isActive: client.isActive !== false,
    });
  }

  private resetForm(): void {
    this.clientForm.reset({
      isActive: true,
      salesPerson: '',
    });
  }

  getControl(form: FormGroup, controlName: string): FormControl {
    return form.get(controlName) as FormControl;
  }

  save(): void {
    if (!this.clientForm.valid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.clientForm.value;

    if (this.isEdit()) {
      const clientId = this.selectedClient()?._id;
      if (clientId) {
        this.store.dispatch(
          new UpdateClient({
            id: clientId,
            data: formValue,
          }, {
            isLoading: true,
            showToast: true,
          }),
        );
      }
    } else {
      this.store.dispatch(new CreateClient(formValue, {
        isLoading: true,
        showToast: true,
      }));
    }

    this.router.navigate(['/owner/clients']);
  }

  cancel(): void {
    this.resetForm();
    this.router.navigate(['/owner/clients']);
  }

  ionViewWillLeave(): void {
    this.store.dispatch(new SelectClient(null));
  }
}
