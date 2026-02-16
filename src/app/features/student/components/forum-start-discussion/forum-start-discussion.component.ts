import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../../../core/services/student/forum/forum.service';
import { ForumCategory } from '../../../../core/interfaces/student/forum/forum.interface';

@Component({
  selector: 'app-forum-start-discussion',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './forum-start-discussion.component.html',
  styleUrl: './forum-start-discussion.component.css'
})
export class ForumStartDiscussionComponent implements OnInit {
  categories: ForumCategory[] = [];

  postData = {
    title: '',
    categoryId: '',
    description: ''
  };

  loadingCategories = false;
  submitting = false;
  error = '';

  constructor(
    private forumService: ForumService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.loadingCategories = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.postData.title || !this.postData.description) {
      this.error = 'Title and description are required';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.forumService.createPost(this.postData).subscribe({
      next: (post) => {
        this.submitting = false;
        this.router.navigate(['/student/forum']);
      },
      error: (err) => {
        console.error('Failed to create post', err);
        this.error = 'Failed to create post. Please try again.';
        this.submitting = false;
      }
    });
  }
}

