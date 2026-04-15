import { Component, inject, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from "../../../shared/paginator/paginator";
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();
  private updatedParams = new MemberParams();

  constructor() {
    const filters = localStorage.getItem('filters');
    if (filters) {
      this.memberParams = JSON.parse(filters);
      this.updatedParams = JSON.parse(filters);
    }
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (result) => this.paginatedMembers.set(result)
    });
  }

  onPageChange(event: {pageNumber: number, pageSize: number}) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

   openModal() {
    this.modal.open();
  }

  onClose() {
    console.log('Modal closed');
  }

  onFilterChange(data: MemberParams) {
    this.memberParams = {...data};
    this.updatedParams = {...data}; // Store the updated filters for display purposes
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams(); // Reset the updated filters as well
    this.loadMembers();
  }

   get displayMessage(): string {
    const defaultParams = new MemberParams();

    const filters: string[] = [];

    if (this.updatedParams.gender) {
      filters.push(this.updatedParams.gender + 's')
    } else {
      filters.push('Males, Females');
    }

    if (this.updatedParams.minAge !== defaultParams.minAge 
      || this.updatedParams.maxAge !== defaultParams.maxAge) {
        filters.push(` ages ${this.updatedParams.minAge}-${this.updatedParams.maxAge}`);
      }

    filters.push(this.updatedParams.OrderBy === 'lastActive' 
      ? 'Recently active' : 'Newest members');

    return filters.length > 0 ? `Selected: ${filters.join('  | ')}` : 'All members';
  }
}
