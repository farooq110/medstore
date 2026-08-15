import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { Item } from './item.model';

export class LoadItems {
  static readonly type = '[Item] Load Items';
  constructor(
    public payload: PaginationParams,
    public filter?: FilterParams & {
      category?: string;
      lowStock?: boolean;
      expiringSoon?: boolean;
    },
    public options?: ActionOptions
  ) {}
}

export class LoadItemById {
  static readonly type = '[Item] Load Item By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class LoadLowStockItems {
  static readonly type = '[Item] Load Low Stock Items';
  constructor(public options?: ActionOptions) {}
}

export class LoadExpiringItems {
  static readonly type = '[Item] Load Expiring Items';
  constructor(public options?: ActionOptions) {}
}

export class LoadOutOfStockItems {
  static readonly type = '[Item] Load Out Of Stock Items';
  constructor(public options?: ActionOptions) {}
}

export class LoadItemsByCategory {
  static readonly type = '[Item] Load Items By Category';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class CreateItem {
  static readonly type = '[Item] Create Item';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class UpdateItem {
  static readonly type = '[Item] Update Item';
  constructor(public payload: { id: string; data: any }, public options?: ActionOptions) {}
}

export class DeleteItem {
  static readonly type = '[Item] Delete Item';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class SelectItem {
  static readonly type = '[Item] Select Item';
  constructor(public payload: Item | null) {}
}

export class SetLoading {
  static readonly type = '[Item] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Item] Set Error';
  constructor(public payload: string | null) {}
}

export class FilterItems {
  static readonly type = '[Item] Filter Items';
  constructor(
    public payload: {
      category?: string;
      searchTerm?: string;
      isLowStock?: boolean;
      isOutOfStock?: boolean;
      isExpired?: boolean;
      isExpiringSoon?: boolean;
    }
  ) {}
}

export class ClearItemFilter {
  static readonly type = '[Item] Clear Item Filter';
}

export class DecreaseStockBulk {
  static readonly type = '[Item] Decrease Stock Bulk';
  constructor(
    public payload: Array<{
      itemId: string;
      itemName?: string;
      quantity: number;
      sellingPrice?: number;
    }>,
  ) {}
}
