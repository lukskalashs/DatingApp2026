import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastSevice } from '../services/toast-sevice';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toast = inject(ToastSevice);

  if(accountService.currentUser()) return true;
  else {
    toast.error('You shall not pass');
    return false;
  }
};
