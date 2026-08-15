import { createSelector, Selector } from '@ngxs/store';
import { ClientState } from './client.state';
import { Client, ClientStateModel } from './client.model';

export class ClientSelectors {
  @Selector([ClientState])
  static allClients(state: ClientStateModel): Client[] {
    return state.clients;
  }

  @Selector([ClientState])
  static pagination(state: ClientStateModel) {
    return state.pagination;
  }

  @Selector([ClientState])
  static currentPage(state: ClientStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([ClientState])
  static totalPages(state: ClientStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([ClientState])
  static totalCount(state: ClientStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([ClientState])
  static hasMore(state: ClientStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([ClientState])
  static activeClients(state: ClientStateModel): Client[] {
    return state.clients.filter((client) => client.isActive);
  }

  @Selector([ClientState])
  static clientsWithDue(state: ClientStateModel ): Client[] {
    return state.clients.filter((client) => client.totalDue > 0);
  }

  @Selector([ClientState])
  static highRiskClients(state: ClientStateModel): Client[] {
    return state.clients.filter((client) => client.totalDue > client.creditLimit);
  }

  @Selector([ClientState])
  static selectedClient(state: ClientStateModel): Client | null {
    return state.selectedClient;
  }

  @Selector([ClientState])
  static selectedClientDetails(state: ClientStateModel) {
    return state.selectedClientDetails;
  }

  @Selector([ClientState])
  static isLoading(state: ClientStateModel): boolean {
    return state.loading;
  }

  @Selector([ClientState])
  static error(state: ClientStateModel): string | null {
    return state.error;
  }

  @Selector([ClientState])
  static totalDue(state: ClientStateModel): number {
    return state.clients.reduce((total, client) => total + client.totalDue, 0);
  }

  @Selector([ClientState])
  static totalCreditLimit(state: ClientStateModel): number {
    return state.clients.reduce((total, client) => total + client.creditLimit, 0);
  }

  static paginationWithParams = (paginationType: string) => {
    return createSelector(
      [ClientState],
      (state: ClientStateModel) => {
        return (
          state.dynamicPagination?.[paginationType] ?? {
            page: 0,
            hasMore: false,
            pages: 0,
            totalCount: 0,
          }
        );
      }
    );
  };
}
