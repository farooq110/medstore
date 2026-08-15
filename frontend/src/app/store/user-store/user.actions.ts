import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { User } from './user.model';

export class LoadUsers {
  static readonly type = '[User] Load Users';
  constructor(public payload: PaginationParams, public filter?: FilterParams, public options?: ActionOptions) {}
}

export class LoadUserById {
  static readonly type = '[User] Load User By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class CreateUser {
  static readonly type = '[User] Create User';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class UpdateUser {
  static readonly type = '[User] Update User';
  constructor(public payload: { id: string; data: any }, public options?: ActionOptions) {}
}

export class DeleteUser {
  static readonly type = '[User] Delete User';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class SelectUser {
  static readonly type = '[User] Select User';
  constructor(public payload: User | null) {}
}

export class SetLoading {
  static readonly type = '[User] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[User] Set Error';
  constructor(public payload: string | null) {}
}

export class FilterUsersByRole {
  static readonly type = '[User] Filter Users By Role';
  constructor(public payload: 'owner' | 'sales_person') {}
}

export class AssignClients {
  static readonly type = '[User] Assign Clients';
  constructor(public payload: { salesPersonId: string; clientIds: string[] }, public options?: ActionOptions) {}
}

export class ReassignClient {
  static readonly type = '[User] Reassign Client';
  constructor(public payload: { clientId: string; newSalesPersonId: string }, public options?: ActionOptions) {}
}

export class RemoveClient {
  static readonly type = '[User] Remove Client';
  constructor(public payload: string, public options?: ActionOptions) {} // clientId
}

export class LoadUsersWithOrders {
  static readonly type = '[User] Load Users With Orders';
  constructor(public options?: ActionOptions) {}
}

export class LoadClientOptions {
  static readonly type = '[User] Load Client Options';
  constructor(public payload?: string, public options?: ActionOptions) {} // filter: 'all' | 'true' | 'false' | 'assigned' | 'unassigned'
}
