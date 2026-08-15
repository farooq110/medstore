import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Client, ClientStateModel } from './client.model';
import { ClientService } from './client.service';
import {
  LoadClients,
  LoadClientById,
  LoadClientDues,
  LoadClientDetail,
  CreateClient,
  UpdateClient,
  DeleteClient,
  SelectClient,
  SetLoading,
  SetError,
  FilterClientsByActive,
  FilterClientsBySearchTerm,
  ResetClients,
} from './client.actions';
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: ClientStateModel = {
  clients: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  dynamicPagination: null,
  selectedClient: null,
  selectedClientDetails: null,
  loading: false,
  error: null,
  filterCriteria: {},
};

@State<ClientStateModel>({
  name: 'clients',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class ClientState {
  constructor(
    private clientService: ClientService,
    private coreService: CoreService
  ) {}

  // ============ ACTIONS ============
  @Action(LoadClients)
  async loadClients(ctx: StateContext<ClientStateModel>, action: LoadClients) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    const oldPagination = ctx.getState().dynamicPagination ?? {};
    const state = action.payload.page === 1 ? [] : ctx.getState().clients;
    return this.clientService.getAllClients(action.payload, action.filter).pipe(
      tap((res) => {
        const clients = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: clients.length,
          hasMore: false,
          pages: 1,
        };
        ctx.patchState({
          clients: [...state, ...clients],
          dynamicPagination: {
            ...oldPagination,
            ['clients']: pagination,
          },
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of([]);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(LoadClientById)
  async loadClientById(ctx: StateContext<ClientStateModel>, action: LoadClientById) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    return this.clientService.getClientById(action.payload).pipe(
      tap((res) => {
        const client = res.data;
        ctx.patchState({
          selectedClient: client,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(LoadClientDetail)
  async loadClientDetail(ctx: StateContext<ClientStateModel>, action: LoadClientDetail) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    return this.clientService.getClientDetail(action.payload).pipe(
      tap((res) => {
        const detailData = res.data;
        ctx.patchState({
          selectedClient: detailData.client,
          selectedClientDetails: detailData,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(CreateClient)
  async createClient(ctx: StateContext<ClientStateModel>, action: CreateClient) {
    const options: ActionOptions = action.options || { isLoading: false };
    const { isLoading = false, showToast = false, successMessage, errorMessage } = options;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    return this.clientService.createClient(action.payload).pipe(
      tap((res) => {
        const newClient = res.data;
        const state = ctx.getState();
        ctx.patchState({
          clients: [...state.clients, newClient],
          loading: false,
          error: null,
        });
        
        // Show success toast if enabled
        if (showToast) {
          const message = successMessage || 'Client created successfully';
          this.coreService.showSuccessToast(message);
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        
        // Show error toast if enabled
        if (showToast) {
          const message = errorMessage || error.message || 'Failed to create client';
          this.coreService.showErrorToast(message);
        }
        
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(UpdateClient)
  async updateClient(ctx: StateContext<ClientStateModel>, action: UpdateClient) {
    const options: ActionOptions = action.options || { isLoading: false };
    const { isLoading = false, showToast = false, successMessage, errorMessage } = options;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    return this.clientService.updateClient(action.payload.id, action.payload.data).pipe(
      tap((res) => {
        const updatedClient = res.data;
        const state = ctx.getState();
        const updatedClients = state.clients.map((client) =>
          client._id === action.payload.id ? updatedClient : client
        );
        ctx.patchState({
          clients: updatedClients,
          selectedClient:
            state.selectedClient?._id === action.payload.id
              ? updatedClient
              : state.selectedClient,
          loading: false,
          error: null,
        });
        
        // Show success toast if enabled
        if (showToast) {
          const message = successMessage || 'Client updated successfully';
          this.coreService.showSuccessToast(message);
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        
        // Show error toast if enabled
        if (showToast) {
          const message = errorMessage || error.message || 'Failed to update client';
          this.coreService.showErrorToast(message);
        }
        
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(DeleteClient)
  async deleteClient(ctx: StateContext<ClientStateModel>, action: DeleteClient) {
    const options: ActionOptions = action.options || { isLoading: false };
    const { isLoading = false, showToast = false, successMessage, errorMessage } = options;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      await this.coreService.showLoading();
    }
    
    return this.clientService.deleteClient(action.payload).pipe(
      tap((res) => {
        const state = ctx.getState();
        const filteredClients = state.clients.filter((c) => c._id !== action.payload);
        ctx.patchState({
          clients: filteredClients,
          selectedClient:
            state.selectedClient?._id === action.payload ? null : state.selectedClient,
          loading: false,
          error: null,
        });
        
        // Show success toast if enabled
        if (showToast) {
          const message = successMessage || 'Client deleted successfully';
          this.coreService.showSuccessToast(message);
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        
        // Show error toast if enabled
        if (showToast) {
          const message = errorMessage || error.message || 'Failed to delete client';
          this.coreService.showErrorToast(message);
        }
        
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(SelectClient)
  selectClient(ctx: StateContext<ClientStateModel>, action: SelectClient) {
    ctx.patchState({ selectedClient: action.payload });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<ClientStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<ClientStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(FilterClientsByActive)
  filterByActive(ctx: StateContext<ClientStateModel>, action: FilterClientsByActive) {
    ctx.patchState({
      filterCriteria: { ...ctx.getState().filterCriteria, isActive: action.payload },
    });
  }

  @Action(FilterClientsBySearchTerm)
  filterBySearchTerm(
    ctx: StateContext<ClientStateModel>,
    action: FilterClientsBySearchTerm
  ) {
    ctx.patchState({
      filterCriteria: { ...ctx.getState().filterCriteria, searchTerm: action.payload },
    });
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<ClientStateModel>) {
    ctx.setState(defaults);
  }

  @Action(ResetClients)
  resetClients(ctx: StateContext<ClientStateModel>) {
    // Reset ONLY clients array and dynamicPagination['clients'] - keep everything else
    const state = ctx.getState();
    const updatedDynamicPagination = { ...state.dynamicPagination };
    delete updatedDynamicPagination['clients'];
    
    ctx.patchState({
      clients: [],
      dynamicPagination: updatedDynamicPagination,
    });
  }
}
