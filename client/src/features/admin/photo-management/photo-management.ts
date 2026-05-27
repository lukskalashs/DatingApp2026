import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { Photo } from '../../../types/member';

@Component({
  selector: 'app-photo-management',
  imports: [],
  templateUrl: './photo-management.html',
  styleUrl: './photo-management.css',
})
export class PhotoManagement implements OnInit {
  photos = signal<Photo[]>([]);
  private adminService = inject(AdminService);

  ngOnInit(): void {
    this.getPhotosForModeration();
  }

  getPhotosForModeration() {
    this.adminService.getPhotosForModeration().subscribe({
      next: photos => this.photos.set(photos)
    })
  }

  approvePhoto(photoId: number) {
    this.adminService.approvePhoto(photoId).subscribe({
      next: () => this.photos.update(photos => photos.filter(x => x.id !== photoId))
    })
  }

  rejectPhoto(photoId: number) {
    this.adminService.rejectPhoto(photoId).subscribe({
      next: () => this.photos.update(photos => photos.filter(x => x.id !== photoId))
    })
  }

}
