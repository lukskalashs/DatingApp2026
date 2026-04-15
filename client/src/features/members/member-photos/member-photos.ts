import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Member, Photo } from '../../../types/member';
import { ImageUpload } from "../../../shared/image-upload/image-upload";
import { AccountService } from '../../../core/services/account-service';
import { User } from '../../../types/user';
import { StarButton } from "../../../shared/star-button/star-button";
import { DeleteButton } from "../../../shared/delete-button/delete-button";

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService)
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]); 
  protected loading = signal(false)  


  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    console.log('Member photos component init. MemberId:', memberId);
    if (memberId) {
      this.memberService.getMemberPhotos(memberId).subscribe({
        next: photos => {
          console.log('Photos loaded:', photos);
          this.photos.set(photos);
        },
        error: error => {
          console.log('Error loading photos:', error);
        }
      })
    }
  }
  
  onUploadImage(file: File) {
    this.loading.set(true);
    
    this.memberService.uploadPhoto(file).subscribe({
      next: photo => {
        this.memberService.editMode.set(false);
        this.photos.update(photos => [...photos, photo]);

        if(!this.memberService.member()?.imageUrl) {
          this.setMainLocalPhoto(photo);
        }
        
        // Also refresh photos from server to ensure sync
        // if (memberId) {
        //   this.memberService.getMemberPhotos(memberId).subscribe({
        //     next: refreshedPhotos => {
        //       console.log('Photos refreshed from server:', refreshedPhotos);
        //       this.photos.set(refreshedPhotos);
        //     }
        //   });
        // }
        
        // this.memberService.editMode.set(false);
        // this.loading.set(false);
      },
      error: error => {
        console.log('Error uploading image: ', error);
        this.loading.set(false);
      }
    })
  }

  setMainPhoto(photo: Photo){
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        this.setMainLocalPhoto(photo);
        
      }
    })
  }
    deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update(photos => photos.filter(x => x.id !== photoId))
      }
    })
  }

  private setMainLocalPhoto(photo: Photo){
    const currenrUser = this.accountService.currentUser();
        if(currenrUser) currenrUser.imageUrl = photo.url;
        this.accountService.setCurrentUser(currenrUser as User);
        this.memberService.member.update(member => ({
          ...member,
          imageUrl: photo.url
        }) as Member)
  }

  

  
}

