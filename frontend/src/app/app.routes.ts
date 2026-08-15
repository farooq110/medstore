import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { unAuthGuard } from './guards/unAuth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [unAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [unAuthGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [unAuthGuard],
  },
  {
    path: 'owner',
    canActivate: [authGuard],
    data: { roles: ['owner'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/owner-dashboard/owner-dashboard.component').then(
            (m) => m.OwnerDashboardComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users-management/users-management.component').then(
            (m) => m.UsersManagementComponent,
          ),
      },
      {
        path: 'sales-persons',
        loadComponent: () =>
          import('./pages/sales-persons/sales-persons.component').then(
            (m) => m.SalesPersonsComponent,
          ),
      },
      {
        path: 'sales-persons/new',
        loadComponent: () =>
          import('./pages/sales-person-form/sales-person-form.component').then(
            (m) => m.SalesPersonFormComponent,
          ),
      },
      {
        path: 'sales-persons/:id',
        loadComponent: () =>
          import('./pages/sales-person-detail/sales-person-detail.component').then(
            (m) => m.SalesPersonDetailComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
      {
        path: 'create-order',
        loadComponent: () =>
          import('./pages/create-order/create-order.component').then(
            (m) => m.CreateOrderComponent,
          ),
      },
      {
        path: 'pos',
        loadComponent: () =>
          import('./pages/pos/pos.component').then((m) => m.PosComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/order-list/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'assign-order/:id',
        loadComponent: () =>
          import('./pages/assign-agent/assign-agent.component').then(
            (m) => m.AssignAgentComponent,
          ),
      },
      {
        path: 'delivery-collection/:id',
        loadComponent: () =>
          import('./pages/delivery-collection/delivery-collection.component').then(
            (m) => m.DeliveryCollectionComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },
      {
        path: 'category-form',
        loadComponent: () =>
          import('./pages/category-form/category-form.component').then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./pages/items-list/items-list.component').then(
            (m) => m.ItemsListComponent,
          ),
      },
      {
        path: 'items/form',
        loadComponent: () =>
          import('./pages/item-form/item-form.component').then(
            (m) => m.ItemFormComponent,
          ),
      },
      {
        path: 'items/details/:id',
        loadComponent: () =>
          import('./pages/item-detail/item-detail.component').then(
            (m) => m.ItemDetailComponent,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.component').then(
            (m) => m.ClientsComponent,
          ),
      },
      {
        path: 'client-form',
        loadComponent: () =>
          import('./pages/client-form/client-form.component').then(
            (m) => m.ClientFormComponent,
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./pages/client-detail/client-detail.component').then(
            (m) => m.ClientDetailComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notification/notification-page.component').then(
            (m) => m.NotificationPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },
  {
    path: 'sales',
    canActivate: [authGuard],
    data: { roles: ['sales_person'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/sales-dashboard/sales-dashboard.component').then(
            (m) => m.SalesDashboardComponent,
          ),
      },
      {
        path: 'create-order',
        loadComponent: () =>
          import('./pages/create-order/create-order.component').then(
            (m) => m.CreateOrderComponent,
          ),
      },
      {
        path: 'pos',
        loadComponent: () =>
          import('./pages/pos/pos.component').then((m) => m.PosComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/order-list/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'delivery-collection/:id',
        loadComponent: () =>
          import('./pages/delivery-collection/delivery-collection.component').then(
            (m) => m.DeliveryCollectionComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notification/notification-page.component').then(
            (m) => m.NotificationPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
