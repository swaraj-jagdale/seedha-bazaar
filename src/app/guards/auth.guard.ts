import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.loading()) {
    if (authService.isLoggedIn() && authService.isMerchant()) {
      return true;
    }
    router.navigate(['/merchant/login']);
    return false;
  }

  // Wait for loading to finish, then check auth state and role
  return toObservable(authService.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (authService.isLoggedIn() && authService.isMerchant()) {
        return true;
      }
      router.navigate(['/merchant/login']);
      return false;
    })
  );
};
