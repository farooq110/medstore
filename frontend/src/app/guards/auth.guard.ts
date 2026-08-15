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
export const authGuard: CanActivateFn = async (_route, _state) => {
  const ls = inject(LocalStorageService);
  const router = inject(Router);

  // Get current user from local storage
  const isAuthenticated = await ls.getItem('access_token');

  if(!isAuthenticated){
    router.navigate(["/login"]);
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
