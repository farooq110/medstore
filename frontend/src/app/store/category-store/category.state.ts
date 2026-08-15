import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Category, CategoryStateModel } from './category.model';
import { CategoryService } from './category.service';
import {
  LoadCategories,
  LoadCategoryById,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  SelectCategory,
  SetLoading,
  SetError,
  FilterCategoriesByActive,
  FilterCategoriesBySearchTerm,
} from './category.actions';
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: CategoryStateModel = {
  categories: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  selectedCategory: null,
  loading: false,
  error: null,
  filterCriteria: {},
  dynamicPagination: null,
};

@State<CategoryStateModel>({
  name: 'categories',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class CategoryState {
  constructor(
    private categoryService: CategoryService,
    private coreService: CoreService
  ) {}

  // ============ SELECTORS ============
  @Selector()
  static getCategories(state: CategoryStateModel): Category[] {
    return state.categories;
  }

  @Selector()
  static getSelectedCategory(state: CategoryStateModel): Category | null {
    return state.selectedCategory;
  }

  @Selector()
  static getLoading(state: CategoryStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: CategoryStateModel): string | null {
    return state.error;
  }

  @Selector()
  static getActiveCategories(state: CategoryStateModel): Category[] {
    return state.categories.filter((cat) => cat.isActive);
  }

  @Selector()
  static getCategoryCount(state: CategoryStateModel): number {
    return state.categories.length;
  }

  @Selector()
  static getFilteredCategories(state: CategoryStateModel): Category[] {
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

  // ============ ACTIONS ============
  @Action(LoadCategories)
  async loadCategories(ctx: StateContext<CategoryStateModel>, action: LoadCategories) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    const oldPagination = ctx.getState().dynamicPagination ?? {};
    const state = action.payload.page === 1 ? [] : ctx.getState().categories;
    return this.categoryService.getAllCategories(action.payload, action.filter).pipe(
      tap((res) => {
        const categories = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: categories.length,
          hasMore: false,
          pages: 1,
        };
        ctx.patchState({
          categories: [...state, ...categories],
          dynamicPagination: {
            ...oldPagination,
            ['categories']: pagination,
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

  @Action(LoadCategoryById)
  async loadCategoryById(ctx: StateContext<CategoryStateModel>, action: LoadCategoryById) {
    const { isLoading = false } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.categoryService.getCategoryById(action.payload).pipe(
      tap((res) => {
        const category = res.data;
        ctx.patchState({
          selectedCategory: category,
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

  @Action(CreateCategory)
  async createCategory(ctx: StateContext<CategoryStateModel>, action: CreateCategory) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.categoryService.createCategory(action.payload).pipe(
      tap((res) => {
        const newCategory = res.data;
        const state = ctx.getState();
        ctx.patchState({
          categories: [...state.categories, newCategory],
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(successMessage || 'Category created successfully');
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

  @Action(UpdateCategory)
  async updateCategory(ctx: StateContext<CategoryStateModel>, action: UpdateCategory) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    const { id, data } = action.payload;
    return this.categoryService.updateCategory(id, data).pipe(
      tap((res) => {
        const updatedCategory = res.data;
        const state = ctx.getState();
        const updatedCategories = state.categories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        );
        ctx.patchState({
          categories: updatedCategories,
          selectedCategory: updatedCategory,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(successMessage || 'Category updated successfully');
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

  @Action(DeleteCategory)
  async deleteCategory(ctx: StateContext<CategoryStateModel>, action: DeleteCategory) {
    const { isLoading = false, showToast = false, successMessage, errorMessage } = action.options || {};
    
    if (isLoading) await this.coreService.showLoading();
    
    ctx.patchState({ loading: true });
    return this.categoryService.deleteCategory(action.payload).pipe(
      tap(() => {
        const state = ctx.getState();
        const filteredCategories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
        ctx.patchState({
          categories: filteredCategories,
          selectedCategory: null,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(successMessage || 'Category deleted successfully');
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

  @Action(SelectCategory)
  selectCategory(ctx: StateContext<CategoryStateModel>, action: SelectCategory) {
    ctx.patchState({ selectedCategory: action.payload });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<CategoryStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<CategoryStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(FilterCategoriesByActive)
  filterCategoriesByActive(ctx: StateContext<CategoryStateModel>, action: FilterCategoriesByActive) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        isActive: action.payload,
      },
    });
  }

  @Action(FilterCategoriesBySearchTerm)
  filterCategoriesBySearchTerm(ctx: StateContext<CategoryStateModel>, action: FilterCategoriesBySearchTerm) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        searchTerm: action.payload,
      },
    });
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<CategoryStateModel>) {
    ctx.setState(defaults);
  }
}
