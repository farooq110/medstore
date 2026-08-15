import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { selectAuthUser, selectUserRole } from "../store/auth-store";
import { LocalStorageService } from "../services/local-storage/local-storage.service";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

/**
 * Functional Auth Guard
 * Protects routes that require authentication
 * Supports role-based route protection
 */
export const unAuthGuard: CanActivateFn = async (_route, _state) => {
  const ls = inject(LocalStorageService);
  const router = inject(Router);
  const store = inject(Store);

  // Get current user from local storage (access token)
  const isAuthenticated = await ls.getItem('access_token');

  // If user is authenticated, redirect them to their role-based dashboard
  if (isAuthenticated) {
    // Try to read role from store snapshot first
    const userRole = store.selectSnapshot(selectUserRole);
    if (userRole === 'owner') {
      await router.navigate(['/owner/dashboard']);
    } else if (userRole === 'sales_person' || userRole === 'sales') {
      // some projects use 'sales_person' for role name; fall back to sales route
      await router.navigate(['/sales/dashboard']);
    } else {
      // fallback route when role is unknown
      await router.navigate(['/login']);
    }

    return false;
  }

  // Allow access to public routes
  // if (publicRoutes.includes(_state.url)) {
  //   // If already authenticated, redirect to home instead of login page
  //   if (isAuthenticated) {
  //     router.navigate(["/home"]);
  //     return false;
  //   }
  //   return true;
  // }

  // Check if user is authenticated
  // if (!isAuthenticated) {
  //   router.navigate(["/login"]);
  //   return false;
  // }

  // // Check role-based access
  // const requiredRoles = _route.data["roles"];
  // if (requiredRoles && requiredRoles.length) {
  //   const userRole = store.selectSnapshot(selectUserRole);
  //   if (!requiredRoles.includes(userRole)) {
  //     router.navigate(["/login"]);
  //     return false;
  //   }
  // }

  return true;
};
