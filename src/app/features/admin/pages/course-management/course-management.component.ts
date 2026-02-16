import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BundleComponent } from '../../components/course-management/bundle/bundle.component';
import { CategoryService } from '../../../../core/services/admin/category/category.service';
import { getAdminBasePath } from '../../../../core/config/admin-routes.config';
import { CourseService } from '../../../../core/services/admin/course/course.service';
import {
  ApiCategory,
  ApiCategoryListResponse,
  CategorySubGroupsResponse,
  CategoryAgeGroupsResponse,
  CategoryLevelsResponse
} from '../../../../core/interfaces/admin/category';
import { Course, CourseCatalogResponse } from '../../../../core/interfaces/admin/course';
import { StatusModalComponent } from '../../../../shared/components/status-modal/status-modal.component';
import { AdminCourseService } from '../../../../core/services/admin/course/admin-course.service';
import { AdminCourse, AdminBundle, AdminCourseCatalogResponse, AdminCatalogParams } from '../../../../core/interfaces/admin/admin-course.interfaces';
import { CourseBundleService } from '../../../../core/services/admin/course-bundle/course-bundle.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

type CourseType = 'Bundle Course' | 'Single Course';

interface CourseCard {
  id: string; // Changed to string to match _id
  title: string;
  type: CourseType;
  level: string;
  price: number;
  isActive: boolean;
  imgUrl: string;
}

type PillKey = 'category' | 'status';

interface FilterPill {
  key: PillKey;
  label: string;
  color: 'purple' | 'green';
}

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, BundleComponent, StatusModalComponent],
  templateUrl: './course-management.component.html',
})
export class CourseManagementComponent implements OnInit {
  private basePath = getAdminBasePath();
  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private courseService: CourseService,
    private adminCourseService: AdminCourseService,
    private courseBundleService: CourseBundleService
  ) { }

  // Dropdown Data Lists
  categoriesList: ApiCategory[] = [];
  subCategoriesList: string[] = [];
  ageGroupsList: string[] = [];
  levelsList: string[] = [];

  // loading flags
  isCategoriesLoading = false;
  isMetaLoading = false;
  isBundleMetaLoading = false;
  isCreatingCourse = false;
  isCreatingBundle = false;
  isCoursesLoading = false;

  // Status Modal
  showStatusModal = false;
  statusModalTitle = '';
  statusModalMessage = '';
  statusModalType: 'Success' | 'Error' = 'Success';

  category = 'All Categories';
  status = 'Active';
  priceRange = 'Price Range';
  bundleCourses = 'All';
  searchText = '';

  courses: CourseCard[] = [];
  visibilityLoading: Record<string, boolean> = {};

  isLoadingBundleCourses = false;
  availableCoursesForBundle: { id: string; title: string }[] = [];
  bundleSelectedCourses: { id: string; title: string }[] = [];

  bundleSubCategoriesList: string[] = [];
  bundleAgeGroupsList: string[] = [];
  bundleLevelsList: string[] = [];

  // Delete modal
  showDeleteModal = false;
  courseToDelete: CourseCard | null = null;

  // Pricing modals
  showBundlePricing = false;

  // Add Course dropdown
  showAddMenu = false;

  // Popups
  showAddCoursePopup = false;
  showCreateBundlePopup = false;

  // thumbnail preview (add/update course popup)
  courseThumbPreview: string | null = null;

  // outline pdf meta
  outlinePdfMeta: { name: string; sizeLabel: string } | null = null;

  // bundle thumbnail preview
  bundleThumbPreview: string | null = null;

  private editingCourse: CourseCard | null = null;
  editingBundleId: string | null = null;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Pagination state
  page = 1;
  limit = 10;
  totalResults = 0;

  get isEditMode(): boolean {
    return !!this.editingCourse;
  }

  get coursePopupTitle(): string {
    return this.isEditMode ? 'Update Course' : 'Add Course';
  }

  get coursePopupActionLabel(): string {
    return this.isCreatingCourse ? 'Creating course...' : (this.isEditMode ? 'Update Course' : 'Create Course');
  }

  addCourseForm = {
    thumbnail: null as File | null,
    title: '',
    level: '',
    category: '', // stores categoryId
    price: '',
    subCategory: '',
    ageGroup: '',
    outlinePdf: null as File | null,
    access: '',
    enrollmentType: 'live' as 'live' | 'recorded'
  };

  bundleForm = {
    thumbnail: null as File | null,
    bundleName: '',
    price: '',
    category: '',
    subCategory: [] as string[],
    ageGroup: [] as string[],
    level: [] as string[],
    access: '',
    discount: '',
    couponCode: '',
    description: '',
    visibility: 'Active' as 'Active' | 'Inactive',
  };

  bundleSubCategoryToAdd = '';
  bundleAgeGroupToAdd = '';
  bundleLevelToAdd = '';

  ngOnInit(): void {
    this.fetchCategories();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onFilterChange();
    });

    this.fetchCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange() {
    this.searchSubject.next(this.searchText);
  }

  fetchCourses(params: AdminCatalogParams = { type: 'all', page: 1, limit: 10 }) {
    this.isCoursesLoading = true;
    this.adminCourseService.getAdminCatalog(params).subscribe({
      next: (res: AdminCourseCatalogResponse) => {
        const mappedCourses = (res.data.courses || []).map((c: AdminCourse) => ({
          id: c._id,
          title: c.courseTitle,
          type: 'Single Course' as CourseType,
          level: c.courseLevel,
          price: parseFloat(c.coursePrice) || 0,
          isActive: c.courseVisibility,
          imgUrl: c.courseThumbnail?.secureUrl || '/assets/admin/course-manage/pic.svg'
        }));

        const mappedBundles = (res.data.bundles || []).map((b: AdminBundle) => ({
          id: b._id,
          title: b.bundleName,
          type: 'Bundle Course' as CourseType,
          level: b.level || 'Multiple',
          price: parseFloat(b.priceAfterDiscount) || parseFloat(b.price) || 0,
          isActive: b.visibility === 'Active',
          imgUrl: b.thumbnail || b.bundleThumbnail?.secureUrl || '/assets/admin/course-manage/pic.svg'
        }));

        if (res.type === 'course') {
          this.courses = mappedCourses;
        } else if (res.type === 'bundle') {
          this.courses = mappedBundles;
        } else {
          this.courses = [...mappedCourses, ...mappedBundles];
        }
        this.isCoursesLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch catalog', err);
        this.isCoursesLoading = false;
        this.openStatusModal('Error', err.error?.message || err.message, 'Error');
      }
    });
  }

  onFilterChange() {
    let type: 'all' | 'course' | 'bundle' = 'all';

    if (this.bundleCourses === 'Bundles') {
      type = 'bundle';
    } else if (this.bundleCourses === 'Courses') {
      type = 'course';
    }

    // Force type=course if category is selected while in "All" view to avoid CastError (Name vs ID)
    if (type === 'all' && this.category && this.category !== 'All Categories') {
      this.bundleCourses = 'Courses';
      type = 'course';
    }

    const params: AdminCatalogParams = {
      type: type,
      page: this.page,
      limit: this.limit,
      search: this.searchText
    };

    // Category mapping: Bundles want ObjectId, Courses want Category Name string
    if (this.category && this.category !== 'All Categories') {
      if (type === 'bundle') {
        const catObj = this.categoriesList.find(c => c.categoryName === this.category);
        if (catObj) {
          params.category = catObj._id;
        } else {
          // If we can't find the ID for a bundle search, don't send the category to avoid CastError
          delete params.category;
        }
      } else {
        // For course searches, the backend expects the category name string
        params.category = this.category;
      }
    }

    // Status mapping: Courses want Published/Unpublished, Bundles want Active/Inactive
    if (this.status && this.status !== 'All Status') {
      if (type === 'bundle') {
        params.status = this.status;
      } else {
        // Map UI "Active" -> "Published" for backend course filter logic
        params.status = (this.status === 'Active') ? 'Published' : 'Unpublished';
      }
    }

    // Price mapping: Only applicable for bundles in the current backend controller
    if (type === 'bundle' && this.priceRange !== 'Price Range') {
      if (this.priceRange === '$0 - $50') {
        params.priceMin = 0;
        params.priceMax = 50;
      } else if (this.priceRange === '$50 - $100') {
        params.priceMin = 50;
        params.priceMax = 100;
      } else if (this.priceRange === '$100+') {
        params.priceMin = 100;
      }
    }

    this.fetchCourses(params);
  }

  goBack() {
    history.back();
  }

  fetchCategories() {
    this.isCategoriesLoading = true;
    this.categoryService.getAllCategories(1, 100).subscribe({
      next: (res: ApiCategoryListResponse) => {
        this.categoriesList = res.data || [];
        this.isCategoriesLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isCategoriesLoading = false;
      }
    });
  }

  onCategoryChange(categoryId?: string) {
    const catId = categoryId ?? this.addCourseForm.category;
    if (!catId) return;

    this.addCourseForm.subCategory = '';
    this.addCourseForm.ageGroup = '';
    this.addCourseForm.level = '';
    this.subCategoriesList = [];
    this.ageGroupsList = [];
    this.levelsList = [];

    this.isMetaLoading = true;

    this.categoryService.getAllCategorySubgroups(catId).subscribe({
      next: (res: CategorySubGroupsResponse) => {
        this.subCategoriesList = res.data || [];
      },
      error: (err) => {
        console.error('subgroups error', err);
        this.addCourseForm.category = ''; // Reset if failed?
      }
    });

    this.categoryService.getAllCategoryAgeGroups(catId).subscribe({
      next: (res: CategoryAgeGroupsResponse) => {
        this.ageGroupsList = res.data || [];
      },
      error: (err) => console.error('agegroups error', err)
    });

    this.categoryService.getAllCategoryLevels(catId).subscribe({
      next: (res: CategoryLevelsResponse) => {
        this.levelsList = res.data || [];
        this.isMetaLoading = false;
      },
      error: (err) => {
        console.error('levels error', err);
        this.isMetaLoading = false;
      }
    });
  }

  onBundleCategoryChange(preserveValues = false) {
    const catId = this.bundleForm.category;
    if (!catId) return;

    // reset selected values if not preserving
    if (!preserveValues) {
      this.bundleForm.subCategory = [];
      this.bundleForm.ageGroup = [];
      this.bundleForm.level = [];

      this.bundleSubCategoryToAdd = '';
      this.bundleAgeGroupToAdd = '';
      this.bundleLevelToAdd = '';
    }

    // clear lists
    this.bundleSubCategoriesList = [];
    this.bundleAgeGroupsList = [];
    this.bundleLevelsList = [];
    this.availableCoursesForBundle = []; // Force re-fetch on new category
    if (this.showBundleCoursesPanel) {
      this.fetchBundleCourses();
    }

    this.isBundleMetaLoading = true;

    this.categoryService.getAllCategorySubgroups(catId).subscribe({
      next: (res: CategorySubGroupsResponse) => {
        this.bundleSubCategoriesList = res.data || [];
      },
      error: (err) => console.error('bundle subgroups error', err)
    });

    this.categoryService.getAllCategoryAgeGroups(catId).subscribe({
      next: (res: CategoryAgeGroupsResponse) => {
        this.bundleAgeGroupsList = res.data || [];
      },
      error: (err) => console.error('bundle agegroups error', err)
    });

    this.categoryService.getAllCategoryLevels(catId).subscribe({
      next: (res: CategoryLevelsResponse) => {
        this.bundleLevelsList = res.data || [];
        this.isBundleMetaLoading = false;
      },
      error: (err) => {
        console.error('bundle levels error', err);
        this.isBundleMetaLoading = false;
      }
    });
  }

  addBundleSubCategory() {
    const v = (this.bundleSubCategoryToAdd || '').trim();
    if (!v) return;
    const exists = this.bundleForm.subCategory.some(x => x.toLowerCase() === v.toLowerCase());
    if (!exists) {
      this.bundleForm.subCategory.push(v);
      this.fetchBundleCourses();
    }
    this.bundleSubCategoryToAdd = '';
  }
  removeBundleSubCategory(i: number) {
    this.bundleForm.subCategory.splice(i, 1);
    this.fetchBundleCourses();
  }

  addBundleAgeGroup() {
    const v = (this.bundleAgeGroupToAdd || '').trim();
    if (!v) return;
    const exists = this.bundleForm.ageGroup.some(x => x.toLowerCase() === v.toLowerCase());
    if (!exists) {
      this.bundleForm.ageGroup.push(v);
      this.fetchBundleCourses();
    }
    this.bundleAgeGroupToAdd = '';
  }
  removeBundleAgeGroup(i: number) {
    this.bundleForm.ageGroup.splice(i, 1);
    this.fetchBundleCourses();
  }

  addBundleLevel() {
    const v = (this.bundleLevelToAdd || '').trim();
    if (!v) return;
    const exists = this.bundleForm.level.some(x => x.toLowerCase() === v.toLowerCase());
    if (!exists) {
      this.bundleForm.level.push(v);
      this.fetchBundleCourses();
    }
    this.bundleLevelToAdd = '';
  }
  removeBundleLevel(i: number) {
    this.bundleForm.level.splice(i, 1);
    this.fetchBundleCourses();
  }

  showBundleCoursesPanel = false;
  bundleCourseToAdd = '';

  openBundleCoursesPanel() {
    this.showBundleCoursesPanel = true;
    if (this.availableCoursesForBundle.length === 0) {
      this.fetchBundleCourses();
    }
  }

  fetchBundleCourses() {
    this.isLoadingBundleCourses = true;
    const categoryId = this.bundleForm.category;
    const categoryObj = this.categoriesList.find(c => c._id === categoryId);
    const categoryName = categoryObj ? categoryObj.categoryName : undefined;

    const filters = {
      category: categoryName,
      subCategory: this.bundleForm.subCategory,
      ageGroup: this.bundleForm.ageGroup,
      level: this.bundleForm.level
    };

    this.adminCourseService.getAllCoursesForBundle(filters).subscribe({
      next: (res) => {
        this.availableCoursesForBundle = (res.data || []).map(c => ({
          id: c._id,
          title: c.courseTitle
        }));
        this.isLoadingBundleCourses = false;
      },
      error: (err) => {
        console.error('Failed to fetch courses for bundle', err);
        this.isLoadingBundleCourses = false;
        this.openStatusModal('Error', 'Failed to load courses', 'Error');
      }
    });
  }

  addCourseToBundle() {
    const courseId = this.bundleCourseToAdd;
    if (!courseId) return;

    const course = this.availableCoursesForBundle.find(c => c.id === courseId);
    if (!course) return;

    const alreadySelected = this.bundleSelectedCourses.some(c => c.id === courseId);
    if (!alreadySelected) {
      this.bundleSelectedCourses.push({ ...course });
    }
    this.bundleCourseToAdd = '';
  }

  removeBundleCourse(index: number) {
    this.bundleSelectedCourses.splice(index, 1);
  }

  openCourseMenuId: string | null = null;

  @HostListener('document:click')
  onDocClick() {
    this.openCourseMenuId = null;
  }

  goToCourseDetail(c: CourseCard) {
    this.router.navigate([`${this.basePath}/course-management/course-detail`], { queryParams: { id: c.id } });
  }

  toggleCourseMenu(c: CourseCard, ev: MouseEvent) {
    ev.stopPropagation();
    this.openCourseMenuId = this.openCourseMenuId === c.id ? null : c.id;
  }

  viewCourse(c: CourseCard, ev: MouseEvent) {
    ev.stopPropagation();
    this.openCourseMenuId = null;
    this.router.navigate([`${this.basePath}/course-management/course-detail`], { queryParams: { id: c.id } });
  }

  updateCourse(c: CourseCard, ev: MouseEvent) {
    ev.stopPropagation();
    this.openCourseMenuId = null;
    this.editCourse(c);
  }

  getTitleLine1(c: CourseCard): string {
    const parts = (c.title ?? '').split(' ');
    return parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
  }
  getTitleLine2(c: CourseCard): string {
    const parts = (c.title ?? '').split(' ');
    return parts.slice(Math.ceil(parts.length / 2)).join(' ');
  }

  get pills(): FilterPill[] {
    const list: FilterPill[] = [];
    if (this.category && this.category !== 'All Categories')
      list.push({ key: 'category', label: this.category, color: 'purple' });
    if (this.status && this.status !== 'All Status')
      list.push({ key: 'status', label: this.status, color: 'green' });
    return list;
  }

  removePill(p: FilterPill) {
    if (p.key === 'category') this.category = 'All Categories';
    if (p.key === 'status') this.status = 'All Status';
    this.onFilterChange();
  }

  clearFilters() {
    this.category = 'All Categories';
    this.status = 'All Status';
    this.priceRange = 'Price Range';
    this.bundleCourses = 'All';
    this.searchText = '';
    this.onFilterChange();
  }

  toggleActive(c: CourseCard) {
    if (this.visibilityLoading[c.id]) return;

    this.visibilityLoading[c.id] = true;
    const oldState = c.isActive;
    c.isActive = !c.isActive; // Optimistic UI update

    this.adminCourseService.toggleCourseVisibility(c.id).subscribe({
      next: (res) => {
        this.visibilityLoading[c.id] = false;
        this.openStatusModal('Success', res.message || 'Visibility updated', 'Success');
      },
      error: (err) => {
        this.visibilityLoading[c.id] = false;
        c.isActive = oldState; // Revert UI
        this.openStatusModal('Error', err.error?.message || err.message, 'Error');
      }
    });
  }

  goToViewCategories() {
    this.router.navigate([`${this.basePath}/course-management/view-category`]);
  }

  manageBundles() {
    this.showBundlePricing = true;
    this.closeAddMenu();
  }
  closeBundlePricing() {
    this.showBundlePricing = false;
  }

  onEditBundle(bundleData: any) {
    this.closeBundlePricing();
    this.showCreateBundlePopup = true;
    this.editingBundleId = bundleData._id;
    this.isCreatingBundle = true; // Use as loading state for now

    this.courseBundleService.getSingleBundle(this.editingBundleId!).subscribe({
      next: (res) => {
        this.isCreatingBundle = false;
        const data = res.data;
        if (!data) return;

        // Populate bundleForm with FRESH data
        this.bundleForm.bundleName = data.bundleName;
        this.bundleForm.price = String(data.price);

        // Handle Category
        if (data.category && typeof data.category === 'object') {
          this.bundleForm.category = data.category._id;
          this.onBundleCategoryChange(true);
        } else {
          this.bundleForm.category = data.category;
          this.onBundleCategoryChange(true);
        }

        const subs = data.subCategory || data.subCateogory || [];
        this.bundleForm.subCategory = Array.isArray(subs) ? subs : [subs];

        const ages = data.ageGroup;
        this.bundleForm.ageGroup = Array.isArray(ages) ? ages : (ages ? [ages] : []);

        const levels = data.level;
        this.bundleForm.level = Array.isArray(levels) ? levels : (levels ? [levels] : []);

        this.bundleForm.access = String(data.access || '');
        this.bundleForm.discount = String(data.discount || '');
        this.bundleForm.couponCode = data.couponCode || '';
        this.bundleForm.description = data.description || '';
        this.bundleForm.visibility = (data.visibility === 'Active' || data.visibility === 'active') ? 'Active' : 'Inactive';

        // Thumbnail
        this.bundleThumbPreview = data.thumbnail || data.bundleThumbnail?.secureUrl || null;
        this.bundleForm.thumbnail = null;

        // Selected Courses
        this.bundleSelectedCourses = [];
        if (Array.isArray(data.courses)) {
          this.bundleSelectedCourses = data.courses.map((c: any) => ({
            id: c._id,
            title: c.courseTitle,
            type: 'Single Course',
            level: c.courseLevel,
            price: parseFloat(c.coursePrice) || 0,
            isActive: c.courseVisibility,
            imgUrl: c.courseThumbnail?.secureUrl || ''
          }));
        }
      },
      error: (err) => {
        this.isCreatingBundle = false;
        console.error('Failed to fetch bundle details', err);
        this.openStatusModal('Error', 'Failed to fetch bundle details', 'Error');
      }
    });
  }

  toggleAddMenu() {
    this.showAddMenu = !this.showAddMenu;
  }
  closeAddMenu() {
    this.showAddMenu = false;
  }

  addNewCourse() {
    this.closeAddMenu();
    this.openCourseCreatePopup();
  }

  createBundle() {
    this.closeAddMenu();
    this.openPopup('bundle');
  }

  openPopup(type: 'addCourse' | 'bundle') {
    this.closeAllPopups();
    if (type === 'addCourse') this.openCourseCreatePopup();
    if (type === 'bundle') this.showCreateBundlePopup = true;
  }

  closeAllPopups() {
    if (this.isCreatingCourse) return;
    this.showAddCoursePopup = false;
    this.showCreateBundlePopup = false;
    this.editingCourse = null;
    this.editingBundleId = null;
    this.resetCourseForm();
    this.showBundleCoursesPanel = false;
    this.bundleCourseToAdd = '';
    this.bundleSelectedCourses = [];
    this.resetBundleForm();
  }

  private resetBundleForm() {
    this.bundleForm = {
      thumbnail: null,
      bundleName: '',
      price: '',
      category: '',
      subCategory: [] as string[],
      ageGroup: [] as string[],
      level: [] as string[],
      access: '',
      discount: '',
      couponCode: '',
      description: '',
      visibility: 'Active' as 'Active' | 'Inactive',
    };
    this.bundleSubCategoryToAdd = '';
    this.bundleAgeGroupToAdd = '';
    this.bundleLevelToAdd = '';
    this.bundleSubCategoriesList = [];
    this.bundleAgeGroupsList = [];
    this.bundleLevelsList = [];
    if (this.bundleThumbPreview && this.bundleThumbPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.bundleThumbPreview);
    }
    this.bundleThumbPreview = null;
  }

  private resetCourseForm() {
    this.addCourseForm = {
      thumbnail: null,
      title: '',
      level: '',
      category: '',
      price: '',
      subCategory: '',
      ageGroup: '',
      outlinePdf: null,
      access: '',
      enrollmentType: 'live'
    };
    this.subCategoriesList = [];
    this.ageGroupsList = [];
    this.levelsList = [];
    if (this.courseThumbPreview && this.courseThumbPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.courseThumbPreview);
    }
    this.courseThumbPreview = null;
    this.outlinePdfMeta = null;
  }

  private openCourseCreatePopup() {
    this.editingCourse = null;
    this.resetCourseForm();
    this.showAddCoursePopup = true;
  }

  private openCourseEditPopup(course: CourseCard) {
    this.editingCourse = course;
    this.addCourseForm.title = course.title || '';
    this.addCourseForm.level = course.level || '';
    this.addCourseForm.price = String(course.price ?? '');
    this.addCourseForm.category = '';
    this.addCourseForm.subCategory = '';
    this.addCourseForm.ageGroup = '';
    this.addCourseForm.access = '';
    this.courseThumbPreview = course.imgUrl || null;
    this.showAddCoursePopup = true;
  }

  onCourseThumbSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    this.addCourseForm.thumbnail = file;
    if (this.courseThumbPreview && this.courseThumbPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.courseThumbPreview);
    }
    this.courseThumbPreview = URL.createObjectURL(file);
    input.value = '';
  }

  onBundleThumbSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    this.bundleForm.thumbnail = file;
    if (this.bundleThumbPreview && this.bundleThumbPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.bundleThumbPreview);
    }
    this.bundleThumbPreview = URL.createObjectURL(file);
    input.value = '';
  }

  private formatBytes(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  onOutlineSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      input.value = '';
      return;
    }
    this.addCourseForm.outlinePdf = file;
    this.outlinePdfMeta = { name: file.name, sizeLabel: this.formatBytes(file.size) };
    input.value = '';
  }

  removeOutlinePdf(ev?: Event) {
    ev?.preventDefault();
    ev?.stopPropagation();
    this.addCourseForm.outlinePdf = null;
    this.outlinePdfMeta = null;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.isCreatingCourse) return;
    this.closeAddMenu();
    this.closeAllPopups();
    this.showDeleteModal = false;
    this.showBundlePricing = false;
    this.openCourseMenuId = null;
  }

  editCourse(c: CourseCard) {
    this.openCourseEditPopup(c);
  }

  deleteCourse(c: CourseCard) {
    this.courseToDelete = c;
    this.showDeleteModal = true;
    this.closeAddMenu();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.courseToDelete = null;
  }

  confirmDelete() {
    if (!this.courseToDelete) return;
    // Implementation for delete would go here
    this.cancelDelete();
  }

  createCourseNow() {
    if (this.isEditMode) return;

    if (!this.addCourseForm.title || !this.addCourseForm.category || !this.addCourseForm.subCategory ||
      !this.addCourseForm.level || !this.addCourseForm.ageGroup || !this.addCourseForm.price ||
      !this.addCourseForm.thumbnail || !this.addCourseForm.outlinePdf) {
      this.openStatusModal('Error', 'Please fill all required fields and upload both files', 'Error');
      return;
    }

    const categoryObj = this.categoriesList.find(c => c._id === this.addCourseForm.category);
    if (!categoryObj) return;

    this.isCreatingCourse = true;
    this.courseService.createCourse({
      courseTitle: this.addCourseForm.title,
      courseCategory: categoryObj.categoryName,
      courseSubCategory: this.addCourseForm.subCategory,
      courseLevel: this.addCourseForm.level,
      courseAgeGroup: this.addCourseForm.ageGroup,
      courseAccess: this.addCourseForm.access || 'Free',
      coursePrice: this.addCourseForm.price,
      courseEnrollementType: this.addCourseForm.enrollmentType,
      thumbnailFile: this.addCourseForm.thumbnail!,
      outlinePdf: this.addCourseForm.outlinePdf!
    }).subscribe({
      next: (res) => {
        this.isCreatingCourse = false;
        this.openStatusModal('Success', res.message, 'Success');
        this.closeAllPopups();
        this.onFilterChange(); // Refresh catalog with current filters
      },
      error: (err) => {
        this.isCreatingCourse = false;
        this.openStatusModal('Error', err.error?.message || err.message, 'Error');
      }
    });
  }

  createBundleNow() {
    if (this.editingBundleId) {
      this.updateBundleNow();
      return;
    }

    if (!this.bundleForm.bundleName) {
      this.openStatusModal('Error', 'Please enter bundle name', 'Error');
      return;
    }

    this.isCreatingBundle = true;
    const formData = new FormData();

    // Map according to payload requirement
    formData.append('bundleName', this.bundleForm.bundleName);
    formData.append('price', this.bundleForm.price || '0');
    formData.append('category', this.bundleForm.category);
    formData.append('ageGroup', this.bundleForm.ageGroup[0] || ''); // Send first as string
    formData.append('access', this.bundleForm.access || '0');
    formData.append('description', this.bundleForm.description);
    console.log('Sending Bundle Description:', this.bundleForm.description);
    formData.append('discount', this.bundleForm.discount || '0');
    formData.append('couponCode', this.bundleForm.couponCode);
    formData.append('visibility', this.bundleForm.visibility);

    // Arrays
    this.bundleForm.subCategory.forEach(s => formData.append('subcategory', s));
    this.bundleForm.level.forEach(l => formData.append('level', l));

    // Course IDs
    this.bundleSelectedCourses.forEach(c => formData.append('courses', c.id));

    if (this.bundleForm.thumbnail) {
      formData.append('profilePicture', this.bundleForm.thumbnail);
    }

    this.courseBundleService.createBundle(formData).subscribe({
      next: (res) => {
        this.isCreatingBundle = false;
        this.openStatusModal('Success', res.message || 'Bundle created successfully', 'Success');
        this.closeAllPopups();
        this.fetchCourses(); // Refresh catalog
      },
      error: (err) => {
        this.isCreatingBundle = false;
        this.openStatusModal('Error', err.error?.message || 'Failed to create bundle', 'Error');
      }
    });
  }

  updateBundleNow() {
    if (!this.editingBundleId) return;

    this.isCreatingBundle = true;
    const formData = new FormData();

    if (this.bundleForm.bundleName) formData.append('bundleName', this.bundleForm.bundleName);
    if (this.bundleForm.price) formData.append('price', this.bundleForm.price);
    if (this.bundleForm.category) formData.append('category', this.bundleForm.category);

    if (this.bundleForm.ageGroup.length) formData.append('ageGroup', this.bundleForm.ageGroup[0]);

    if (this.bundleForm.access) formData.append('access', this.bundleForm.access);
    formData.append('description', this.bundleForm.description);
    console.log('Sending Bundle Description:', this.bundleForm.description);
    if (this.bundleForm.discount) formData.append('discount', this.bundleForm.discount);
    formData.append('couponCode', this.bundleForm.couponCode);
    if (this.bundleForm.visibility) formData.append('visibility', this.bundleForm.visibility);

    this.bundleForm.subCategory.forEach(s => formData.append('subcategory', s));
    this.bundleForm.level.forEach(l => formData.append('level', l));

    this.bundleSelectedCourses.forEach(c => formData.append('courses', c.id));

    if (this.bundleForm.thumbnail) {
      formData.append('profilePicture', this.bundleForm.thumbnail);
    }

    this.courseBundleService.updateBundle(this.editingBundleId, formData).subscribe({
      next: (res) => {
        this.isCreatingBundle = false;
        this.openStatusModal('Success', res.message || 'Bundle updated successfully', 'Success');
        this.closeAllPopups();
        this.fetchCourses(); // Refresh catalog
      },
      error: (err) => {
        this.isCreatingBundle = false;
        this.openStatusModal('Error', err.error?.message || 'Failed to update bundle', 'Error');
      }
    });
  }

  openStatusModal(title: string, message: string, type: 'Success' | 'Error') {
    this.statusModalTitle = title;
    this.statusModalMessage = message;
    this.statusModalType = type;
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
  }
}
