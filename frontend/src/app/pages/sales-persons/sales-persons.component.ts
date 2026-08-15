import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonButtons,
  IonSearchbar,
  IonBadge,
  IonBackButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkOutline,
  lockClosedOutline,
  eyeOutline,
  peopleOutline,
} from 'ionicons/icons';
import { User } from '../../store/user-store/user.model';
import {
  LoadUsers,
  SelectUser,
  UpdateUser,
  DeleteUser,
} from '../../store/user-store/user.actions';
import { UserSelectors } from '../../store/user-store/user.selectors';
import { DeleteConfirmationModalComponent } from '../../components/layout/shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-sales-persons',
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
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonList,
    IonButtons,
    IonSearchbar,
    IonBadge,
    IonBackButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    DeleteConfirmationModalComponent,
    IonText
  ],
  templateUrl: './sales-persons.component.html',
  styleUrl: './sales-persons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPersonsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  salesPersons = this.store.selectSignal(UserSelectors.salesPersons);
  isLoading = this.store.selectSignal(UserSelectors.isLoading);
  pagination = this.store.selectSignal(
    UserSelectors.paginationWithParams('salesPersons'),
  );
  searchTerm = signal('');
  deleteModalOpen = signal(false);
  deletePersonId = signal<string | null>(null);
  deletePersonName = signal<string>('');

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      closeOutline,
      checkmarkOutline,
      lockClosedOutline,
      eyeOutline,
      peopleOutline,
    });
  }

  ngOnInit(): void {
    // this.loadSalesPersons();
  }

  ionViewDidEnter(): void {
    // Refresh dashboard data when the view has fully entered
    this.loadSalesPersons();
  }

  private loadSalesPersons(): void {
    this.store.dispatch(
      new LoadUsers(
        { page: 1, limit: 10 },
        {
          search: this.searchTerm() || undefined,
        },
      ),
    );
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
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
      new LoadUsers(
        { page: 1, limit: 10 },
        {
          search: this.searchTerm() || undefined,
        },
      ),
    );
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.store.dispatch(new LoadUsers({ page: 1, limit: 10 }));
  }

  navigateToCreate(): void {
    this.store.dispatch(new SelectUser(null)).subscribe({
      next: () => this.router.navigate(['/owner/sales-persons/new']),
    });
  }

  navigateToEdit(salesPerson: User): void {
    this.store.dispatch(new SelectUser(salesPerson)).subscribe({
      next: () => this.router.navigate(['/owner/sales-persons/new']),
    });
  }

  deleteSalesPerson(id: string | undefined): void {
    if (!id) return;
    const person = this.salesPersons().find((p) => p._id === id);
    if (person) {
      this.deletePersonId.set(id);
      this.deletePersonName.set(person.name);
      this.deleteModalOpen.set(true);
    }
  }

  confirmDelete(): void {
    const id = this.deletePersonId();
    if (id) {
      this.store.dispatch(new DeleteUser(id));
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deletePersonId.set(null);
    this.deletePersonName.set('');
  }

  resetPassword(id: string): void {
    if (confirm('Send password reset email to this sales person?')) {
      // Reset password action can be added to user store
      const payload = { userId: id, action: 'resetPassword' };
      this.store.dispatch(new UpdateUser({ id, data: payload }));
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['/owner/sales-persons', id]);
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    const paginationValue = this.pagination();

    if (!paginationValue?.hasMore) {
      event.target.complete();
      return;
    }

    this.store
      .dispatch(
        new LoadUsers({
          page: (paginationValue?.page ?? 0) + 1,
          limit: 10,
        }),
      )
      .subscribe({
        next: () => event.target.complete(),
        error: () => event.target.complete(),
      });
  }
}
