import { Component, OnInit, signal, effect, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonText,
  IonSpinner,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonAccordionGroup,
  IonAccordion,
  IonNote
} from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  chevronDownOutline,
  addOutline,
  swapHorizontalOutline,
  trashOutline,
  closeOutline,
} from 'ionicons/icons';
import { User } from '../../store/user-store/user.model';
import { Client } from '../../store/client-store/client.model';
import { Order } from '../../store/order-store/order.model';
import { LoadUserById, AssignClients, ReassignClient, LoadUsers, LoadClientOptions, RemoveClient } from '../../store/user-store/user.actions';
import { UserSelectors } from '../../store/user-store/user.selectors';

@Component({
  selector: 'app-sales-person-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonBadge,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonText,
    IonSpinner,
    IonList,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonAccordionGroup,
    IonAccordion,
    IonNote,
  ],
  templateUrl: './sales-person-detail.component.html',
  styleUrls: ['./sales-person-detail.component.scss'],
})
export class SalesPersonDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storeService = inject(Store);
  private readonly fb = inject(FormBuilder);

  // Store signals
  readonly selectedUser = this.storeService.selectSignal(UserSelectors.selectedUser);
  readonly clientOptions = this.storeService.selectSignal(UserSelectors.clientOptions);
  readonly storeError = this.storeService.selectSignal(UserSelectors.error);
  readonly salesPersons = this.storeService.selectSignal(UserSelectors.salesPersons);
  readonly loading = this.storeService.selectSignal(UserSelectors.isLoading);

  // Local state signals
  readonly salesPerson = signal<User | null>(null);
  readonly assignedClients = signal<Client[]>([]);
  readonly salesPersonOrders = signal<Order[]>([]);
  readonly reassignSalesPersons = signal<User[]>([]);

  // Forms
  assignClientsForm: FormGroup;
  reassignForm: FormGroup;

  // Modals
  readonly showAssignModal = signal(false);
  readonly showReassignModal = signal(false);
  readonly showRemoveConfirmModal = signal(false);
  readonly selectedClientForReassign = signal<Client | null>(null);
  readonly selectedClientForRemove = signal<Client | null>(null);

  // Stats
  readonly totalOrders = signal(0);
  readonly completedOrders = signal(0);
  readonly pendingOrders = signal(0);
  readonly totalRevenue = signal(0);
  readonly totalDueCollected = signal(0);
  readonly pendingDueAmount = signal(0);
  readonly averageOrderValue = signal(0);
  readonly completionRate = signal(0);
  readonly collectionRate = signal(0);

  readonly error = signal<string | null>(null);

  // Computed derived state
  readonly unassignedClientsCount = computed(() => 
    this.clientOptions().filter(c => !c.isAssigned).length
  );

  constructor() {
    addIcons({
      chevronDownOutline,
      addOutline,
      swapHorizontalOutline,
      trashOutline,
      closeOutline,
    });
    this.assignClientsForm = this.fb.group({
      clientIds: [[], Validators.required],
    });

    this.reassignForm = this.fb.group({
      newSalesPersonId: ['', Validators.required],
    });

    // Set up effects to sync store signals to local signals
    effect(() => {
      const user = this.selectedUser();
      if (user) {
        this.salesPerson.set(user);
        this.assignedClients.set((user as any).assignedClients || []);
        this.salesPersonOrders.set((user as any).orders || []);
        
        // Get stats from server response
        const stats = (user as any).stats || {};
        this.totalOrders.set(stats.totalOrders || 0);
        this.completedOrders.set(stats.completedOrders || 0);
        this.pendingOrders.set(stats.pendingOrders || 0);
        this.totalRevenue.set(stats.totalRevenue || 0);
        this.totalDueCollected.set(stats.totalDueCollected || 0);
        this.pendingDueAmount.set(stats.pendingDueAmount || 0);
        this.averageOrderValue.set(stats.averageOrderValue || 0);
        this.completionRate.set(stats.completionRate || 0);
        this.collectionRate.set(stats.collectionRate || 0);
      }
    });

    effect(() => {
      const salesPersons = this.salesPersons();
      // Filter out current sales person
      this.reassignSalesPersons.set(
        (salesPersons as User[]).filter((sp) => sp._id !== this.salesPerson()?._id) || []
      );
    });

    effect(() => {
      const storeErr = this.storeError();
      this.error.set(storeErr as string | null);
    });
  }

  ngOnInit() {
    // this.route.params.subscribe((params: any) => {
    //   if (params['id']) {
    //     this.loadSalesPersonDetails(params['id']);
    //     this.loadOtherSalesPersons();
    //   }
    // });
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
     this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.loadSalesPersonDetails(params['id']);
        this.loadOtherSalesPersons();
      }
    });
  }

  loadSalesPersonDetails(id: string) {
    this.storeService.dispatch(new LoadUserById(id));
    // this.storeService.dispatch(new LoadClientOptions('false'));
  }

  private loadOtherSalesPersons() {
    // this.storeService.dispatch(new LoadUsers({ page: 1, limit: 10 }));
  }

  openAssignClientsModal() {
    this.showAssignModal.set(true);
  }

  closeAssignClientsModal() {
    this.showAssignModal.set(false);
    this.assignClientsForm.reset();
  }

  assignClients() {
    if (!this.salesPerson() || !this.assignClientsForm.valid) {
      return;
    }

    const clientIds = this.assignClientsForm.get('clientIds')?.value || [];
    if (clientIds.length === 0) {
      this.error.set('Please select at least one client');
      return;
    }

    this.storeService.dispatch(
      new AssignClients({
        salesPersonId: this.salesPerson()?._id as string,
        clientIds,
      })
    );

    setTimeout(() => {
      this.closeAssignClientsModal();
      this.assignClientsForm.reset();
    }, 1000);
  }

  openReassignModal(client: Client) {
    this.selectedClientForReassign.set(client);
    this.showReassignModal.set(true);
  }

  closeReassignModal() {
    this.showReassignModal.set(false);
    this.reassignForm.reset();
    this.selectedClientForReassign.set(null);
  }

  reassignClient() {
    if (!this.selectedClientForReassign() || !this.reassignForm.valid) {
      return;
    }

    const newSalesPersonId = this.reassignForm.get('newSalesPersonId')?.value;

    this.storeService.dispatch(
      new ReassignClient({
        clientId: this.selectedClientForReassign()?._id as string,
        newSalesPersonId,
      })
    );

    setTimeout(() => {
      this.closeReassignModal();
      this.loadSalesPersonDetails(this.salesPerson()?._id as string);
    }, 1000);
  }

  removeClient(clientId: string) {
    const client = this.assignedClients().find(c => c._id === clientId);
    if (client) {
      this.selectedClientForRemove.set(client);
      this.showRemoveConfirmModal.set(true);
    }
  }

  closeRemoveConfirmModal() {
    this.showRemoveConfirmModal.set(false);
    this.selectedClientForRemove.set(null);
  }

  confirmRemoveClient() {
    if (!this.selectedClientForRemove()?._id) {
      return;
    }

    this.storeService.dispatch(new RemoveClient(this.selectedClientForRemove()?._id as string));

    setTimeout(() => {
      this.closeRemoveConfirmModal();
      this.loadSalesPersonDetails(this.salesPerson()?._id as string);
    }, 500);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(value);
  }

  goBack() {
    this.router.navigate(['/owner/sales-persons']);
  }
}
