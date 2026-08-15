import { createSelector, Selector } from "@ngxs/store";
import { ItemState } from "./item.state";
import { Item, ItemStateModel } from "./item.model";

export class ItemSelectors {
  @Selector([ItemState])
  static allItems(state: ItemStateModel): Item[] {
    return state.items;
  }

  @Selector([ItemState])
  static pagination(state: ItemStateModel) {
    return state.pagination;
  }

  @Selector([ItemState])
  static currentPage(state: ItemStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([ItemState])
  static totalPages(state: ItemStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([ItemState])
  static totalCount(state: ItemStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([ItemState])
  static hasMore(state: ItemStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([ItemState])
  static itemsInStock(state: ItemStateModel): Item[] {
    return state.items.filter((item) => item.stockQuantity > 0);
  }

  @Selector([ItemState])
  static itemsByCategory(state: ItemStateModel) {
    return (categoryId: string): Item[] => {
      return state.items.filter((item) => item.category._id === categoryId);
    };
  }

  @Selector([ItemState])
  static lowStockItems(state: ItemStateModel): Item[] {
    return state.lowStockItems;
  }

  @Selector([ItemState])
  static expiringItems(state: ItemStateModel): Item[] {
    return state.expiringItems;
  }

  @Selector([ItemState])
  static selectedItem(state: ItemStateModel): Item | null {
    return state.selectedItem;
  }

  @Selector([ItemState])
  static isLoading(state: ItemStateModel): boolean {
    return state.loading;
  }

  @Selector([ItemState])
  static error(state: ItemStateModel): string | null {
    return state.error;
  }

  static paginationWithParams = (paginationType: string) => {
    return createSelector(
      [ItemState],
      (state: ItemStateModel) => {
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
