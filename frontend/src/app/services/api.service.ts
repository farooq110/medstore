import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = "http://localhost:5000/api";
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  private loadToken() {
    const token = localStorage.getItem("token");
    this.tokenSubject.next(token);
  }

  setToken(token: string) {
    localStorage.setItem("token", token);
    this.tokenSubject.next(token);
  }

  clearToken() {
    localStorage.removeItem("token");
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // ============ AUTH ENDPOINTS ============
  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response.data?.token) {
            this.setToken(response.data.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`).pipe(catchError(this.handleError));
  }

  // ============ USER ENDPOINTS ============
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`).pipe(catchError(this.handleError));
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData).pipe(catchError(this.handleError));
  }

  // ============ CLIENT ENDPOINTS ============
  getClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`).pipe(catchError(this.handleError));
  }

  createClient(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients`, clientData).pipe(catchError(this.handleError));
  }

  getClientById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${id}`).pipe(catchError(this.handleError));
  }

  getClientDues(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${id}/dues`).pipe(catchError(this.handleError));
  }

  // ============ ITEM ENDPOINTS ============
  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`).pipe(catchError(this.handleError));
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData).pipe(catchError(this.handleError));
  }

  getLowStockItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/low-stock`).pipe(catchError(this.handleError));
  }

  getExpiringItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/expiring-soon`).pipe(catchError(this.handleError));
  }

  // ============ ORDER ENDPOINTS ============
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData).pipe(catchError(this.handleError));
  }

  getOrders(filters?: any): Observable<any> {
    let queryString = "";
    if (filters) {
      queryString = new URLSearchParams(filters).toString();
    }
    const url = queryString ? `${this.apiUrl}/orders?${queryString}` : `${this.apiUrl}/orders`;
    return this.http.get(url).pipe(catchError(this.handleError));
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`).pipe(catchError(this.handleError));
  }

  assignAgent(orderId: string, agentId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/assign`, { agentId })
      .pipe(catchError(this.handleError));
  }

  // ============ NEW: Order Assignment API ============
  assignOrder(orderId: string, salesPersonId: string, assignFor: "delivery" | "payment_collection"): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/assign`, { salesPersonId, assignFor })
      .pipe(catchError(this.handleError));
  }

  markDelivered(orderId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/mark-delivered`, {})
      .pipe(catchError(this.handleError));
  }

  markDueCollected(orderId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/mark-due-collected`, {})
      .pipe(catchError(this.handleError));
  }

  markItemsProvided(orderId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/items-provided`, {})
      .pipe(catchError(this.handleError));
  }

  recordPayment(orderId: string, amount: number, method: string, notes?: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/orders/${orderId}/payment`, { amount, method, notes })
      .pipe(catchError(this.handleError));
  }

  // ============ ALERT ENDPOINTS ============
  getAlerts(resolved?: boolean): Observable<any> {
    const params = resolved !== undefined ? `?resolved=${resolved}` : "";
    return this.http.get(`${this.apiUrl}/alerts${params}`).pipe(catchError(this.handleError));
  }

  markAlertSeen(alertId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/alerts/${alertId}/seen`, {}).pipe(catchError(this.handleError));
  }

  // ============ REPORT ENDPOINTS ============
  getOutstandingDuesReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/outstanding-dues`).pipe(catchError(this.handleError));
  }

  getCollectionReport(filters?: any): Observable<any> {
    let queryString = "";
    if (filters) {
      queryString = new URLSearchParams(filters).toString();
    }
    const url = queryString ? `${this.apiUrl}/reports/collection?${queryString}` : `${this.apiUrl}/reports/collection`;
    return this.http.get(url).pipe(catchError(this.handleError));
  }

  getSalesPersonReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/sales-person`).pipe(catchError(this.handleError));
  }

  getSalesReportFiltered(year?: number, month?: number): Observable<any> {
    let queryString = "";
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());
    queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/reports/sales?${queryString}` : `${this.apiUrl}/reports/sales`;
    return this.http.get(url).pipe(catchError(this.handleError));
  }

  getExpiryReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/expiry`).pipe(catchError(this.handleError));
  }

  getStockReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/stock`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error("API Error:", error);
    return throwError(() => new Error(error.error?.message || "An error occurred"));
  }
}
