import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { BlockDialogService } from '../../../core/services/block-dialog-service';

@Component({
  standalone: true,
  selector: 'app-block-reason-modal',
  imports: [FormsModule],
  templateUrl: './block-reason-modal.html',
  styleUrls: ['./block-reason-modal.css'],
})
export class BlockReasonModal {
  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;

  reason = '';
  mode: 'create' | 'edit' = 'create';
  private onHidden = new Subject<string | null>();

  constructor(){
    inject(BlockDialogService).register(this);
  }

  OpenDialog(mode: 'create' | 'edit', initialReason?: string): Promise<string | null> {
    this.mode = mode;
    this.reason = initialReason || '';
    
    // Ensure the dialog reference exists
    if (!this.modalRef || !this.modalRef.nativeElement) {
      return Promise.reject('Modal reference not found');
    }

    const dialog = this.modalRef.nativeElement as HTMLDialogElement;
    dialog.showModal();

    return new Promise(resolve => {
      const subscription = this.onHidden.subscribe((result: string | null) => {
        subscription.unsubscribe();
        resolve(result);
      });
    });
  }

  confirm() {
    if (!this.reason.trim()) {
      return; // Don't proceed if reason is empty
    }
    this.onHidden.next(this.reason);
    this.closeDialog();
  }

  cancel() {
    this.onHidden.next(null);
    this.closeDialog();
  }

  private closeDialog() {
    if (this.modalRef && this.modalRef.nativeElement) {
      const dialog = this.modalRef.nativeElement as HTMLDialogElement;
      dialog.close();
    }
  }
}
