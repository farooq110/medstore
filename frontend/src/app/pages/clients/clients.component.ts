import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonButtons,
  IonSearchbar,
  IonNote,
  IonBadge,
  IonBackButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkOutline,
  eyeOutline,
} from 'ionicons/icons';
import {
  LoadClients,
  SelectClient,
  DeleteClient,
  ResetClients,
} from '../../store/client-store/client.actions';
import { ClientSelectors } from '../../store/client-store/client.selectors';
import { AuthSelectors } from '../../store/auth-store/auth.selectors';
import { DeleteConfirmationModalComponent } from '../../components/layout/shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonList,
    IonButtons,
    IonSearchbar,
    IonNote,
    IonBadge,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonChip,
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  @ViewChild('searchInput') searchInput: any;

  clients = this.store.selectSignal(ClientSelectors.allClients);
  isLoading = this.store.selectSignal(ClientSelectors.isLoading);
  totalDue = this.store.selectSignal(ClientSelectors.totalDue);
  pagination = this.store.selectSignal(
    ClientSelectors.paginationWithParams('clients'),
  );
  currentUser = this.store.selectSignal(AuthSelectors.user);

  searchTerm = signal('');
  deleteModalOpen = signal(false);
  deleteClientId = signal<string | null>(null);
  deleteClientName = signal<string>('');

  // Computed signal to check if user is owner
  isOwner = computed(() => this.currentUser()?.role === 'owner');

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      closeOutline,
      checkmarkOutline,
      eyeOutline,
    });

  }

  ngOnInit(): void {
    // Initial load of clients is handled in ionViewDidEnter to ensure it runs every time the view is entered
  }

  ionViewWillEnter(): void {
    // Clear clients list to show loading state
    // Refresh dashboard data when the view has fully entered
    this.store.dispatch(
      new LoadClients({ page: 1, limit: 10 }, undefined, { isLoading: true }),
    );
  }

  ionViewDidLeave(): void {
    // Reset clients list when leaving the page
    // this.store.dispatch(new ResetClients());
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onSearchBlur(): void {
    // Keep focus on searchbar if there's active search
    if (this.searchTerm()) {
      setTimeout(() => {
        this.searchInput?.setFocus();
      }, 0);
    }
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm();
  }

  clearSearchFilter(): void {
    this.searchTerm.set('');
    this.applyFilters();
  }

  private applyFilters(): void {
    this.store.dispatch(
      new LoadClients(
        { page: 1, limit: 10 },
        {
          search: this.searchTerm() || undefined,
        },
        { isLoading: true },
      ),
    );
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.store.dispatch(new LoadClients({ page: 1, limit: 10 }, undefined, { isLoading: true }));
  }

  navigateToCreate(): void {
    this.store.dispatch(new SelectClient(null)).subscribe({
      next: () => this.router.navigate(['/owner/client-form']),
    });
  }

  navigateToEdit(client: any): void {
    this.store.dispatch(new SelectClient(client)).subscribe({
      next: () => this.router.navigate(['/owner/client-form']),
    });
  }

  deleteClient(id: string | undefined): void {
    if (!id) return;
    const client = this.clients().find((c) => c._id === id);
    if (client) {
      this.deleteClientId.set(id);
      this.deleteClientName.set(client.name);
      this.deleteModalOpen.set(true);
    }
  }

  confirmDelete(): void {
    const id = this.deleteClientId();
    if (id) {
      this.store.dispatch(new DeleteClient(id, {
        isLoading: true,
        showToast: true,
      }));
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteClientId.set(null);
    this.deleteClientName.set('');
  }

  getDueStatus(due: number): string {
    if (due === 0) return 'success';
    // if (due < 5000) return 'warning';
    return 'danger';
  }

  viewDetails(clientId: string): void {
    this.router.navigate(['/owner/clients', clientId]);
  }

  // Load more clients (infinite scroll)
  loadMore(event: InfiniteScrollCustomEvent) {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    this.store
      .dispatch(
        new LoadClients({
          page: (paginationValue?.page ?? 0) + 1,
          limit: 10,
        },{
          search: this.searchTerm() || undefined,
        },),
      )
      .subscribe({
        next: () => {
          event.target.complete();
        },
        error: () => {
          event.target.complete();
        },
      });
  }
}
