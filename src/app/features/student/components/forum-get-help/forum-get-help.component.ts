import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ForumService } from '../../../../core/services/student/forum/forum.service';
import { ForumPost, ForumCategory } from '../../../../core/interfaces/student/forum/forum.interface';

@Component({
  selector: 'app-forum-get-help',
  imports: [RouterLink, CommonModule],
  templateUrl: './forum-get-help.component.html',
  styleUrl: './forum-get-help.component.css'
})
export class ForumGetHelpComponent implements OnInit {
  recentQuestions: ForumPost[] = [];
  categories: ForumCategory[] = [];
  loading = false;

  constructor(private forumService: ForumService) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecentQuestions();
  }

  loadCategories(): void {
    this.forumService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadRecentQuestions(): void {
    this.loading = true;
    this.forumService.getPosts({ page: 1, limit: 5, sort: 'newest' }).subscribe({
      next: (res) => {
        this.recentQuestions = res.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recent questions', err);
        this.loading = false;
      }
    });
  }
}

