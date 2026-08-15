import { Injectable } from "@angular/core";
import { State, Action, StateContext, Selector } from "@ngxs/store";
import { AlertService } from "./alert.service";
import { Alert, AlertStateModel } from "./alert.model";
import {
  LoadAlerts,
  LoadAlertById,
  CreateAlert,
  MarkAlertAsSeen,
  MarkAlertAsResolved,
  DeleteAlert,
  SelectAlert,
  SetLoading,
  SetError,
  FilterAlertsByType,
  FilterAlertsBySeverity,
} from "./alert.actions";
import { catchError, tap, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults = {
  alerts: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  dynamicPagination: null,
  selectedAlert: null,
  unreadCount: { owner: 0, salesPerson: 0 },
  loading: false,
  error: null,
  filterCriteria: {},
};

@State<AlertStateModel>({
  name: "alerts",
  defaults,
})
@Injectable({
  providedIn: "root",
})
export class AlertState {
  constructor(
    private alertService: AlertService,
    private coreService: CoreService
  ) {}

  @Action(LoadAlerts)
  async loadAlerts(ctx: StateContext<AlertStateModel>, action: LoadAlerts) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    ctx.patchState({ loading: true });
    
    if (isLoading) {
       await this.coreService.showLoading();
    }
    
    const currentState = ctx.getState();
    const oldPagination = currentState.dynamicPagination ?? {};
    
    // For infinite scroll: append new alerts unless it's a new filter/search (page 1 with fresh filters)
    const isNewFilter = action.payload.page === 1 && JSON.stringify(action.filter) !== JSON.stringify(currentState.filterCriteria);
    const previousAlerts = isNewFilter ? [] : currentState.alerts;
    
    return this.alertService.getAllAlerts(action.payload, action.filter).pipe(
      tap((res) => {
        const alerts = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: alerts.length,
          hasMore: false,
          pages: 1,
        };
        // Calculate unread counts
        const unreadCount = {
          owner: alerts.filter((a) => !a.seenByOwner && !a.resolved).length,
          salesPerson: alerts.filter((a) => !a.seenBySalesPerson && !a.resolved)
            .length,
        };

        ctx.patchState({
          alerts: [...previousAlerts, ...alerts],
          pagination: {
            page: pagination.page,
            totalCount: pagination.totalCount,
            pages: pagination.pages,
            hasMore: pagination.hasMore,
          },
          dynamicPagination: {
            ...oldPagination,
            ['alerts']: pagination,
          },
          unreadCount,
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

  @Action(LoadAlertById)
  loadAlertById(ctx: StateContext<AlertStateModel>, action: LoadAlertById) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    const alerts = ctx.getState().alerts;
    const alert = alerts.find((a) => a._id === action.payload);

    if (alert) {
      ctx.patchState({
        selectedAlert: alert,
        loading: false,
      });
      return of(alert).pipe(
        finalize(async () => {
          if (isLoading) {
            await this.coreService.hideLoading();
          }
        })
      );
    }

    return of(null).pipe(
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

  @Action(CreateAlert)
  createAlert(ctx: StateContext<AlertStateModel>, action: CreateAlert) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.alertService.createAlert(action.payload).pipe(
      tap((res) => {
        const alert = res.data;
        const state = ctx.getState();
        ctx.patchState({
          alerts: [...state.alerts, alert],
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

  @Action(MarkAlertAsSeen)
  markAlertAsSeen(ctx: StateContext<AlertStateModel>, action: MarkAlertAsSeen) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    return this.alertService.markAsSeen(action.payload).pipe(
      tap((res) => {
        const updatedAlert = res.data;
        const state = ctx.getState();
        ctx.patchState({
          alerts: state.alerts.map((alert) =>
            alert._id === updatedAlert._id ? updatedAlert : alert,
          ),
        });
      }),
      catchError((error) => {
        ctx.patchState({ error: error.message });
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(MarkAlertAsResolved)
  markAlertAsResolved(
    ctx: StateContext<AlertStateModel>,
    action: MarkAlertAsResolved,
  ) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    return this.alertService.markAsResolved(action.payload).pipe(
      tap((res) => {
        const updatedAlert = res.data;
        const state = ctx.getState();
        ctx.patchState({
          alerts: state.alerts.map((alert) =>
            alert._id === updatedAlert._id ? updatedAlert : alert,
          ),
        });
      }),
      catchError((error) => {
        ctx.patchState({ error: error.message });
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(DeleteAlert)
  deleteAlert(ctx: StateContext<AlertStateModel>, action: DeleteAlert) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.alertService.deleteAlert(action.payload).pipe(
      tap((res) => {
        const state = ctx.getState();
        const updatedAlerts = state.alerts.filter((alert) => alert._id !== action.payload);
        
        // Update dynamicPagination if needed
        const currentPagination = state.dynamicPagination?.['alerts'];
        let updatedDynamicPagination = state.dynamicPagination;
        
        if (currentPagination && currentPagination.totalCount !== undefined) {
          const newCount = currentPagination.totalCount - 1;
          const pageSize = currentPagination.page && state.pagination?.totalCount && state.pagination.pages 
            ? Math.ceil(state.pagination.totalCount / state.pagination.pages) 
            : 10;
          const newPages = Math.ceil(newCount / pageSize);
          
          updatedDynamicPagination = {
            ...state.dynamicPagination,
            alerts: {
              ...currentPagination,
              totalCount: newCount,
              pages: Math.max(1, newPages),
              hasMore: newCount > updatedAlerts.length,
            },
          };
        }
        
        ctx.patchState({
          alerts: updatedAlerts,
          dynamicPagination: updatedDynamicPagination,
          pagination: {
            ...state.pagination,
            totalCount: state.pagination.totalCount ? state.pagination.totalCount - 1 : 0,
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
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(SelectAlert)
  selectAlert(ctx: StateContext<AlertStateModel>, action: SelectAlert) {
    ctx.patchState({ selectedAlert: action.payload });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<AlertStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<AlertStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(FilterAlertsByType)
  filterAlertsByType(
    ctx: StateContext<AlertStateModel>,
    action: FilterAlertsByType,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        type: action.payload,
      },
    });
  }

  @Action(FilterAlertsBySeverity)
  filterAlertsBySeverity(
    ctx: StateContext<AlertStateModel>,
    action: FilterAlertsBySeverity,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        severity: action.payload,
      },
    });
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<AlertStateModel>) {
    ctx.setState(defaults);
  }

  // ============ SELECTORS ============

  @Selector()
  static alerts(state: AlertStateModel): Alert[] {
    return state.alerts;
  }

  @Selector()
  static pagination(state: AlertStateModel): any {
    return state.pagination;
  }

  @Selector()
  static dynamicPagination(state: AlertStateModel): any {
    return state.dynamicPagination;
  }

  @Selector()
  static selectedAlert(state: AlertStateModel): Alert | null {
    return state.selectedAlert;
  }

  @Selector()
  static isLoading(state: AlertStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AlertStateModel): string | null {
    return state.error;
  }

  @Selector()
  static filterCriteria(state: AlertStateModel): any {
    return state.filterCriteria;
  }

  @Selector()
  static unreadCount(state: AlertStateModel): any {
    return state.unreadCount;
  }
}
