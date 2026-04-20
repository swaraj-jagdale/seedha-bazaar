import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const farmerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.loading()) {
    if (authService.isLoggedIn() && authService.isFarmer()) {
      return true;
    }
    router.navigate(['/farmer/login']);
    return false;
  }

  return toObservable(authService.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (authService.isLoggedIn() && authService.isFarmer()) {
        return true;
      }
      router.navigate(['/farmer/login']);
      return false;
    })
  );
};
