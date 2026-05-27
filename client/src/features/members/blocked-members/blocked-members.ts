import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ToastSevice } from '../../../core/services/toast-sevice';
import { BlockDialogService } from '../../../core/services/block-dialog-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blocked-members',
  imports: [DatePipe],
  templateUrl: './blocked-members.html',
  styleUrl: './blocked-members.css',
})
export class BlockedMembers implements OnInit {

  private memberService = inject(MemberService);
  private toast = inject(ToastSevice);
  private blockDialogService = inject(BlockDialogService);
 

  blockedMembers = signal<any[]>([]);

  ngOnInit(): void {
    this.loadBlockedMembers();
  }

  loadBlockedMembers() {
    this.memberService.getBlockedMembers().subscribe({
      next: members => this.blockedMembers.set(members)
    });
  }

  unblockMember(targetId: string) {
    this.memberService.unblockMember(targetId).subscribe({
      next: () => {
        // Remove from the signal array instantly
        this.blockedMembers.update(members => members.filter(m => m.id !== targetId));
        this.toast.success('Member unblocked successfully');
      }
    });
  }

   // This method is called when the user clicks "Edit Reason" for a blocked member
  async editReason(member: any) {

    const newReason = await this.blockDialogService.open('edit', member.reason);

    if (newReason && newReason !== member.reason){
      this.memberService.updateBlockReason(member.id, newReason).subscribe({
        next: () => {
          // Update  UI refreshes
          this.blockedMembers.update((members: any[]) => members.map(m => 
            m.id === member.id ? { ...m, reason: newReason } : m
          ));
          this.toast.success('Reason updated');
        }
      });
    }
  }
  
}

