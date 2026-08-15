import { ActionOptions } from '../api-response';

export class LoadReports {
	static readonly type = '[Reports] Load Reports';
	constructor(public payload?: { force?: boolean }, public options?: ActionOptions) {}
}

export class SetReports {
	static readonly type = '[Reports] Set Reports';
	constructor(public payload: any) {}
}

export class SetReportsError {
	static readonly type = '[Reports] Set Reports Error';
	constructor(public payload: string) {}
}

export class LoadFilteredSalesReport {
	static readonly type = '[Reports] Load Filtered Sales Report';
	constructor(public year: number, public month: number, public selectAllMonths: boolean = false) {}
}

export class SetFilteredSalesReport {
	static readonly type = '[Reports] Set Filtered Sales Report';
	constructor(public payload: any) {}
}

export class SetFilteredSalesReportError {
	static readonly type = '[Reports] Set Filtered Sales Report Error';
	constructor(public payload: string) {}
}
