import { createSelector, Selector } from '@ngxs/store';
import { AlertState } from './alert.state';
import { Alert, AlertStateModel } from './alert.model';

export class AlertSelectors {
  @Selector([AlertState])
  static allAlerts(state: AlertStateModel): Alert[] {
    return state.alerts;
  }

  @Selector([AlertState])
  static pagination(state: AlertStateModel) {
    return state.pagination;
  }

  @Selector([AlertState])
  static currentPage(state: AlertStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([AlertState])
  static totalPages(state: AlertStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([AlertState])
  static totalCount(state: AlertStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([AlertState])
  static hasMore(state: AlertStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([AlertState])
  static unresolvedAlerts(state: AlertStateModel): Alert[] {
    return state.alerts.filter((alert) => !alert.resolved);
  }

  @Selector([AlertState])
  static urgentAlerts(state: AlertStateModel): Alert[] {
    return state.alerts.filter((alert) => alert.severity === 'urgent');
  }

  @Selector([AlertState])
  static lowStockAlerts(state: AlertStateModel): Alert[] {
    return state.alerts.filter((alert) =>
      ['low_stock', 'out_of_stock'].includes(alert.type)
    );
  }

  @Selector([AlertState])
  static expiringAlerts(state: AlertStateModel): Alert[] {
    return state.alerts.filter((alert) =>
      ['expiring_soon', 'expired'].includes(alert.type)
    );
  }

  @Selector([AlertState])
  static backorderAlerts(state: AlertStateModel): Alert[] {
    return state.alerts.filter((alert) => alert.type === 'backorder_pending');
  }

  @Selector([AlertState])
  static unreadCount(state: AlertStateModel) {
    return state.unreadCount;
  }

  @Selector([AlertState])
  static selectedAlert(state: AlertStateModel): Alert | null {
    return state.selectedAlert;
  }

  @Selector([AlertState])
  static isLoading(state: AlertStateModel): boolean {
    return state.loading;
  }

  @Selector([AlertState])
  static error(state: AlertStateModel): string | null {
    return state.error;
  }

  static paginationWithParams = (paginationType: string) => {
    return createSelector(
      [AlertState],
      (state: AlertStateModel) => {
        return state.dynamicPagination?.[paginationType] ?? {
          page: 0,
          hasMore: false,
          pages: 0,
          totalCount: 0,
        };
      }
    );
  };
}
