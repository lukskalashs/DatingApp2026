import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  BusyRequestCount = signal(0);

  busy() {
    this.BusyRequestCount.update(current => current + 1);

  }

  idle() {
    this.BusyRequestCount.update(current => Math.max(0, current - 1))
  }
  
}
