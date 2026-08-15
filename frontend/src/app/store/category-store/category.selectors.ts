import { createSelector, Selector } from '@ngxs/store';
import { CategoryState } from './category.state';
import { Category, CategoryStateModel } from './category.model';

export class CategorySelectors {
  @Selector([CategoryState])
  static allCategories(state: CategoryStateModel): Category[] {
    return state.categories;
  }

  @Selector([CategoryState])
  static pagination(state: CategoryStateModel) {
    return state.pagination;
  }

  @Selector([CategoryState])
  static currentPage(state: CategoryStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([CategoryState])
  static totalPages(state: CategoryStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([CategoryState])
  static totalCount(state: CategoryStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([CategoryState])
  static hasMore(state: CategoryStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([CategoryState])
  static activeCategories(state: CategoryStateModel): Category[] {
    return state.categories.filter((category) => category.isActive);
  }

  @Selector([CategoryState])
  static selectedCategory(state: CategoryStateModel): Category | null {
    return state.selectedCategory;
  }

  @Selector([CategoryState])
  static isLoading(state: CategoryStateModel): boolean {
    return state.loading;
  }

  @Selector([CategoryState])
  static error(state: CategoryStateModel): string | null {
    return state.error;
  }

  @Selector([CategoryState])
  static categoryCount(state: CategoryStateModel): number {
    return state.categories.length;
  }

  @Selector([CategoryState])
  static filteredCategories(state: CategoryStateModel): Category[] {
    let filtered = state.categories;

    if (state.filterCriteria.isActive !== undefined) {
      filtered = filtered.filter((cat) => cat.isActive === state.filterCriteria.isActive);
    }

    if (state.filterCriteria.searchTerm) {
      const term = state.filterCriteria.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(term) ||
          cat.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  static paginationWithParams = (pagenationType: string) => {
    return createSelector(
      [CategoryState], // or [ProductStateSelectors.pagination]
      (state: CategoryStateModel) => {
        console.log(pagenationType);
        // Apply your parameter logic here
        return (
          state.dynamicPagination?.[pagenationType] ?? {
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
