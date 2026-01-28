import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  console.log('AdminGuard (Mock): Access granted');
  return true;
};