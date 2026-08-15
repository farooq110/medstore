import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { ReportsStateModel } from './report.model';
import { ReportService } from './report.service';
import { LoadReports, SetReports, SetReportsError, LoadFilteredSalesReport, SetFilteredSalesReport, SetFilteredSalesReportError } from './report.actions';
import { tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: ReportsStateModel = {
	data: null,
	loading: false,
	error: null,
	filteredSalesData: null,
	filteredSalesLoading: false,
};

@State<ReportsStateModel>({
	name: 'reports',
	defaults,
})
@Injectable({ providedIn: 'root' })
export class ReportsState {
	constructor(
		private reportService: ReportService,
		private coreService: CoreService
	) {}

	@Action(LoadReports)
	loadReports(ctx: StateContext<ReportsStateModel>, action: LoadReports) {
		const options: ActionOptions = action.options || { isLoading: false };
		const isLoading = options.isLoading ?? false;
		
		if (isLoading) {
			this.coreService.showLoading();
		}
		
		ctx.patchState({ loading: true, error: null });
		return this.reportService.getAllReports().pipe(
			tap((res) => {
				ctx.patchState({ data: res.data, loading: false, error: null });
			}),
			catchError((error) => {
				ctx.patchState({ loading: false, error: error.message });
				return of(null);
			}),
			finalize(async () => {
				if (isLoading) {
					await this.coreService.hideLoading();
				}
			})
		);
	}

	@Action(LoadFilteredSalesReport)
	loadFilteredSalesReport(ctx: StateContext<ReportsStateModel>, action: LoadFilteredSalesReport) {
		ctx.patchState({ filteredSalesLoading: true });
		return this.reportService.getFilteredSalesReport(action.year, action.month, action.selectAllMonths).pipe(
			tap((res) => {
				ctx.patchState({ filteredSalesData: res.data, filteredSalesLoading: false });
			}),
			catchError((error) => {
				ctx.patchState({ filteredSalesLoading: false });
				console.error('Error loading filtered sales report:', error);
				return of(null);
			})
		);
	}

	@Action(ResetAllStores)
	resetAllStores(ctx: StateContext<ReportsStateModel>) {
		ctx.setState(defaults);
	}
}
