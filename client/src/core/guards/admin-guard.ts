import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastSevice } from '../services/toast-sevice';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toast = inject(ToastSevice);

  if (accountService.currentUser()?.roles.includes('Admin') 
    || accountService.currentUser()?.roles.includes('Moderator')) {
      return true;
  } else {
    toast.error('Enter this area, you cannot');
    return false;
  }
};