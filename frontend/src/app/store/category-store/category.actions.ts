import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { Category } from './category.model';

// Load Actions
export class LoadCategories {
  static readonly type = '[Category] Load Categories';
  constructor(public payload: PaginationParams, public filter?: FilterParams, public options?: ActionOptions) {}
}

export class LoadCategoryById {
  static readonly type = '[Category] Load Category By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

// Create & Update Actions
export class CreateCategory {
  static readonly type = '[Category] Create Category';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class UpdateCategory {
  static readonly type = '[Category] Update Category';
  constructor(public payload: { id: string; data: any }, public options?: ActionOptions) {}
}

export class DeleteCategory {
  static readonly type = '[Category] Delete Category';
  constructor(public payload: string, public options?: ActionOptions) {} // categoryId
}

// Selection & Filter Actions
export class SelectCategory {
  static readonly type = '[Category] Select Category';
  constructor(public payload: Category | null) {}
}

export class FilterCategoriesByActive {
  static readonly type = '[Category] Filter Categories By Active';
  constructor(public payload: boolean) {}
}

export class FilterCategoriesBySearchTerm {
  static readonly type = '[Category] Filter Categories By Search Term';
  constructor(public payload: string) {}
}

// State Management Actions
export class SetLoading {
  static readonly type = '[Category] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Category] Set Error';
  constructor(public payload: string | null) {}
}
