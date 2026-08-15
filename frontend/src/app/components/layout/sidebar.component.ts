import { Component, ChangeDetectionStrategy, input, signal, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthSelectors } from '../../store/auth-store/auth.selectors';
import { Logout } from '../../store/auth-store/auth.actions';
import { Router } from '@angular/router';
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  cartOutline,
  receiptOutline,
  gridOutline,
  settingsOutline,
  logOutOutline,
} from 'ionicons/icons';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterLink,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private store = inject(Store);
  private router = inject(Router);
  private menuController = inject(MenuController);

  contentId = input<string>('main-content');
  navItems = input<NavItem[]>([]);
  isOpen = signal(false);

  // User and business info from store
  readonly user = this.store.selectSignal(AuthSelectors.user);
  readonly businessName = this.store.selectSignal(AuthSelectors.userBusiness);
  readonly userRole = this.store.selectSignal(AuthSelectors.userRole);
  readonly userName = this.store.selectSignal(AuthSelectors.userName);
  readonly userEmail = this.store.selectSignal(AuthSelectors.userEmail);

  // Menu items based on role
  readonly menuItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      route: '/owner/dashboard',
      icon: 'grid-outline',
      roles: ['owner', 'sales_person', 'delivery_agent'],
    },
    {
      label: 'Orders',
      route: '/owner/orders',
      icon: 'receipt-outline',
      roles: ['owner', 'sales_person', 'delivery_agent'],
    },
    {
      label: 'Sales Team',
      route: '/owner/sales-team',
      icon: 'people-outline',
      roles: ['owner'],
    },
    {
      label: 'Reports',
      route: '/owner/reports',
      icon: 'bar-chart-outline',
      roles: ['owner'],
    },
    {
      label: 'My Deliveries',
      route: '/owner/deliveries',
      icon: 'car-outline',
      roles: ['delivery_agent'],
    },
    {
      label: 'Profile',
      route: '/owner/profile',
      icon: 'person-outline',
      roles: ['owner', 'sales_person', 'delivery_agent'],
    },
  ]);

  constructor() {
    addIcons({
      personOutline,
      cartOutline,
      receiptOutline,
      gridOutline,
      settingsOutline,
      logOutOutline,
    });
  }

  toggleSidebar() {
    this.isOpen.update(v => !v);
  }

  isMenuItemVisible(item: NavItem): boolean {
    const role = this.userRole();
    if (!item.roles) return true;
    return item.roles.includes(role || '');
  }

  closeSidebar() {
    this.isOpen.set(false);
    this.menuController.close();
  }

  logout() {
    this.store.dispatch(new Logout());
    this.menuController.close();
  }

  getBusinessNameDisplay(): string {
    const business = this.businessName();
    if (typeof business === 'string') {
      return business;
    }
    if (business && typeof business === 'object' && 'name' in business) {
      return (business as any).name;
    }
    return 'My Business';
  }

  getDummyLogoUrl(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNPCN0bGUgY3g9IjMyIiBjeT0iMzIiIHI9IjMxIiBzdHJva2U9IiMxOTc2ZDIiIHN0cm9rZS13aWR0aD0iMiIvPgo8cmVjdCB4PSIyMiIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzE5NzZkMiIgcng9IjIiLz4KPGN0ZXh0IHg9IjMyIiB5PSIzNSIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5NUzwvdGV4dD4KPC9zdmc+';
  }
}
