import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Item, ItemStateModel } from './item.model';
import { ItemService } from './item.service';
import {
  LoadItems,
  LoadItemById,
  LoadLowStockItems,
  LoadExpiringItems,
  CreateItem,
  UpdateItem,
  DeleteItem,
  SelectItem,
  DecreaseStockBulk,
  SetLoading,
  SetError,
} from './item.actions';
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: ItemStateModel = {
  items: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  dynamicPagination: null,
  selectedItem: null,
  lowStockItems: [],
  expiringItems: [],
  outOfStockItems: [],
  loading: false,
  error: null,
};

@State<ItemStateModel>({
  name: 'items',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class ItemState {
  constructor(
    private itemService: ItemService,
    private coreService: CoreService
  ) {}

  // ============ ACTIONS ============
  @Action(LoadItems)
  async loadItems(ctx: StateContext<ItemStateModel>, action: LoadItems) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    const oldPagination = ctx.getState().dynamicPagination ?? {};
    const state = action.payload.page === 1 ? [] : ctx.getState().items;
    return this.itemService.getAllItems(action.payload, action.filter).pipe(
      tap((res) => {
        const items = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: items.length,
          hasMore: false,
          pages: 1,
        };
        ctx.patchState({
          items: [...state, ...items],
          dynamicPagination: {
            ...oldPagination,
            ['items']: pagination,
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

  @Action(LoadItemById)
  async loadItemById(ctx: StateContext<ItemStateModel>, action: LoadItemById) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService.getItemById(action.payload).pipe(
      tap((res) => {
        const item = res.data;
        ctx.patchState({
          selectedItem: item,
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

  @Action(LoadLowStockItems)
  async loadLowStockItems(ctx: StateContext<ItemStateModel>, action: LoadLowStockItems) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService.getLowStockItems().pipe(
      tap((res) => {
        const items = res.data;
        ctx.patchState({
          lowStockItems: items as any,
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

  @Action(LoadExpiringItems)
  async loadExpiringItems(ctx: StateContext<ItemStateModel>, action: LoadExpiringItems) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService.getExpiringItems().pipe(
      tap((res) => {
        const items = res.data;
        ctx.patchState({
          expiringItems: items,
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

  @Action(CreateItem)
  async createItem(ctx: StateContext<ItemStateModel>, action: CreateItem) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService.createItem(action.payload).pipe(
      tap((res) => {
        const newItem = res.data;
        const state = ctx.getState();
        ctx.patchState({
          items: [...state.items, newItem],
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(successMessage || 'Item created successfully');
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
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

  @Action(UpdateItem)
  async updateItem(ctx: StateContext<ItemStateModel>, action: UpdateItem) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService
      .updateItem(action.payload.id, action.payload.data)
      .pipe(
        tap((res) => {
          const updatedItem = res.data;
          const state = ctx.getState();
          const updatedItems = state.items.map((item) =>
            item._id === action.payload.id ? updatedItem : item,
          );
          ctx.patchState({
            items: updatedItems,
            selectedItem:
              state.selectedItem?._id === action.payload.id
                ? updatedItem
                : state.selectedItem,
            loading: false,
            error: null,
          });

          if (showToast) {
            this.coreService.showSuccessToast(successMessage || 'Item updated successfully');
          }
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message,
          });

          if (showToast) {
            this.coreService.showErrorToast(errorMessage || error.message);
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

  @Action(DeleteItem)
  async deleteItem(ctx: StateContext<ItemStateModel>, action: DeleteItem) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.itemService.deleteItem(action.payload).pipe(
      tap((res) => {
        const state = ctx.getState();
        const filteredItems = state.items.filter(
          (item) => item._id !== action.payload,
        );
        ctx.patchState({
          items: filteredItems,
          selectedItem:
            state.selectedItem?._id === action.payload
              ? null
              : state.selectedItem,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(successMessage || 'Item deleted successfully');
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
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

  @Action(DecreaseStockBulk)
  decreaseStockBulk(
    ctx: StateContext<ItemStateModel>,
    action: DecreaseStockBulk,
  ) {
    const updates = action.payload;
    const state = ctx.getState();

    // Basic validation
    if (!Array.isArray(updates) || updates.length === 0) {
      ctx.patchState({
        error: 'DecreaseStockBulk: payload must be a non-empty array',
      });
      return;
    }

    for (const u of updates) {
      if (!u || typeof u.itemId !== 'string' || !u.itemId.trim()) {
        ctx.patchState({
          error: `DecreaseStockBulk: invalid itemId in payload: ${JSON.stringify(u)}`,
        });
        return;
      }
      if (typeof u.quantity !== 'number' || u.quantity <= 0) {
        ctx.patchState({
          error: `DecreaseStockBulk: invalid quantity for item ${u.itemId}`,
        });
        return;
      }
    }

    // Ensure all itemIds exist in local state
    const missing = updates.filter(
      (u) => !state.items.some((it) => it._id === u.itemId),
    );
    if (missing.length) {
      ctx.patchState({
        error: `DecreaseStockBulk: items not found: ${missing.map((m) => m.itemId).join(',')}`,
      });
      return;
    }

    const updatedItems = state.items.map((item) => {
      const u = updates.find((x) => x.itemId === item._id);
      if (!u) return item;
      const current = item.stockQuantity || 0;
      const next = Math.max(0, current - (u.quantity || 0));
      return { ...item, stockQuantity: next } as Item;
    });

    // Update selectedItem if it's included in updates
    let selected = state.selectedItem;
    if (selected) {
      const u = updates.find((x) => x.itemId === selected!._id);
      if (u) {
        selected = {
          ...selected,
          stockQuantity: Math.max(
            0,
            (selected.stockQuantity || 0) - (u.quantity || 0),
          ),
        } as Item;
      }
    }

    ctx.patchState({
      items: updatedItems,
      selectedItem: selected,
      error: null,
    });
  }

  @Action(SelectItem)
  selectItem(ctx: StateContext<ItemStateModel>, action: SelectItem) {
    ctx.patchState({ selectedItem: action.payload });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<ItemStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<ItemStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<ItemStateModel>) {
    ctx.setState(defaults);
  }
}
