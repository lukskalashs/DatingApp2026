import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { MemberService } from '../../../core/services/member-service';
import { PresenceService } from '../../../core/services/presence-service';
import { LikesService } from '../../../core/services/likes-service';
import { ToastSevice } from '../../../core/services/toast-sevice';
import { BlockReasonModal } from '../block-reason-modal/block-reason-modal';
import { BlockDialogService } from '../../../core/services/block-dialog-service';


@Component({
  selector: 'app-member-detailed',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css',
})
export class MemberDetailed implements OnInit{
  
  private blockDialogService = inject(BlockDialogService);
  private route = inject(ActivatedRoute);
  protected toast = inject(ToastSevice);
  protected memberService = inject(MemberService)
  protected accountService = inject(AccountService);
  private router = inject(Router);
  protected title = signal<string | undefined>('Profile');
  protected likesService = inject(LikesService);
  protected hasLiked = computed(() => this.likesService.likeIds().includes(this.routeId()!));
  private routeId = signal<string |  null>(null);
  protected isCurrentUser = computed(() => {
    return this.accountService.currentUser()?.id === this.routeId();
  })
  protected presenceService = inject(PresenceService)
 

   constructor(){
    this.route.paramMap.subscribe(params => {
      this.routeId.set(params.get('id'));
    } )
   }

  ngOnInit(): void {
    this.title.set(this.route.firstChild?.snapshot?.title);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: () => {
        this.title.set(this.route.firstChild?.snapshot?.title)
      }
    })
  }

  async blockMember(targetMemberId: string){
   const reason = await this.blockDialogService.open('create', '');

    if(reason){
      this.memberService.blockMember(targetMemberId, reason).subscribe({
        next: () => {
          this.toast.success('Member blocked successfully');
          this.router.navigate(['/members']);
        }
      })
    }

  }




}
