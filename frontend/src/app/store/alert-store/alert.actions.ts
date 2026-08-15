import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { Alert } from './alert.model';

export class LoadAlerts {
  static readonly type = '[Alert] Load Alerts';
  constructor(public payload: PaginationParams, public filter?: FilterParams, public options?: ActionOptions) {}
}

export class LoadAlertById {
  static readonly type = '[Alert] Load Alert By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class CreateAlert {
  static readonly type = '[Alert] Create Alert';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class MarkAlertAsSeen {
  static readonly type = '[Alert] Mark Alert As Seen';
  constructor(public payload: string, public options?: ActionOptions) {} // alert ID
}

export class MarkAlertAsResolved {
  static readonly type = '[Alert] Mark Alert As Resolved';
  constructor(public payload: string, public options?: ActionOptions) {} // alert ID
}

export class DeleteAlert {
  static readonly type = '[Alert] Delete Alert';
  constructor(public payload: string, public options?: ActionOptions) {} // alert ID
}

export class SelectAlert {
  static readonly type = '[Alert] Select Alert';
  constructor(public payload: Alert | null) {}
}

export class SetLoading {
  static readonly type = '[Alert] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Alert] Set Error';
  constructor(public payload: string | null) {}
}

export class FilterAlertsByType {
  static readonly type = '[Alert] Filter Alerts By Type';
  constructor(
    public payload: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'backorder_pending'
  ) {}
}

export class FilterAlertsBySeverity {
  static readonly type = '[Alert] Filter Alerts By Severity';
  constructor(public payload: 'warning' | 'urgent') {}
}
