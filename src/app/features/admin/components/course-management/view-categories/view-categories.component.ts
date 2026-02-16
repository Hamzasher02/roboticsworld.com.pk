import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CategoryService } from '../../../../../core/services/admin/category/category.service';
import {
  ApiCategory,
  ApiCategoryListResponse,
  ApiResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '../../../../../core/interfaces/admin/category';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

type CatStatus = 'Active' | 'Inactive';
type ModalMode = 'add' | 'edit';

interface SubcategoryDetail {
  name: string;
  levels: Array<'Beginner' | 'Intermediate' | 'Advanced' | string>;
  ageGroups: string[];
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  status: CatStatus;
  subcategories: number;
  courses: number;
  createdAt: string;
  icon: string;
  details?: { subcategoryDetails: SubcategoryDetail[] };
}

@Component({
  selector: 'app-view-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.css',
})
export class ViewCategoriesComponent implements OnInit {
  protected Math = Math;

  search = '';
  statusFilter: 'All Status' | CatStatus = 'All Status';

  rows: CategoryRow[] = [];

  isLoading = false;     // fetch / table loading / delete (per user task D)
  isCreating = false;    // create (add) / update (per user task D)

  pagination = { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Status Modal State (Global)
  showModal = false;
  modalTitle: 'Success' | 'Error' = 'Success';
  modalMessage = '';
  modalType: 'Success' | 'Error' = 'Success';

  isAddCategoryOpen = false;
  isViewOpen = false;
  isDeleteOpen = false;

  activeRow: CategoryRow | null = null;

  modalMode: ModalMode = 'add';
  editingRowId: string | null = null;

  addForm = {
    name: '',
    description: '',
    subCategory: '',
    level: '',
    ageGroup: '',
    visibility: 'Active' as CatStatus,
    creationDate: '',
    iconFile: null as File | null,
    iconFileName: '',
    subCategoryChips: [] as string[],
    levelChips: [] as string[],
    ageGroupChips: [] as string[],
  };

  readonly defaultIcon = '/assets/admin/course-management/default.svg';

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.fetchCategories(1);
  }

  /* ===================== STATUS MODAL ===================== */
  openStatusModal(title: 'Success' | 'Error', message: string) {
    this.modalTitle = title;
    this.modalType = title;
    this.modalMessage = message || (title === 'Success' ? 'Done' : 'Something went wrong');
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  private getErrMsg(err: any, fallback: string) {
    return err?.error?.message || err?.message || fallback;
  }

  private formatDateForUI(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${mon},${year}`;
  }

  private toUiDate(input?: string): string {
    if (!input) return this.formatDateForUI(new Date());
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return this.formatDateForUI(new Date());
    return this.formatDateForUI(d);
  }

  private normalizeChip(v: string): string {
    return v.trim().replace(/\s+/g, ' ');
  }

  private resetAddForm(date: string) {
    this.addForm = {
      name: '',
      description: '',
      subCategory: '',
      level: '',
      ageGroup: '',
      visibility: 'Active',
      creationDate: date,
      iconFile: null,
      iconFileName: '',
      subCategoryChips: [],
      levelChips: [],
      ageGroupChips: [],
    };
  }

  private normalizeStatusFromApi(s?: string): CatStatus {
    const v = String(s ?? '').toLowerCase().trim();
    return v === 'inactive' ? 'Inactive' : 'Active';
  }

  getIconUrl(iconUrl: string): string {
    if (!iconUrl) return this.defaultIcon;
    if (iconUrl.startsWith('http') || iconUrl.startsWith('data:')) return iconUrl;
    return this.defaultIcon;
  }

  /* ===================== API: FETCH / MAP ===================== */
  private fetchCategories(page: number = 1): void {
    this.isLoading = true;
    const limit = this.pagination.limit || 10;

    this.categoryService
      .getAllCategories(page, limit)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApiCategoryListResponse) => {
          this.rows = (res.data || []).map((x) => this.mapApiToRow(x));
          if (res.pagination) {
            this.pagination = {
              total: res.pagination.total,
              page: res.pagination.page,
              limit: res.pagination.limit,
              totalPages: res.pagination.totalPages,
            };
          } else {
            this.pagination = { total: (res.data || []).length, page: 1, limit: 10, totalPages: 1 };
          }
        },
        error: (err: any) => {
          this.rows = [];
          this.openStatusModal('Error', this.getErrMsg(err, 'Fetch categories failed'));
        },
      });
  }

  private mapApiToRow(x: ApiCategory): CategoryRow {
    const details = (x.subCategory || []).map((name) => ({
      name,
      levels: (x.categoryLevel || []) as Array<'Beginner' | 'Intermediate' | 'Advanced' | string>,
      ageGroups: x.categoryAgeGroup || [],
    }));

    const desc = (x.description ?? x.categoryDescription ?? '') as string;

    return {
      id: x._id,
      name: x.categoryName || '',
      description: desc,
      status: this.normalizeStatusFromApi(x.visibility),
      subcategories: (x.subCategory || []).length,
      courses: 0,
      createdAt: this.toUiDate(x.createdAt),
      icon: x.icon?.secureUrl || '',
      details: details.length ? { subcategoryDetails: details } : undefined,
    };
  }

  get pages(): number[] {
    const total = this.pagination.totalPages;
    const current = this.pagination.page;
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const pagesList: number[] = [];
    for (let i = start; i <= end; i++) pagesList.push(i);
    return pagesList;
  }

  changePage(newPage: number) {
    if (this.isLoading) return;
    if (newPage >= 1 && newPage <= this.pagination.totalPages && newPage !== this.pagination.page) {
      this.fetchCategories(newPage);
    }
  }

  goBack() { history.back(); }
  addCategory() { this.openAddCategoryModal(); }

  openAddCategoryModal() {
    this.modalMode = 'add';
    this.editingRowId = null;
    this.isAddCategoryOpen = true;
    this.resetAddForm(this.formatDateForUI(new Date()));
  }

  openEditCategoryModal(row: CategoryRow) {
    this.modalMode = 'edit';
    this.editingRowId = row.id;
    this.isAddCategoryOpen = true;
    this.addForm = {
      name: row.name,
      description: row.description || '',
      subCategory: '',
      level: '',
      ageGroup: '',
      visibility: row.status,
      creationDate: row.createdAt,
      iconFile: null,
      iconFileName: '',
      subCategoryChips: row.details?.subcategoryDetails.map(d => d.name) || [],
      levelChips: Array.from(new Set(row.details?.subcategoryDetails.flatMap(d => d.levels as string[]) || [])),
      ageGroupChips: Array.from(new Set(row.details?.subcategoryDetails.flatMap(d => d.ageGroups) || [])),
    };
  }

  closeAddCategoryModal() {
    if (this.isCreating) return;
    this.isAddCategoryOpen = false;
    this.modalMode = 'add';
    this.editingRowId = null;
  }

  viewRow(r: CategoryRow) { this.activeRow = r; this.isViewOpen = true; }
  closeView() { this.isViewOpen = false; this.activeRow = null; }

  editRow(r: CategoryRow) { this.openEditCategoryModal(r); }

  deleteRow(r: CategoryRow) { this.activeRow = r; this.isDeleteOpen = true; }
  closeDelete() {
    if (this.isLoading) return; // User requested isLoading used for delete
    this.isDeleteOpen = false;
    this.activeRow = null;
  }

  onCategoryIconPicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    this.addForm.iconFile = file;
    this.addForm.iconFileName = file ? file.name : '';
    if (input) input.value = '';
  }

  addSubCategoryChip() {
    const v = this.normalizeChip(this.addForm.subCategory);
    if (!v) return;
    if (!this.addForm.subCategoryChips.includes(v)) this.addForm.subCategoryChips.push(v);
    this.addForm.subCategory = '';
  }
  removeSubCategoryChip(chip: string) {
    this.addForm.subCategoryChips = this.addForm.subCategoryChips.filter(x => x !== chip);
  }

  addLevelChip() {
    const v = this.normalizeChip(this.addForm.level);
    if (!v) return;
    if (!this.addForm.levelChips.includes(v)) this.addForm.levelChips.push(v);
    this.addForm.level = '';
  }
  removeLevelChip(chip: string) {
    this.addForm.levelChips = this.addForm.levelChips.filter(x => x !== chip);
  }

  addAgeGroupChip() {
    const v = this.normalizeChip(this.addForm.ageGroup);
    if (!v) return;
    if (!this.addForm.ageGroupChips.includes(v)) this.addForm.ageGroupChips.push(v);
    this.addForm.ageGroup = '';
  }
  removeAgeGroupChip(chip: string) {
    this.addForm.ageGroupChips = this.addForm.ageGroupChips.filter(x => x !== chip);
  }

  trackById = (_: number, item: CategoryRow) => item.id;
  trackByChip = (_: number, chip: string) => chip;

  get filteredRows(): CategoryRow[] {
    const q = this.search.trim().toLowerCase();
    return this.rows.filter((r) => {
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchStatus = this.statusFilter === 'All Status' ? true : r.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  private uniqueStrings(list: string[]): string[] {
    const out: string[] = [];
    for (const s of list) {
      const v = this.normalizeChip(s);
      if (v && !out.includes(v)) out.push(v);
    }
    return out;
  }

  get viewSubcategoryNames(): string[] {
    const details = this.activeRow?.details?.subcategoryDetails || [];
    return this.uniqueStrings(details.map(d => d.name));
  }

  get viewLevelNames(): string[] {
    const details = this.activeRow?.details?.subcategoryDetails || [];
    return this.uniqueStrings(details.flatMap(d => d.levels as string[]));
  }

  get viewAgeGroupNames(): string[] {
    const details = this.activeRow?.details?.subcategoryDetails || [];
    return this.uniqueStrings(details.flatMap(d => d.ageGroups));
  }

  editFromView() {
    if (!this.activeRow) return;
    const row = this.activeRow;
    this.closeView();
    this.editRow(row);
  }

  get canCreateCategory(): boolean {
    return !!this.addForm.name.trim() && !!this.addForm.description.trim() && !!this.addForm.creationDate.trim();
  }

  private buildNames(): { sub: string[]; lvl: string[]; age: string[] } {
    const sub = this.addForm.subCategoryChips.length ? [...this.addForm.subCategoryChips] : (this.addForm.subCategory.trim() ? [this.addForm.subCategory.trim()] : []);
    const lvl = this.addForm.levelChips.length ? [...this.addForm.levelChips] : (this.addForm.level.trim() ? [this.addForm.level.trim()] : []);
    const age = this.addForm.ageGroupChips.length ? [...this.addForm.ageGroupChips] : (this.addForm.ageGroup.trim() ? [this.addForm.ageGroup.trim()] : []);
    return { sub, lvl, age };
  }

  createCategory() {
    if (!this.canCreateCategory) return;
    const { sub, lvl, age } = this.buildNames();

    this.isCreating = true; // Used for both add and edit as per TASK D

    if (this.modalMode === 'edit' && this.editingRowId) {
      const updatePayload: UpdateCategoryPayload = {
        categoryId: this.editingRowId,
        categoryName: this.addForm.name.trim(),
        description: this.addForm.description.trim(),
        visibility: (this.addForm.visibility === 'Inactive' ? 'inactive' : 'active'),
        subCategory: sub,
        categoryLevel: lvl,
        categoryAgeGroup: age,
      };

      this.categoryService.updateCategory(updatePayload)
        .pipe(finalize(() => (this.isCreating = false)))
        .subscribe({
          next: (res: ApiResponse) => {
            this.openStatusModal('Success', res?.message || 'Category updated');
            this.closeAddCategoryModal();
            this.fetchCategories(this.pagination.page);
          },
          error: (err: any) => {
            this.openStatusModal('Error', this.getErrMsg(err, 'Update failed'));
          }
        });
      return;
    }

    if (!this.addForm.iconFile || !sub.length || !lvl.length || !age.length) {
      this.isCreating = false;
      this.openStatusModal('Error', 'Please provide icon and all required fields');
      return;
    }

    const createPayload: CreateCategoryPayload = {
      categoryName: this.addForm.name.trim(),
      description: this.addForm.description.trim(),
      subCategory: sub,
      categoryLevel: lvl,
      categoryAgeGroup: age,
      visibility: (this.addForm.visibility === 'Inactive' ? 'inactive' : 'active'),
      profilePicture: this.addForm.iconFile!,
    };

    this.categoryService.createCategory(createPayload)
      .pipe(finalize(() => (this.isCreating = false)))
      .subscribe({
        next: (res: ApiResponse) => {
          this.openStatusModal('Success', res?.message || 'Category created successfully');
          this.closeAddCategoryModal();
          this.fetchCategories(1);
        },
        error: (err: any) => {
          this.openStatusModal('Error', this.getErrMsg(err, 'Failed to create category'));
        }
      });
  }

  confirmDelete() {
    if (!this.activeRow) return;
    const id = this.activeRow.id;
    this.isLoading = true; // Use isLoading for delete as per TASK D

    this.categoryService.deleteCategory(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApiResponse) => {
          this.openStatusModal('Success', res?.message || 'Category deleted');
          this.isDeleteOpen = false;
          this.activeRow = null;
          this.fetchCategories(1);
        },
        error: (err: any) => {
          this.openStatusModal('Error', this.getErrMsg(err, 'Delete failed'));
        }
      });
  }

  moreFilters() {
    console.log('More Filters');
  }
}
