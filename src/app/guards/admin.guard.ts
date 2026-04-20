import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.loading()) {
    if (authService.isLoggedIn() && authService.isAdmin()) {
      return true;
    }
    router.navigate(['/admin/login']);
    return false;
  }

  return toObservable(authService.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (authService.isLoggedIn() && authService.isAdmin()) {
        return true;
      }
      router.navigate(['/admin/login']);
      return false;
    })
  );
};
