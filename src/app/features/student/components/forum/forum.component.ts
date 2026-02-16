import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ForumService } from '../../../../core/services/student/forum/forum.service';
import { ForumPost, ForumCategory, PostQueryParams } from '../../../../core/interfaces/student/forum/forum.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-forum',
  imports: [RouterLink, CommonModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent implements OnInit, OnDestroy {
  // Forum data
  posts: ForumPost[] = [];
  categories: ForumCategory[] = [];

  // Filters
  selectedCategory = '';
  searchQuery = '';
  sortBy: 'newest' | 'oldest' | 'most_liked' | 'most_commented' = 'newest';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  hasNext = false;
  hasPrev = false;

  // Loading states
  loadingPosts = false;
  loadingCategories = false;

  // Error states
  errorPosts = '';
  errorCategories = '';
  likingPostIds = new Set<string>();

  private subscriptions: Subscription[] = [];

  constructor(
    private forumService: ForumService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories(): void {
    this.loadingCategories = true;

    const sub = this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.errorCategories = 'Failed to load categories';
        this.loadingCategories = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.errorPosts = '';

    const params: PostQueryParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: this.sortBy
    };

    if (this.selectedCategory) {
      params.categoryId = this.selectedCategory;
    }
    if (this.searchQuery) {
      params.q = this.searchQuery;
    }

    const sub = this.forumService.getPosts(params).subscribe({
      next: (response) => {
        this.posts = response.items;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.hasNext = response.pagination.hasNext;
        this.hasPrev = response.pagination.hasPrev;
        this.loadingPosts = false;
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
        this.errorPosts = 'Failed to load posts';
        this.loadingPosts = false;
      }
    });
    this.subscriptions.push(sub);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPosts();
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPosts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId === 'all' ? '' : categoryId;
    this.onFilterChange();
  }

  viewPost(postId: string): void {
    this.router.navigate(['/student/question-detail'], {
      queryParams: { postId }
    });
  }

  toggleLike(event: Event, post: ForumPost): void {
    event.stopPropagation();
    event.preventDefault();

    const id = post.id;
    if (!id || this.likingPostIds.has(id)) return;

    this.likingPostIds.add(id);
    this.forumService.toggleLikePost(id as string).subscribe({
      next: (response) => {
        post.isLikedByUser = response.isLikedByUser;
        post.likeCount = response.likeCount;
        this.likingPostIds.delete(id);
      },
      error: (err) => {
        console.error('Failed to toggle like:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to toggle like. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.likingPostIds.delete(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

