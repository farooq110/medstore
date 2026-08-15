import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { LoadDashboardSummary } from './dashboard.actions';
import { DashboardSummary, DashboardStateModel } from './dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: DashboardStateModel = {
  summary: null,
  loading: false,
  error: null,
};

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class DashboardState {
  private readonly dashboardService = inject(DashboardService);
  private readonly coreService = inject(CoreService);

  // ============ SELECTORS ============
  @Selector()
  static summary(state: DashboardStateModel): DashboardSummary | null {
    return state.summary;
  }

  @Selector()
  static isLoading(state: DashboardStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: DashboardStateModel): string | null {
    return state.error;
  }

  @Selector()
  static totalOrders(state: DashboardStateModel): number {
    return state.summary?.totalOrders ?? 0;
  }

  @Selector()
  static totalDue(state: DashboardStateModel): number {
    return state.summary?.totalDue ?? 0;
  }

  @Selector()
  static lowStockItems(state: DashboardStateModel): number {
    return state.summary?.lowStockItems ?? 0;
  }

  @Selector()
  static expiringItems(state: DashboardStateModel): number {
    return state.summary?.expiringItems ?? 0;
  }

  @Selector()
  static thisMonthOrderCount(state: DashboardStateModel): number {
    return state.summary?.thisMonthOrderCount ?? 0;
  }

  @Selector()
  static outstandingPendingCount(state: DashboardStateModel): number {
    return state.summary?.outstandingPendingCount ?? 0;
  }

  // ============ ACTIONS ============
  @Action(LoadDashboardSummary)
  loadDashboardSummary(ctx: StateContext<DashboardStateModel>, action: LoadDashboardSummary) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });

    return this.dashboardService.getDashboardSummary().pipe(
      tap((response: any) => {
        ctx.patchState({
          summary: response.data,
          loading: false,
          error: null,
        });
      }),
      catchError((error: any) => {
        ctx.patchState({
          loading: false,
          error: error?.message || 'Error loading dashboard summary',
        });
        return of(error);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      })
    );
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<DashboardStateModel>) {
    ctx.setState(defaults);
  }
}
