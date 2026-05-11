import { Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastSevice } from '../../../core/services/toast-sevice';
import { AccountService } from '../../../core/services/account-service';
import { TimeAgoPipe } from '../../../core/time-ago-pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule, TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit,OnDestroy   {
 
  @ViewChild('editForm') editForm?: NgForm
  @HostListener('window:beforeunload', ['$event']) notify($event:BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }

  private accountService = inject(AccountService)
  protected memberService  = inject(MemberService)
  private toast = inject(ToastSevice)
  private route = inject(ActivatedRoute)
  private routeSubscription?: Subscription

  protected editableMember: EditableMember = {
    displayName: '',
    description: '',
    city: '',
    country: ''
  }

  //Zoneless detection 


  ngOnInit(): void {
    this.routeSubscription = this.route.parent?.params.subscribe(() => {
      this.initializeForm();
    })
  }

  private initializeForm(): void {
    const currentUserId = this.accountService.currentUser()?.id;
    const routeUserId = this.route.parent?.snapshot.paramMap.get('id');
    
    if (!currentUserId) return;

    // Only load current user's data if viewing own profile
    if (currentUserId === routeUserId) {
      this.memberService.getMember(currentUserId).subscribe({
        next: () => {
          this.editableMember = {
            displayName: this.memberService.member()?.displayName || '',
            description: this.memberService.member()?.description || '',
            city: this.memberService.member()?.city || '',
            country: this.memberService.member()?.country || ''
          }
        }
      });
    } else {
      // Use the resolver-loaded member data for other users
      this.editableMember = {
        displayName: this.memberService.member()?.displayName || '',
        description: this.memberService.member()?.description || '',
        city: this.memberService.member()?.city || '',
        country: this.memberService.member()?.country || ''
      }
    }
  }

  updateProfile(){
    if(!this.memberService.member()) return;
    const updateMember = {...this.memberService.member(), ...this.editableMember}
    this.memberService.updateMember(this.editableMember).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if(currentUser && updateMember.displayName !== currentUser?.displayName){
          currentUser .displayName = updateMember.displayName;
          this.accountService.currentUser.set(currentUser);
        }
        this.toast.success("Profile Updated successfully");
        this.memberService.editMode.set(false);
        this.memberService.member.set(updateMember as Member)
        this.editForm?.reset(updateMember);
      }
    })
    
  }

  ngOnDestroy(): void {
    if(this.memberService.editMode()){
      this.memberService.editMode.set(false)
    }
    this.routeSubscription?.unsubscribe();
  }
}