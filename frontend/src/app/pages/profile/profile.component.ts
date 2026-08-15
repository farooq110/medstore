import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  ViewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonButtons,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Store } from '@ngxs/store';
import { PersonalInfoComponent } from './personal-info.component';
import { SecuritySettingsComponent } from './security-settings.component';
import { BusinessProfileComponent } from './business-profile.component';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, buildOutline } from 'ionicons/icons';
import { USER_ROLES } from '../../constants/roles';
import { CoreService } from '../../services/capacitor/core.service';
import {
  LoadProfile,
  UpdateProfile,
  UpdateBusiness,
} from '../../store/auth-store/auth.actions';
import { AuthSelectors } from '../../store/auth-store/auth.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonHeader,
    IonButtons,
    IonToolbar,
    IonBackButton,
    IonTitle,
    PersonalInfoComponent,
    SecuritySettingsComponent,
    BusinessProfileComponent,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);
  private coreService = inject(CoreService);

  @ViewChild('securitySettings') securitySettings:
    | SecuritySettingsComponent
    | undefined;

  // Use NGXS selectors with store.selectSignal for reactive state
  user = this.store.selectSignal(AuthSelectors.user);
  loading = this.store.selectSignal(AuthSelectors.loading);
  isOwner = this.store.selectSignal(AuthSelectors.isOwner);
  error = this.store.selectSignal(AuthSelectors.error);

  activeTab = signal<'personal' | 'security' | 'business'>('personal');
  private lastLoadingState = false;

  readonly USER_ROLES = USER_ROLES;

  constructor() {
    addIcons({ personOutline, lockClosedOutline, buildOutline });

    // Watch loading state to reset security form after successful password update
    effect(() => {
      const isLoading = this.loading();
      // When loading transitions from true to false, it means update completed
      if (this.lastLoadingState && !isLoading) {
        this.securitySettings?.resetForm();
      }
      this.lastLoadingState = isLoading;
    });
  }

  ngOnInit(): void {
    // Load fresh profile data from server when component initializes
    this.store.dispatch(
      new LoadProfile({ isLoading: false, showToast: false })
    );
  }

  setActiveTab(tab: 'personal' | 'security' | 'business'): void {
    this.activeTab.set(tab);
  }

  onTabChange(event: any): void {
    const tab = event.detail.value;
    if (tab && (tab === 'personal' || tab === 'security' || tab === 'business')) {
      this.setActiveTab(tab);
    }
  }

  async onPersonalInfoUpdate(data: {
    name: string;
    phone: string;
  }): Promise<void> {
    // Dispatch UpdateProfile action (handles loading and toasts via store)
    this.store.dispatch(
      new UpdateProfile(data, {
        isLoading: true,
        showToast: true,
        successMessage: 'Profile updated successfully',
        errorMessage: 'Failed to update profile',
      })
    );
  }

  async onSecurityUpdate(data: {
    oldPassword: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    // Dispatch UpdateProfile action with password fields
    this.store.dispatch(
      new UpdateProfile(
        {
          password: data.password,
          oldPassword: data.oldPassword,
        },
        {
          isLoading: true,
          showToast: true,
          successMessage: 'Password changed successfully',
          errorMessage: 'Failed to change password',
        }
      )
    );
  }

  async onBusinessUpdate(data: {
    name: string;
    phone?: string;
    address?: string;
    website?: string;
    country: string;
  }): Promise<void> {
    // Dispatch UpdateBusiness action
    this.store.dispatch(
      new UpdateBusiness(data, {
        isLoading: true,
        showToast: true,
        successMessage: 'Business updated successfully',
        errorMessage: 'Failed to update business',
      })
    );
  }
}
