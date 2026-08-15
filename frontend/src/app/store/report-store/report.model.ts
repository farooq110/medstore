export interface ReportsStateModel {
	data: any | null;
	loading: boolean;
	error: string | null;
	filteredSalesData: any | null;
	filteredSalesLoading: boolean;
}

export interface ApiReportsResponse {
	overview?: any;
	sales?: any[];
	collection?: any;
	stock?: any;
	expiry?: any;
	debt?: any;
}
