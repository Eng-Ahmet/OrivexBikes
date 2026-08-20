import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (stateService.token() || localStorage.getItem('qqbikes_token')) {
    return true;
  }

  // Not authenticated -> redirect to login page
  router.navigate(['/login']);
  return false;
};
