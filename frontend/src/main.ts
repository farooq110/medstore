import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
// import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideStore } from "@ngxs/store";
import { AuthState } from "./app/store/auth-store/auth.state";
import { ClientState } from "./app/store/client-store/client.state";
import { ItemState } from "./app/store/item-store/item.state";
import { CategoryState } from "./app/store/category-store/category.state";
import { OrderState } from "./app/store/order-store/order.state";
import { UserState } from "./app/store/user-store/user.state";
import { AlertState } from "./app/store/alert-store/alert.state";
import { ReportsState } from "./app/store/report-store/report.state";
import { DashboardState } from "./app/store/dashboard-store/dashboard.state";
import { ConfigState } from "./app/store/config-store/config.state";
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './app/interceptors/error.interceptor';
import { httpTokenInterceptor } from './app/interceptors/http.interceptor';
import { Drivers } from '@ionic/storage';
import { Storage } from '@ionic/storage-angular';
import { environment } from './environments/environment';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
const states: any = [
  AuthState,
  ClientState,
  ItemState,
  CategoryState,
  OrderState,
  UserState,
  AlertState,
  ReportsState,
  DashboardState,
  ConfigState,
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Use Material Design mode for a more modern look
    }),
    // provideAnimations(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([httpTokenInterceptor, httpErrorInterceptor])
    ),
    {
      provide: Storage,
      useFactory: () =>
        new Storage({
          driverOrder: [Drivers.LocalStorage, Drivers.IndexedDB],
        }),
    },
    provideStore(
      states,
      withNgxsReduxDevtoolsPlugin(
        { disabled: environment.production }
      )
    )
  ],
});
