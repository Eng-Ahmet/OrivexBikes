import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (stateService.activeRole() === 'ADMIN') {
    return true;
  }

  // Not Admin -> redirect to fleet
  stateService.showToast('Access Restricted', 'Admin authorization required for this section', 'warning');
  router.navigate(['/fleet']);
  return false;
};
