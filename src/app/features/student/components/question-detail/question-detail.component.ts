import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ForumService } from '../../../../core/services/student/forum/forum.service';
import { ForumPost, ForumComment } from '../../../../core/interfaces/student/forum/forum.interface';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/steam-mind/login.service';

@Component({
  selector: 'app-question-detail',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.css'
})
export class QuestionDetailComponent implements OnInit, OnDestroy {
  postId = '';
  post: ForumPost | null = null;
  comments: ForumComment[] = [];
  currentUser: any = null;

  newCommentContent = '';
  loading = false;
  loadingComments = false;
  submittingComment = false;
  error = '';
  isLikingPost = false;
  likingCommentIds = new Set<string>();

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  get isAuthor(): boolean {
    if (!this.post || !this.currentUser) return false;
    // Compare post author ID with current user ID (handling different field names)
    const authorId = this.post.author.id || this.post.author._id;
    const currentId = this.currentUser.userId || this.currentUser.id || this.currentUser._id;
    return authorId === currentId;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const sub = this.route.queryParams.subscribe(params => {
      this.postId = params['postId'];
      if (this.postId) {
        this.loadPostDetail();
        this.loadComments();
      }
    });
    this.subscriptions.push(sub);
  }

  loadPostDetail(): void {
    this.loading = true;
    this.forumService.getPostById(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load post', err);
        this.error = 'Failed to load post details';
        this.loading = false;
      }
    });
  }

  loadComments(): void {
    this.loadingComments = true;
    this.forumService.getComments(this.postId).subscribe({
      next: (response) => {
        this.comments = response.items;
        this.loadingComments = false;
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        this.loadingComments = false;
      }
    });
  }

  togglePostLike(): void {
    if (!this.post) return;

    const id = this.post.id;
    if (!id || this.isLikingPost) return;

    this.isLikingPost = true;
    this.forumService.toggleLikePost(id as string).subscribe({
      next: (res) => {
        if (this.post) {
          this.post.isLikedByUser = res.isLikedByUser;
          this.post.likeCount = res.likeCount;
        }
        this.isLikingPost = false;
      },
      error: (err) => {
        console.error('Failed to toggle post like:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to toggle like. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isLikingPost = false;
      }
    });
  }

  toggleCommentLike(comment: ForumComment): void {
    if (this.likingCommentIds.has(comment.id)) return;

    this.likingCommentIds.add(comment.id);
    this.forumService.toggleCommentLike(comment.id).subscribe({
      next: (res) => {
        comment.isLikedByUser = res.isLikedByUser;
        comment.likeCount = res.likeCount;
        this.likingCommentIds.delete(comment.id);
      },
      error: (err) => {
        console.error('Failed to toggle comment like:', err);
        const errorMessage = err.error?.message || err.message || 'Failed to toggle like. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.likingCommentIds.delete(comment.id);
      }
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim()) return;

    this.submittingComment = true;
    this.forumService.addComment(this.postId, { content: this.newCommentContent }).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newCommentContent = '';
        this.submittingComment = false;
        if (this.post) this.post.commentCount++;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Comment added successfully'
        });
      },
      error: (err) => {
        console.error('Failed to add comment', err);
        const errorMessage = err.error?.message || err.message || 'Failed to add comment';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.submittingComment = false;
      }
    });
  }

  acceptAnswer(comment: ForumComment): void {
    if (!this.isAuthor) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Only the post author can accept an answer'
      });
      return;
    }

    this.forumService.acceptAnswer(comment.commentId).subscribe({
      next: (res) => {
        // Update local state
        this.comments.forEach(c => c.isAcceptedAnswer = false);
        comment.isAcceptedAnswer = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Answer accepted successfully'
        });
      },
      error: (err) => {
        console.error('Failed to accept answer', err);
        const errorMessage = err.error?.message || err.message || 'Failed to accept answer';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

