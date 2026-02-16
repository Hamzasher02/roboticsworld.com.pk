import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type StatusType = 'Active' | 'Inactive';

interface PricingConfig {
  id: number;
  category: string;
  courseName: string;
  level: string;
  price: number;
  ageGroup: string;
  status: StatusType;
}

@Component({
  selector: 'app-price',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price.component.html',
  styleUrl: './price.component.css'
})
export class PriceComponent {
  // Dropdown data (dynamic)
  categories = [
    'Introduction to Data Science',
    'Advanced Machine Learning',
    'Web Development Bootcamp',
    'Digital Marketing Fundamentals',
    'Mobile App Development'
  ];

  coursesByCategory: Record<string, string[]> = {
    'Introduction to Data Science': ['Introduction to Data Science'],
    'Advanced Machine Learning': ['Advanced Machine Learning'],
    'Web Development Bootcamp': ['Web Development Bootcamp'],
    'Digital Marketing Fundamentals': ['Digital Marketing Fundamentals'],
    'Mobile App Development': ['Mobile App Development']
  };

  levels = ['Basic', 'Premium'];
  ageGroups = ['10 yrs', '14 yrs', '16 yrs', '20 yrs'];

  // Form model (dynamic)
  form = {
    category: '',
    level: '',
    ageGroup: '',
    course: '',
    price: '',
    discountCode: ''
  };

  // Table data (dynamic)
  configs: PricingConfig[] = [
    { id: 1, category: 'Introduction to Data Science', courseName: 'Introduction to Data Science', level: 'Basic', price: 99, ageGroup: '16 yrs', status: 'Active' },
    { id: 2, category: 'Advanced Machine Learning', courseName: 'Advanced Machine Learning', level: 'Premium', price: 199, ageGroup: '14 yrs', status: 'Active' },
    { id: 3, category: 'Web Development Bootcamp', courseName: 'Web Development Bootcamp', level: 'Basic', price: 149, ageGroup: '10 yrs', status: 'Inactive' },
    { id: 4, category: 'Digital Marketing Fundamentals', courseName: 'Digital Marketing Fundamentals', level: 'Basic', price: 79, ageGroup: '10 yrs', status: 'Active' },
    { id: 5, category: 'Mobile App Development', courseName: 'Mobile App Development', level: 'Premium', price: 249, ageGroup: '20 yrs', status: 'Active' }
  ];

  // Edit state
  private editingId: number | null = null;

  // Pagination (dynamic)
  pageSize = 5;
  currentPage = 1;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.configs.length / this.pageSize));
  }

  get pageLabel(): string {
    return `Page ${this.currentPage} / ${this.totalPages}`;
  }

  get pagedConfigs(): PricingConfig[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.configs.slice(start, start + this.pageSize);
  }

  get availableCourses(): string[] {
    if (!this.form.category) return [];
    return this.coursesByCategory[this.form.category] ?? [];
  }

  onCategoryChange(): void {
    this.form.course = '';
  }

  updatePricing(): void {
    const priceNum = Number(this.form.price);

    if (!this.form.category || !this.form.level || !this.form.ageGroup || !this.form.course || !this.form.price || Number.isNaN(priceNum)) {
      return;
    }

    if (this.editingId !== null) {
      const idx = this.configs.findIndex(x => x.id === this.editingId);
      if (idx !== -1) {
        this.configs[idx] = {
          ...this.configs[idx],
          category: this.form.category,
          courseName: this.form.course,
          level: this.form.level,
          price: priceNum,
          ageGroup: this.form.ageGroup
        };
      }
      this.editingId = null;
    } else {
      const nextId = Math.max(0, ...this.configs.map(x => x.id)) + 1;
      this.configs.unshift({
        id: nextId,
        category: this.form.category,
        courseName: this.form.course,
        level: this.form.level,
        price: priceNum,
        ageGroup: this.form.ageGroup,
        status: 'Active'
      });
    }

    this.currentPage = 1;
    this.resetForm();
  }

  editRow(row: PricingConfig): void {
    this.editingId = row.id;
    this.form.category = row.category;
    this.form.level = row.level;
    this.form.ageGroup = row.ageGroup;
    this.form.course = row.courseName;
    this.form.price = String(row.price);
    this.form.discountCode = '';
  }

  prevPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  trackById(_: number, item: PricingConfig): number {
    return item.id;
  }

  private resetForm(): void {
    this.form = { category: '', level: '', ageGroup: '', course: '', price: '', discountCode: '' };
  }
}
