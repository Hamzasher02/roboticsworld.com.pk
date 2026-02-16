import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseBundleService } from '../../../../../core/services/admin/course-bundle/course-bundle.service';

interface BundleRow {
  _id: string; // Changed to string to match API
  category: string;
  bundleName: string;
  level: string; // array in API but displayed as string
  price: number;
  ageGroup: string;
  discountCode?: string;
  status: string;
  originalData?: any; // Store full object for edit
}

@Component({
  selector: 'app-bundle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bundle.component.html',
  styleUrl: './bundle.component.css'
})
export class BundleComponent implements OnInit {
  @Output() editBundle = new EventEmitter<any>();

  configs: BundleRow[] = [];
  pageSize = 5;
  currentPage = 1;

  constructor(private courseBundleService: CourseBundleService) { }

  ngOnInit(): void {
    this.fetchBundles();
  }

  fetchBundles() {
    this.courseBundleService.getAllBundles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.configs = res.data.map((b: any) => ({
            _id: b._id,
            category: b.category?.categoryName || 'Unknown',
            bundleName: b.bundleName,
            level: b.level?.[0] || '—',
            price: b.price,
            ageGroup: b.ageGroup || '—',
            discountCode: b.couponCode || '—',
            status: b.visibility || 'Inactive',
            originalData: b
          }));
        }
      },
      error: (err) => console.error('Failed to fetch bundles', err)
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.configs.length / this.pageSize));
  }

  get pageLabel(): string {
    return `Page ${this.currentPage} / ${this.totalPages}`;
  }

  get pagedConfigs(): BundleRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.configs.slice(start, start + this.pageSize);
  }

  editRow(row: BundleRow): void {
    // Emit the original data or just the row to parent
    this.editBundle.emit(row.originalData);
  }

  prevPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  trackById(_: number, item: BundleRow): string {
    return item._id;
  }
}
