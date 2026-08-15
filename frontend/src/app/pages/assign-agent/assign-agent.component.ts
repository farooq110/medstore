import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { selectUserRole } from '../../store/auth-store';
import { UserService } from '../../store/user-store/user.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonSpinner,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonText,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  personAdd,
  checkmark,
  person,
  call,
  mail,
  location,
} from 'ionicons/icons';

// Import Store
import { OrderSelectors } from '../../store/order-store/order.selectors';
import { AssignOrder, SelectOrder } from '../../store/order-store/order.actions';
import { Order } from '../../store/order-store/order.model';

@Component({
  selector: 'app-assign-agent',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonSpinner,
    IonNote,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonText,
    IonList,
    IonAvatar,
  ],
  templateUrl: './assign-agent.component.html',
  styleUrl: './assign-agent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignAgentComponent implements OnInit {
  // Store signals
  selectedOrder = this.store.selectSignal(OrderSelectors.selectedOrder);
  isLoading = this.store.selectSignal(OrderSelectors.isLoading);
  error = this.store.selectSignal(OrderSelectors.error);
  readonly userRoleFromStore = this.store.selectSignal(selectUserRole);

  // Sales Persons (from API)
  salesPersons = signal<any[]>([]);
  salesPersonsLoading = signal<boolean>(false);
  salesPersonsError = signal<string | null>(null);

  // Local state
  userRole = signal<string | null>(null);
  orderId = signal<string>('');
  showPersonList = signal<boolean>(true);
  selectedSalesPerson = signal<any>(null);
  isAssigning = signal<boolean>(false);
  assignmentType = signal<"delivery" | "payment_collection">("delivery");

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    addIcons({
      arrowBack,
      personAdd,
      checkmark,
      person,
      call,
      mail,
      location,
    });
  }

  ngOnInit() {
    // this.userRole.set(this.userRoleFromStore());
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   this.orderId.set(id);
    // }

    // // Fetch sales persons from server
    // this.salesPersonsLoading.set(true);
    // this.userService.getAllUsers({ page: 1, limit: 50 }).subscribe({
    //   next: (response: any) => {
    //     if (response.data) {
    //       this.salesPersons.set(response.data);
    //     }
    //     this.salesPersonsLoading.set(false);
    //   },
    //   error: (err: any) => {
    //     this.salesPersonsError.set(err.message || 'Failed to load sales persons');
    //     this.salesPersonsLoading.set(false);
    //   }
    // });
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    this.userRole.set(this.userRoleFromStore());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
    }

    // Fetch sales persons from server
    this.salesPersonsLoading.set(true);
    this.userService.getAllUsers({ page: 1, limit: 50 }).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.salesPersons.set(response.data);
        }
        this.salesPersonsLoading.set(false);
      },
      error: (err: any) => {
        this.salesPersonsError.set(err.message || 'Failed to load sales persons');
        this.salesPersonsLoading.set(false);
      }
    });
  }

  // Get sales person initials for avatar
  getSalesPersonInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  // Select sales person
  selectSalesPerson(person: any) {
    this.selectedSalesPerson.set(person);
    this.showPersonList.set(false);
  }

  // Go back to sales persons list
  backToSalesPersonList() {
    this.selectedSalesPerson.set(null);
    this.showPersonList.set(true);
  }

  // Assign order to sales person
  confirmAssignment() {
    const person = this.selectedSalesPerson();
    const order = this.selectedOrder();
    const userRole = this.userRole();

    if (!person || !order) {
      alert('Invalid sales person or order');
      return;
    }

    this.isAssigning.set(true);

    // Owner assigns order to sales person with task type
    if (userRole === 'owner') {
      this.store
        .dispatch(
          new AssignOrder({
            orderId: order._id!,
            salesPersonId: person._id,
            assignFor: this.assignmentType(),
          })
        )
        .subscribe({
          next: () => {
            alert(`Sales Person assigned for ${this.assignmentType()} successfully!`);
            this.isAssigning.set(false);
            // Clear the selected order from store
            this.store.dispatch(new SelectOrder(null));
            // Navigate to order list page
            const userRole = this.userRole();
            if (userRole === 'owner') {
              this.router.navigate(['/owner/orders']);
            } else {
              this.router.navigate(['/sales/orders']);
            }
          },
          error: (err) => {
            alert('Error assigning sales person: ' + (err.message || err));
            this.isAssigning.set(false);
          },
        });
    }
  }

  // Go back to order detail
  goBack() {
    const userRole = this.userRole();
    const orderId = this.orderId();
    switch (userRole) {
      case 'owner':
        this.router.navigate(['/owner/orders', orderId]);
        break;
      case 'sales_person':
        this.router.navigate(['/sales/orders', orderId]);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  // Set assignment type (for owner)
  setAssignmentType(type: "delivery" | "payment_collection") {
    this.assignmentType.set(type);
  }
}
