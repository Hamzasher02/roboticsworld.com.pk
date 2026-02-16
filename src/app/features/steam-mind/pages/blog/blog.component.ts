import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type BlogHero = {
  title: string;
  subtitle: string;
  placeholder: string;
};

type ArticleCategory = 'Science' | 'Technology' | 'Engineering' | 'Arts' | 'Mathematics';

type BlogArticle = {
  slug: string;
  category: ArticleCategory;
  image: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar?: string;
};

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  constructor(private router: Router) {}

  hero: BlogHero = {
    title: 'STEAM Minds Blog',
    subtitle:
      'Discover inspiring STEM education articles, coding tutorials, and innovative learning resources for young minds',
    placeholder: 'Search articles...',
  };

  categories: ArticleCategory[] = ['Science', 'Technology', 'Engineering', 'Arts', 'Mathematics'];
  activeCategory: 'All' | ArticleCategory = 'All';
  searchTerm = '';

// ✅ images map (your local SVGs)
private readonly blogImgs = {
  ai: 'assets/steam-mind/blog/ai.svg',
  code: 'assets/steam-mind/blog/code.svg',
  engg: 'assets/steam-mind/blog/engg.svg',
  math: 'assets/steam-mind/blog/math.svg',
  python: 'assets/steam-mind/blog/python.svg',
  python2: 'assets/steam-mind/blog/python2.svg',
  robotic: 'assets/steam-mind/blog/robotic.svg',
  school: 'assets/steam-mind/blog/school.svg',
  science: 'assets/steam-mind/blog/science.svg',
} as const;

// ✅ 16 cards (manually divided)
articles: BlogArticle[] = [
  {
    slug: 'article-1',
    category: 'Science',
    image: this.blogImgs.science,
    date: 'January 20, 2025',
    readTime: '8 min read',
    title: 'Top 10 Python Projects for Beginners',
    excerpt:
      'STEM is all about hands-on learning, problem-solving, and creativity. Discover beginner-friendly projects for students.',
    author: 'Sarah Johnson',
    authorAvatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    slug: 'article-2',
    category: 'Technology',
    image: this.blogImgs.ai,
    date: 'January 18, 2025',
    readTime: '7 min read',
    title: 'AI for Kids: A Simple Introduction',
    excerpt:
      'Understand AI concepts with simple examples and fun activities designed for young learners.',
    author: 'Michael Chen',
    authorAvatar: 'https://i.pravatar.cc/120?img=32',
  },
  {
    slug: 'article-3',
    category: 'Engineering',
    image: this.blogImgs.engg,
    date: 'January 15, 2025',
    readTime: '10 min read',
    title: "Building Your First Robot: A Beginner’s Guide",
    excerpt:
      'Step-by-step robotics starter guide for kids, using simple parts and easy builds.',
    author: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    slug: 'article-4',
    category: 'Mathematics',
    image: this.blogImgs.math,
    date: 'January 15, 2025',
    readTime: '6 min read',
    title: 'Math Challenges: Learn Through Games',
    excerpt:
      'Boost problem-solving with fun math games and puzzles for kids.',
    author: 'Fatima Noor',
    authorAvatar: 'https://i.pravatar.cc/120?img=5',
  },

  {
    slug: 'article-5',
    category: 'Technology',
    image: this.blogImgs.code,
    date: 'January 13, 2025',
    readTime: '6 min read',
    title: 'Coding Basics: Fun Activities for Kids',
    excerpt:
      'Start programming with simple activities that build logic and confidence.',
    author: 'Ayesha Khan',
    authorAvatar: 'https://i.pravatar.cc/120?img=21',
  },
  {
    slug: 'article-6',
    category: 'Science',
    image: this.blogImgs.school,
    date: 'January 12, 2025',
    readTime: '7 min read',
    title: 'STEM Learning at School and Home',
    excerpt:
      'Practical ways to support STEM learning with daily routines and projects.',
    author: 'David Lee',
    authorAvatar: 'https://i.pravatar.cc/120?img=15',
  },
  {
    slug: 'article-7',
    category: 'Engineering',
    image: this.blogImgs.robotic,
    date: 'January 11, 2025',
    readTime: '9 min read',
    title: 'Robotics Starter: Simple Builds for Beginners',
    excerpt:
      'Learn motion, sensors, and basic control with beginner robotics projects.',
    author: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    slug: 'article-8',
    category: 'Technology',
    image: this.blogImgs.python,
    date: 'January 10, 2025',
    readTime: '8 min read',
    title: 'Python Basics: Your First Program',
    excerpt:
      'Learn variables, loops, and simple programs through kid-friendly examples.',
    author: 'Michael Chen',
    authorAvatar: 'https://i.pravatar.cc/120?img=32',
  },

  {
    slug: 'article-9',
    category: 'Science',
    image: this.blogImgs.science,
    date: 'January 09, 2025',
    readTime: '8 min read',
    title: 'Easy STEM Experiments at Home',
    excerpt:
      'Try safe and fun experiments with household items to learn scientific thinking.',
    author: 'Sarah Johnson',
    authorAvatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    slug: 'article-10',
    category: 'Technology',
    image: this.blogImgs.python2,
    date: 'January 08, 2025',
    readTime: '7 min read',
    title: 'Python Projects: Build Mini Games',
    excerpt:
      'Create mini games with Python and practice core programming skills.',
    author: 'Ayesha Khan',
    authorAvatar: 'https://i.pravatar.cc/120?img=21',
  },
  {
    slug: 'article-11',
    category: 'Engineering',
    image: this.blogImgs.engg,
    date: 'January 07, 2025',
    readTime: '8 min read',
    title: 'Engineering Basics: How Things Work',
    excerpt:
      'Learn engineering concepts through simple builds and real-world examples.',
    author: 'David Lee',
    authorAvatar: 'https://i.pravatar.cc/120?img=15',
  },
  {
    slug: 'article-12',
    category: 'Mathematics',
    image: this.blogImgs.math,
    date: 'January 06, 2025',
    readTime: '6 min read',
    title: 'Fractions Made Easy: Visual Learning',
    excerpt:
      'Understand fractions with visuals and quick practice for strong foundations.',
    author: 'Fatima Noor',
    authorAvatar: 'https://i.pravatar.cc/120?img=5',
  },

  {
    slug: 'article-13',
    category: 'Technology',
    image: this.blogImgs.ai,
    date: 'January 05, 2025',
    readTime: '6 min read',
    title: 'AI Tools for Learning: Smart Study Tips',
    excerpt:
      'Explore how students can use AI tools to learn better and stay organized.',
    author: 'Michael Chen',
    authorAvatar: 'https://i.pravatar.cc/120?img=32',
  },
  {
    slug: 'article-14',
    category: 'Technology',
    image: this.blogImgs.code,
    date: 'January 04, 2025',
    readTime: '7 min read',
    title: 'Web Basics: HTML & CSS Starter',
    excerpt:
      'Build your first web page with simple HTML and CSS structure.',
    author: 'Ayesha Khan',
    authorAvatar: 'https://i.pravatar.cc/120?img=21',
  },
  {
    slug: 'article-15',
    category: 'Engineering',
    image: this.blogImgs.robotic,
    date: 'January 03, 2025',
    readTime: '9 min read',
    title: 'Build a Mini Robot Car (Beginner)',
    excerpt:
      'A beginner-friendly robot car build to understand movement and control.',
    author: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    slug: 'article-16',
    category: 'Science',
    image: this.blogImgs.school,
    date: 'January 02, 2025',
    readTime: '6 min read',
    title: 'STEM Habits: Learn Consistently',
    excerpt:
      'Daily STEM habits and routines that help students learn faster and better.',
    author: 'Sarah Johnson',
    authorAvatar: 'https://i.pravatar.cc/120?img=12',
  },
];


  get filteredArticles(): BlogArticle[] {
    const term = (this.searchTerm || '').trim().toLowerCase();

    return this.articles.filter((a) => {
      const categoryOk = this.activeCategory === 'All' ? true : a.category === this.activeCategory;

      const searchOk =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.excerpt.toLowerCase().includes(term) ||
        a.author.toLowerCase().includes(term);

      return categoryOk && searchOk;
    });
  }

  onSearch(e: Event) {
    e.preventDefault();
  }

  setCategory(c: 'All' | ArticleCategory) {
    this.activeCategory = c;
  }

  openArticle(a: BlogArticle) {
    this.router.navigate(['/steam-mind/blog/detail', a.slug]);
  }

  trackByText = (_: number, t: string) => t;
  trackBySlug = (_: number, a: BlogArticle) => a.slug;
}
