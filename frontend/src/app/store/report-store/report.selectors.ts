import { createSelector } from '@ngxs/store';
import { ReportsStateModel } from './report.model';

export const selectReportsState = (state: any) => state.reports as ReportsStateModel;

export const selectReportsData = createSelector([selectReportsState], (s: ReportsStateModel) => s?.data);
export const selectReportsLoading = createSelector([selectReportsState], (s: ReportsStateModel) => s?.loading);
export const selectReportsError = createSelector([selectReportsState], (s: ReportsStateModel) => s?.error);
export const selectFilteredSalesData = createSelector([selectReportsState], (s: ReportsStateModel) => s?.filteredSalesData);
export const selectFilteredSalesLoading = createSelector([selectReportsState], (s: ReportsStateModel) => s?.filteredSalesLoading);
