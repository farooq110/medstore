import { createSelector, Selector } from "@ngxs/store";
import { UserState } from "./user.state";
import { User, UserStateModel } from "./user.model";

export class UserSelectors {
  @Selector([UserState])
  static allUsers(state: UserStateModel): User[] {
    return state.users;
  }

  @Selector([UserState])
  static pagination(state: UserStateModel) {
    return state.pagination;
  }

  @Selector([UserState])
  static currentPage(state: UserStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([UserState])
  static totalPages(state: UserStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([UserState])
  static totalCount(state: UserStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([UserState])
  static hasMore(state: UserStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([UserState])
  static clientOptions(state: UserStateModel) {
    return state.clientOptions;
  }

  @Selector([UserState])
  static salesPersons(state: UserStateModel): User[] {
    return state.users.filter(
      (user) => user.role === "sales_person" && user.isActive,
    );
  }

  @Selector([UserState])
  static owners(state: UserStateModel): User[] {
    return state.users.filter((user) => user.role === "owner" && user.isActive);
  }

  @Selector([UserState])
  static activeUsers(state: UserStateModel): User[] {
    return state.users.filter((user) => user.isActive);
  }

  @Selector([UserState])
  static currentUser(state: UserStateModel): User | null {
    return state.currentUser;
  }

  @Selector([UserState])
  static selectedUser(state: UserStateModel): User | null {
    return state.selectedUser;
  }

  @Selector([UserState])
  static isLoading(state: UserStateModel): boolean {
    return state.loading;
  }

  @Selector([UserState])
  static error(state: UserStateModel): string | null {
    return state.error;
  }

  @Selector()
  static getUsersByRole(state: UserStateModel) {
    return (role: "owner" | "sales_person"): User[] => {
      return state.users.filter((user) => user.role === role);
    };
  }

  static paginationWithParams = (paginationType: string) => {
    return createSelector(
      [UserState],
      (state: UserStateModel) => {
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
