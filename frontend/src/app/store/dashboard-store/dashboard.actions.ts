import { ActionOptions } from '../api-response';

export class LoadDashboardSummary {
  static readonly type = '[Dashboard] Load Summary';
  constructor(public options?: ActionOptions) {}
}

export class LoadDashboardSummarySuccess {
  static readonly type = '[Dashboard] Load Summary Success';
  constructor(public payload: any) {}
}

export class LoadDashboardSummaryFailure {
  static readonly type = '[Dashboard] Load Summary Failure';
  constructor(public payload: any) {}
}
