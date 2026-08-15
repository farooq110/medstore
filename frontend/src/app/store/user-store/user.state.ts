import { Injectable } from "@angular/core";
import { State, Action, StateContext, Selector } from "@ngxs/store";
import { UserService } from "./user.service";
import { User, UserStateModel } from "./user.model";
import {
  LoadUsers,
  LoadUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
  SelectUser,
  SetLoading,
  SetError,
  FilterUsersByRole,
  AssignClients,
  ReassignClient,
  RemoveClient,
  LoadUsersWithOrders,
  LoadClientOptions,
} from "./user.actions";
import { catchError, tap, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from "src/app/services/capacitor/core.service";
import { ActionOptions } from '../api-response';

const defaults: UserStateModel = {
  users: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  dynamicPagination: null,
  currentUser: null,
  selectedUser: null,
  clientOptions: [],
  loading: false,
  error: null,
  filterCriteria: {},
};

@State<UserStateModel>({
  name: "users",
  defaults,
})
@Injectable({
  providedIn: "root",
})
export class UserState {
  constructor(private userService: UserService, private coreService: CoreService) {}

  @Action(LoadUsers)
  async loadUsers(ctx: StateContext<UserStateModel>, action: LoadUsers) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    const oldPagination = ctx.getState().dynamicPagination ?? {};
    const state = action.payload.page === 1 ? [] : ctx.getState().users;
    ctx.patchState({ loading: true });
    return this.userService.getAllUsers(action.payload, action.filter).pipe(
      tap((res) => {
        const users = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: users.length,
          hasMore: false,
          pages: 1,
        };
        ctx.patchState({
          users: [...state, ...users],
          pagination,
          dynamicPagination: {
            ...oldPagination,
            ['users']: pagination,
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

  @Action(LoadUserById)
  loadUserById(ctx: StateContext<UserStateModel>, action: LoadUserById) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    return this.userService.getUserById(action.payload).pipe(
      tap((res) => {
        const user = res.data;
        ctx.patchState({
          selectedUser: user,
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

  @Action(CreateUser)
  createUser(ctx: StateContext<UserStateModel>, action: CreateUser) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService.createUser(action.payload).pipe(
      tap((res) => {
        const user = res.data;
        const state = ctx.getState();
        ctx.patchState({
          users: [...state.users, user],
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

  @Action(UpdateUser)
  updateUser(ctx: StateContext<UserStateModel>, action: UpdateUser) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService
      .updateUser(action.payload.id, action.payload.data)
      .pipe(
        tap((res) => {
          const updatedUser = res.data;
          const state = ctx.getState();
          ctx.patchState({
            users: state.users.map((user) =>
              user._id === updatedUser._id ? updatedUser : user,
            ),
            selectedUser:
              state.selectedUser?._id === updatedUser._id
                ? updatedUser
                : state.selectedUser,
            currentUser:
              state.currentUser?._id === updatedUser._id
                ? updatedUser
                : state.currentUser,
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

  @Action(DeleteUser)
  deleteUser(ctx: StateContext<UserStateModel>, action: DeleteUser) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService.deleteUser(action.payload).pipe(
      tap((res) => {
        const state = ctx.getState();
        ctx.patchState({
          users: state.users.filter((user) => user._id !== action.payload),
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

  @Action(SelectUser)
  selectUser(ctx: StateContext<UserStateModel>, action: SelectUser) {
    ctx.patchState({ selectedUser: action.payload });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<UserStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<UserStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(FilterUsersByRole)
  filterUsersByRole(
    ctx: StateContext<UserStateModel>,
    action: FilterUsersByRole,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        role: action.payload,
      },
    });
  }

  @Action(LoadUsersWithOrders)
  loadUsersWithOrders(ctx: StateContext<UserStateModel>, action: LoadUsersWithOrders) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService.getUsersWithOrders().pipe(
      tap((res) => {
        const users = res.data;
        ctx.patchState({
          users,
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

  @Action(AssignClients)
  assignClients(ctx: StateContext<UserStateModel>, action: AssignClients) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService
      .assignClientsToSalesPerson(action.payload.salesPersonId, action.payload.clientIds)
      .pipe(
        tap((res) => {
          const updatedUser = res.data;
          const state = ctx.getState();
          ctx.patchState({
            users: state.users.map((user) =>
              user._id === updatedUser._id ? updatedUser : user,
            ),
            selectedUser:
              state.selectedUser?._id === updatedUser._id
                ? updatedUser
                : state.selectedUser,
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

  @Action(ReassignClient)
  reassignClient(ctx: StateContext<UserStateModel>, action: ReassignClient) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService
      .reassignClient(action.payload.clientId, action.payload.newSalesPersonId)
      .pipe(
        tap((res) => {
          ctx.patchState({
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

  @Action(RemoveClient)
  removeClient(ctx: StateContext<UserStateModel>, action: RemoveClient) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    ctx.patchState({ loading: true });
    return this.userService
      .removeClient(action.payload)
      .pipe(
        tap((res) => {
          ctx.patchState({
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

  @Action(LoadClientOptions)
  loadClientOptions(ctx: StateContext<UserStateModel>, action: LoadClientOptions) {
    const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) {
      this.coreService.showLoading();
    }
    
    const isAssigned = action.payload || 'all';
    return this.userService.getClientOptions(isAssigned as any).pipe(
      tap((res) => {
        const clientOptions = res.data;
        ctx.patchState({
          clientOptions,
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

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<UserStateModel>) {
    ctx.setState(defaults);
  }
}
