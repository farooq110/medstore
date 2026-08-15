import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { Client } from './client.model';

// Load Actions
export class LoadClients {
  static readonly type = '[Client] Load Clients';
  constructor(public payload: PaginationParams, public filter?: FilterParams, public options?: ActionOptions) {}
}

export class LoadClientById {
  static readonly type = '[Client] Load Client By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class LoadClientDues {
  static readonly type = '[Client] Load Client Dues';
  constructor(public payload: string, public options?: ActionOptions) {} // clientId
}

export class LoadClientDetail {
  static readonly type = '[Client] Load Client Detail';
  constructor(public payload: string, public options?: ActionOptions) {} // clientId
}

// Create & Update Actions
export class CreateClient {
  static readonly type = '[Client] Create Client';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class UpdateClient {
  static readonly type = '[Client] Update Client';
  constructor(public payload: { id: string; data: any }, public options?: ActionOptions) {}
}

export class DeleteClient {
  static readonly type = '[Client] Delete Client';
  constructor(public payload: string, public options?: ActionOptions) {} // clientId
}

// Selection & Filter Actions
export class SelectClient {
  static readonly type = '[Client] Select Client';
  constructor(public payload: Client | null) {}
}

export class FilterClientsByActive {
  static readonly type = '[Client] Filter Clients By Active';
  constructor(public payload: boolean) {}
}

export class FilterClientsBySearchTerm {
  static readonly type = '[Client] Filter Clients By Search Term';
  constructor(public payload: string) {}
}

// State Management Actions
export class SetLoading {
  static readonly type = '[Client] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Client] Set Error';
  constructor(public payload: string | null) {}
}

export class ResetClients {
  static readonly type = '[Client] Reset Clients';
  // Resets only clients list, pagination, and selectedClient - keeps selected details
}
