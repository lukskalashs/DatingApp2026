import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { ToastSevice } from '../../../core/services/toast-sevice';
import { User } from '../../../types/user';

@Component({
  selector: 'app-user-management',
  imports: [],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})

export class UserManagement implements OnInit {
  @ViewChild('rolesModal') rolesModal!: ElementRef<HTMLDialogElement>;
  private adminService = inject(AdminService);
  private toastService = inject(ToastSevice);
  protected users = signal<User[]>([]);
  protected availableRoles = ['Admin', 'Moderator', 'Member', 'VIP'];
  protected selectedUser: User | null = null;

  ngOnInit(): void {
    this.getUserWithRoles();
  }

  getUserWithRoles() {
    this.adminService.getUserWithRoles().subscribe({
      next: users => this.users.set(users)
    })
  }
  openRolesModal(user: User) {
    this.selectedUser = user;
    this.rolesModal.nativeElement.showModal();
  }
  toggleRole(event: Event, role: string) {
    if (!this.selectedUser) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedUser.roles.push(role);
    } else {
      this.selectedUser.roles = this.selectedUser.roles.filter(r => r !== role);
    }
  }

  updateRoles(){
    if (!this.selectedUser) return;
    this.adminService.updateUserRoles(this.selectedUser.id, this.selectedUser.roles).subscribe({
      next: updatedRoles => {
        this.users.update(users => users.map(u => {
          if (u.id === this.selectedUser?.id) u.roles = updatedRoles;
          return u;
        }));
        this.rolesModal.nativeElement.close();
        this.toastService.success(`Roles updated for ${this.selectedUser?.email}. User must logout and login to access new role permissions.`, 7000);
      },
      error: error => {
        console.log('Failed to update roles', error);
        this.toastService.error('Failed to update roles', 5000);
      }
    });
  }
}

