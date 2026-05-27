import { Injectable } from '@angular/core';
import { BlockReasonModal } from '../../features/members/block-reason-modal/block-reason-modal';

@Injectable({
  providedIn: 'root',
})
export class BlockDialogService {
  private dialogComponent?: BlockReasonModal;

  register(component: BlockReasonModal){
    this.dialogComponent = component;
  }


  open(mode: 'create' | 'edit', initialReason?: string): Promise<string | null> {
    if (!this.dialogComponent){
      throw new Error('Block reason modal comp is not registered');
  }
  return this.dialogComponent.OpenDialog(mode, initialReason);
}

}
