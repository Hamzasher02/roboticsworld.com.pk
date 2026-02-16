import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { getAdminBasePath } from '../../../../../core/config/admin-routes.config';
import { AdminCourseService } from '../../../../../core/services/admin/course/admin-course.service';
import { CategoryService } from '../../../../../core/services/admin/category/category.service';
import { finalize } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { StatusModalComponent } from '../../../../../shared/components/status-modal/status-modal.component';

/* =========================
  Types (Professional)
========================= */

type SectionStatus = 'complete' | 'incomplete';
type ModulesStatus = 'complete' | 'partial' | 'incomplete';

type MaterialsTab = 'recorded' | 'pdf';
type MaterialsModalKind = 'recorded' | 'pdf';
type AttachPickKind = 'video' | 'doc' | null;

type ModuleStatus = 'complete' | 'incomplete';
type CompletionStepKey = 'basic' | 'overview' | 'outcomes' | 'modules' | 'materials';
type CompletionStepState = 'complete' | 'current' | 'incomplete';

interface CompletionStepUI {
  key: CompletionStepKey;
  label: string;
  state: CompletionStepState;
}

interface CourseProgress {
  completionPercent: number; // overall computed (we keep but don’t trust manual values)
  sectionTitle: string;
  sectionStatus: SectionStatus; // Basic section status
  completedFields: number; // Basic fields
  totalFields: number; // Basic fields
}

interface BasicInfoForm {
  title: string;
  category: string;
  subCategory: string;
  ageGroup: string;
  price: number | null;
  currency: string;
  thumbnailUrl: string;
  courseAccess: string;
  courseEnrollementType: 'live' | 'recorded';
  courseVisibility: boolean; // Added
}

interface CourseOverviewForm {
  status: SectionStatus;
  completedFields: number;
  totalFields: number;
  description: string;
  duration: number | null;
  durationUnit: 'weeks' | 'days' | 'months';
  level: string;
  prerequisites: string;
  targetAudience: string;
}

interface LearningOutcomesForm {
  status: SectionStatus;
  completedFields: number;
  totalFields: number;
  minOutcomes: number;
  items: { id: string; description: string }[];
}

interface ModuleMaterial {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
  blobUrl?: string;
}

interface ModuleMaterialDraft {
  file: File;
  pickedAt: string;
}

interface CourseModuleItem {
  id: string;
  title: string;
  status: ModuleStatus;
  expanded: boolean;
  isNew?: boolean;

  description: string;
  sessions: number | null;
  durationMinutes: number | null;

  materials: ModuleMaterial[];
  draftMaterials: ModuleMaterialDraft[];
}

interface CourseModulesSection {
  status: ModulesStatus;
  completedModules: number;
  totalModules: number;
  items: CourseModuleItem[];
}

interface MaterialsModuleRow {
  id: string;
  title: string;
  files: ModuleMaterial[];
}

/* =========================
  Instructors
========================= */

type InstructorAvailability = 'Available' | 'Assigned';

interface InstructorItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  specialization: string;
  experienceYears: number | null;
  rating: number | null;
  ratingText?: string;
  studentsCount: number | null;
  coursesCount: number | null;
  weeklyHoursText: string;
  assignedDateText?: string;
  lastActiveText?: string;
  availabilityText?: string;
  preferredCourses: string[];
  skillsLine: string;
  status: InstructorAvailability;
}

/**
 * Interface matching the EXACT shape of the API response data[0]
 */
interface ApiCourseDetail {
  _id: string;
  courseTitle: string;
  courseCategory: string[];
  courseSubCategory: string;
  courseAgeGroup: string;
  courseLevel: string;
  courseAccess: string;
  coursePrice: string;
  courseThumbnail?: { secureUrl: string };
  courseOverview?: {
    courseDescription?: string;
    courseDuration?: string;
    coursePrerequisite?: string;
    courseTargetAudience?: string;
    courseLevel?: string;
  };
  learningOutcomes?: any[];
  courseModules?: any[];
  assignedInstructors?: any[];
  courseEnrollementType?: 'live' | 'recorded';
  courseVisibility?: boolean; // Added
  // Fallbacks for direct root access
  courseDescription?: string;
  courseDuration?: string;
  coursePrerequisite?: string;
  courseTargetAudience?: string;
}

type InstructorConfirmAction = 'assign_instructor' | 'assign_course' | 'remove_instructor';

interface CourseDetailsSnapshot {
  progress: CourseProgress;
  requiredFieldsTotal: number;

  basicInfo: BasicInfoForm;
  courseOverview: CourseOverviewForm;
  learningOutcomes: LearningOutcomesForm;

  courseModules: CourseModulesSection;
  materialsTab: MaterialsTab;

  assignedInstructors: InstructorItem[];
  availableInstructors: InstructorItem[];

  instructorSort: 'rating_desc' | 'rating_asc';
  showInstructorFilters: boolean;
}



@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusModalComponent],
  templateUrl: './course-details.component.html',
  styles: [],
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('renameInput') renameInput!: ElementRef<HTMLInputElement>;
  courseId: string | null = null;
  isLoading = false;
  isAddingOutcome = false;

  // Modal State
  showModal = false;
  modalTitle: 'Success' | 'Error' = 'Success';
  modalMessage = '';
  modalType: 'Success' | 'Error' = 'Success';

  // Rename Modal State
  showRenameModal = false;
  renameInputValue = '';
  renameIndex = -1;
  renameType: 'selected' | 'material' | null = null;
  isRenaming = false;
  isDeleting = false;
  redirectOnModalClose = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminCourseService: AdminCourseService,
    private categoryService: CategoryService
  ) { }

  private selectedThumbnail: File | null = null;
  private deletedOutcomeIds: string[] = [];

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchAllCourseNames(); // Initialize name mapping
    this.route.queryParamMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        this.loadCourseDetails(this.courseId);
      } else {
        // Fallback or legacy init
        this.initEmptyState();
      }
    });
  }

  private courseNameMap: Record<string, string> = {};

  private fetchAllCourseNames(): void {
    // Fetch a large chunk of catalog to build ID->Name map
    this.adminCourseService.getAdminCatalog({ type: 'course', page: 1, limit: 200 }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.courses) {
          res.data.courses.forEach((c: any) => {
            if (c._id && c.courseTitle) {
              this.courseNameMap[c._id] = c.courseTitle;
            }
          });
        }
      },
      error: (err) => console.error('Failed to pre-fetch course names', err)
    });
  }

  private fetchCategories(): void {
    this.categoryService.getAllCategories(1, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = ['Select category', ...res.data.map(c => c.categoryName)];
          this.fullCategories = res.data;

          // Populate lists if category already exists
          if (this.basicInfo.category && this.basicInfo.category !== 'Select category') {
            this.updateCategoryDynamicLists(this.basicInfo.category);
          }
        }
      },
      error: (err) => console.error('Failed to fetch categories', err)
    });
  }

  // Helper to get category ID by name
  private getCategoryIdByName(name: string): string | null {
    const cat = this.fullCategories.find(c => c.categoryName === name);
    return cat ? cat._id : null;
  }

  private initEmptyState(): void {
    this.recalcBasicInfoProgress();
    this.recalcCourseOverview();
    this.recalcLearningOutcomes();
    this.recalcCourseModules();
    this.syncMaterialsFromModules();
    this.recalcOverallProgress();
    this.captureInitialSnapshot();
  }

  private loadCourseDetails(id: string): void {
    this.isLoading = true;
    this.adminCourseService.getCourseById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.length > 0) {
            try {
              const courseData = res.data[0] as ApiCourseDetail;
              this.mapCourseData(courseData);
              // Fetch instructors from separate APIs
              this.fetchAvailableInstructors(id);
              this.fetchAssignedInstructors(id);
            } catch (err) {
              console.error('Error mapping course data:', err);
            }
          }
        },
        error: (err) => {
          console.error('Failed to load course details', err);
        }
      });
  }

  private fetchAvailableInstructors(courseId: string): void {
    this.adminCourseService.getAvailableInstructors(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableInstructors = res.data.map((i: any) => this.mapInstructor(i, 'Available'));
        }
      },
      error: (err) => {
        console.error('Failed to fetch available instructors', err);
      }
    });
  }

  private fetchAssignedInstructors(courseId: string): void {
    this.adminCourseService.getAssignedInstructors(courseId).subscribe({
      next: (res) => {
        console.log('Assigned InstructorsAPI:', res);
        if (res.success && res.data) {
          // Response data expected to be array of instructor items
          this.assignedInstructors = res.data.map((i: any) => this.mapInstructor(i, 'Assigned'));
        }
      },
      error: (err) => {
        console.error('Failed to fetch assigned instructors', err);
      }
    });
  }

  private mapInstructor(item: any, status: InstructorAvailability, assignedAt?: string): InstructorItem {
    // Both APIs return Instructor objects with nested user
    const isInstructorModel = !!(item.qualification || item.degreeTitle);
    const userData = isInstructorModel ? (item.user || {}) : item;
    const instructorProfile = isInstructorModel ? item : null;

    const fullName = (userData.firstName || userData.lastName)
      ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      : (userData.name || '—');

    let assignedDateText = '—';
    if (status === 'Assigned' && assignedAt) {
      assignedDateText = new Date(assignedAt).toLocaleDateString();
    }

    // Map IDs to Names from our local map
    const preferredNames = (instructorProfile?.coursePreferences || []).map((cp: any) => {
      const id = cp._id || cp.id || cp;
      if (cp.courseTitle) return cp.courseTitle;
      if (id === this.courseId) return this.basicInfo.title || 'Current Course';
      return this.courseNameMap[id] || id; // Fallback to ID if name not found
    });

    // Formatting Availability
    // Formatting Availability & Calculating Weekly Hours
    let availabilityText = '—';
    let weeklyHoursText = '—';

    if (instructorProfile?.availability && Array.isArray(instructorProfile.availability) && instructorProfile.availability.length > 0) {
      let totalMinutes = 0;
      const parts = instructorProfile.availability.map((slot: any) => {
        const days = Array.isArray(slot.days) ? slot.days.join(', ') : slot.days;

        if (slot.startTime && slot.endTime) {
          const [startH, startM] = slot.startTime.split(':').map(Number);
          const [endH, endM] = slot.endTime.split(':').map(Number);
          const startMins = startH * 60 + startM;
          const endMins = endH * 60 + endM;
          let duration = endMins - startMins;
          if (duration < 0) duration += 24 * 60;

          const daysCount = Array.isArray(slot.days) ? slot.days.length : 0;
          totalMinutes += duration * daysCount;
        }

        return `${days} : ${slot.startTime} - ${slot.endTime}`;
      });

      availabilityText = parts.join(' | ');

      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0 || mins > 0) {
        weeklyHoursText = `${hours} hrs${mins > 0 ? ' ' + mins + ' mins' : ''}/week`;
      } else {
        weeklyHoursText = '0 hrs/week';
      }
    }

    // Experience calculation
    let experienceYears = 0;
    if (instructorProfile?.graduationYear) {
      const gradYear = Number(instructorProfile.graduationYear);
      if (!isNaN(gradYear)) {
        experienceYears = new Date().getFullYear() - gradYear;
      }
    }

    return {
      id: userData._id || item._id || '',
      name: fullName,
      email: userData.email || '—',
      avatarUrl: userData.profilePicture?.secureUrl,
      specialization: instructorProfile?.qualification || instructorProfile?.degreeTitle || userData.bio || '—',
      experienceYears: experienceYears,
      rating: instructorProfile?.rating || null,
      ratingText: instructorProfile?.rating ? String(instructorProfile.rating) : undefined,
      studentsCount: null,
      coursesCount: null,
      weeklyHoursText: weeklyHoursText,
      assignedDateText: assignedDateText,
      lastActiveText: '—',
      availabilityText: availabilityText,
      preferredCourses: preferredNames,
      skillsLine: '',
      status: status
    };
  }

  private mapCourseData(data: ApiCourseDetail): void {
    // 1. Basic Info Mapping
    // Mismatch identified: API sends courseCategory as array, but dropdown expects string name.
    this.basicInfo = {
      title: data.courseTitle || '',
      category: Array.isArray(data.courseCategory) ? (data.courseCategory[0] || '') : (data.courseCategory || ''),
      subCategory: data.courseSubCategory || '',
      ageGroup: data.courseAgeGroup || '',
      price: parseFloat(data.coursePrice) || 0,
      currency: 'USD',
      thumbnailUrl: data.courseThumbnail?.secureUrl || 'assets/admin/course-manage/courses.svg',
      courseAccess: data.courseAccess || '',
      courseEnrollementType: data.courseEnrollementType || 'recorded',
      courseVisibility: data.courseVisibility || false // Added
    };

    // 2. Course Overview Mapping
    // Mismatch identified: UI form was missing these or looking at root instead of nested courseOverview.
    const ov = data.courseOverview || {};
    this.courseOverview = {
      status: 'incomplete',
      completedFields: 0,
      totalFields: 5,
      // Nested fields + root fallbacks with safe defaults
      description: ov.courseDescription ?? data.courseDescription ?? '',
      duration: ov.courseDuration ? parseFloat(ov.courseDuration) : (data.courseDuration ? parseFloat(data.courseDuration) : null),
      durationUnit: 'weeks',
      level: data.courseLevel || ov.courseLevel || '',
      prerequisites: ov.coursePrerequisite ?? data.coursePrerequisite ?? '',
      targetAudience: ov.courseTargetAudience ?? data.courseTargetAudience ?? ''
    };

    // 3. Learning Outcomes Mapping
    this.fetchLearningOutcomes(this.courseId!);

    // 4. Modules Mapping - will be fetched via API
    // Fetch modules separately
    this.fetchCourseModules(this.courseId!);

    // 5. Instructors Mapping - Handled via fetchAssignedInstructors separately
    this.assignedInstructors = [];

    // Finalize state
    this.onBasicChanged();
    this.recalcBasicInfoProgress();
    this.recalcCourseOverview();
    this.recalcLearningOutcomes();
    this.recalcCourseModules();
    this.syncMaterialsFromModules();
    this.recalcOverallProgress();
    this.captureInitialSnapshot();
  }

  ngOnDestroy(): void {
    this.revokeAllObjectUrls();
  }

  /* =========================
    WEIGHTED COMPLETION (TOTAL = 23)
    Keep UI same, percent goes up as sections complete.
  ========================= */

  // You can adjust weights later without touching UI.
  private readonly WEIGHT_BASIC = 5; // matches your Basic fields
  private readonly WEIGHT_OVERVIEW = 5; // overview 5 fields
  private readonly WEIGHT_OUTCOMES = 1; // outcomes completion
  private readonly WEIGHT_MODULES = 8; // modules progress (ratio)
  private readonly WEIGHT_MATERIALS = 4; // materials progress (ratio)

  requiredFieldsTotal = 23;

  private overallCompletedWeighted = 0;

  get overallCompletionPercent(): number {
    const total = Math.max(1, this.requiredFieldsTotal);
    const pct = Math.round((this.overallCompletedWeighted / total) * 100);
    return Math.max(0, Math.min(100, pct));
  }

  get requiredFieldsRemaining(): number {
    const total = Math.max(0, Number(this.requiredFieldsTotal || 0));
    const completed = Math.round((this.overallCompletionPercent / 100) * total);
    return Math.max(0, total - completed);
  }

  private recalcOverallProgress(): void {
    // Basic
    const basicDone = this.progress.sectionStatus === 'complete';
    const basicRatio = this.progress.totalFields ? this.progress.completedFields / this.progress.totalFields : 0;
    const basicPoints = Math.round(basicRatio * this.WEIGHT_BASIC);

    // Overview
    const overviewRatio = this.courseOverview.totalFields
      ? this.courseOverview.completedFields / this.courseOverview.totalFields
      : 0;
    const overviewPoints = Math.round(overviewRatio * this.WEIGHT_OVERVIEW);

    // Outcomes
    const outcomesPoints = this.learningOutcomes.status === 'complete' ? this.WEIGHT_OUTCOMES : 0;

    // Modules (ratio of completed modules)
    const modTotal = this.courseModules.totalModules || 0;
    const modRatio = modTotal > 0 ? this.courseModules.completedModules / modTotal : 0;
    const modulesPoints = Math.round(modRatio * this.WEIGHT_MODULES);

    // Materials (ratio of modules that have any saved materials)
    const withAny = (this.courseModules.items ?? []).filter((m) => (m.materials?.length ?? 0) > 0).length;
    const matRatio = modTotal > 0 ? withAny / modTotal : 0;
    const materialsPoints = Math.round(matRatio * this.WEIGHT_MATERIALS);

    const total = basicPoints + overviewPoints + outcomesPoints + modulesPoints + materialsPoints;

    // clamp to requiredFieldsTotal (23)
    this.overallCompletedWeighted = Math.max(0, Math.min(this.requiredFieldsTotal, total));

    // keep your progress.completionPercent synced if you want it anywhere else
    this.progress.completionPercent = this.overallCompletionPercent;

    // Basic label stays
    this.progress.sectionTitle = 'Basic Information';
  }

  /* =========================
    Completion Steps UI (CHIPS)
========================= */

  get completionSteps(): CompletionStepUI[] {
    const stepsBase: Array<{ key: CompletionStepKey; label: string; done: boolean }> = [
      { key: 'basic', label: 'Basic Info', done: this.progress.sectionStatus === 'complete' },
      { key: 'overview', label: 'Course Overview', done: this.courseOverview.status === 'complete' },
      { key: 'outcomes', label: 'Learning Outcomes', done: this.learningOutcomes.status === 'complete' },
      { key: 'modules', label: 'Course Modules', done: this.courseModules.status === 'complete' },
      { key: 'materials', label: 'Course Materials', done: this.courseMaterialsStatus === 'complete' },
    ];

    const firstIncompleteIndex = stepsBase.findIndex((x) => !x.done);

    return stepsBase.map((s, idx) => {
      let state: CompletionStepState = 'incomplete';
      if (s.done) state = 'complete';
      else if (firstIncompleteIndex === idx) state = 'current';
      return { key: s.key, label: s.label, state };
    });
  }

  trackByStepKey(_i: number, s: CompletionStepUI): string {
    return s.key;
  }

  chipClass(s: CompletionStepUI): string {
    // same palette, but now dynamic:
    if (s.state === 'complete') return 'bg-[#DCFCE7] text-[#166534]';
    if (s.state === 'current') return 'bg-[#F3D7F0] text-[#7C1F6A]';
    return 'bg-[#FEE2E2] text-[#B91C1C]';
  }

  /* =========================
    API READY PLACEHOLDERS
  ========================= */

  async onSaveDraft(): Promise<void> {
    this.isLoading = true;
    try {
      // 1. Save Basic Information & Overview (Create if new, Update if exists)
      await this.saveBasicInfoSync();

      // 2. Save Learning Outcomes (Only if course exists, handled inside)
      await this.saveLearningOutcomesSync();

      // TODO: Save Modules if API exists (usually instant-save)

      this.captureInitialSnapshot();
      this.openModal('Success', 'Course saved successfully');
      this.selectedThumbnail = null;
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to save draft';
      this.openModal('Error', msg);
    } finally {
      this.isLoading = false;
    }
  }

  /* ---------------- Basic Info Manual Save ---------------- */

  async saveBasicInfoSync(): Promise<void> {
    const fd = new FormData();
    fd.append('courseTitle', (this.basicInfo.title || '').trim());
    fd.append('courseCategory', (this.basicInfo.category || '').trim());
    fd.append('courseSubCategory', (this.basicInfo.subCategory || '').trim());
    fd.append('courseAgeGroup', (this.basicInfo.ageGroup || '').trim());
    fd.append('courseLevel', (this.courseOverview.level || '').trim());
    fd.append('courseAccess', (this.basicInfo.courseAccess || '').trim());
    fd.append('coursePrice', String(this.basicInfo.price || 0));

    fd.append('courseDescription', (this.courseOverview.description || '').trim());
    fd.append('courseDuration', String(this.courseOverview.duration || ''));
    fd.append('coursePrerequisite', (this.courseOverview.prerequisites || '').trim());
    fd.append('courseTargetAudience', (this.courseOverview.targetAudience || '').trim());
    fd.append('courseEnrollementType', this.basicInfo.courseEnrollementType);

    if (this.selectedThumbnail) {
      fd.append('files', this.selectedThumbnail);
    }

    if (this.courseId) {
      // UPDATE
      const res = await this.adminCourseService.updateCourseBasicInfo(this.courseId, fd).toPromise();
      if (!res.success) throw new Error(res.message || 'Failed to save basic info');
    } else {
      // CREATE
      const res = await this.adminCourseService.createCourse(fd).toPromise();
      if (!res.success) throw new Error(res.message || 'Failed to create course');

      // Update ID and URL
      if (res.data && res.data._id) {
        this.courseId = res.data._id;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { id: this.courseId },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    }
  }

  async saveLearningOutcomesSync(): Promise<void> {
    const cid = this.courseId;
    if (!cid) return;

    // 1. Delete marked outcomes
    for (const id of this.deletedOutcomeIds) {
      try {
        await this.adminCourseService.deleteLearningOutcome(cid, id).toPromise();
      } catch (e) {
        console.error('Delete outcome failed', id, e);
      }
    }
    this.deletedOutcomeIds = [];

    // 2. Create or Update remaining ones
    const promises = this.learningOutcomes.items.map(item => {
      if (item.id) {
        // Update existing (only if it has content, but we'll try regardless)
        return this.adminCourseService.updateLearningOutcome(cid, item.id, item.description).toPromise();
      } else if (item.description.trim().length > 0) {
        // Create new (only if it has description)
        return this.adminCourseService.createLearningOutcome(cid, item.description).toPromise();
      }
      return Promise.resolve();
    });

    await Promise.all(promises);

    // Refresh outcomes to get new IDs
    await this.fetchLearningOutcomesSync(cid);
  }

  private async fetchLearningOutcomesSync(courseId: string): Promise<void> {
    const res = await this.adminCourseService.getCourseLearningOutcomes(courseId).toPromise();
    if (res?.success && res.data) {
      this.learningOutcomes.items = res.data.map((o: any) => ({
        id: o._id || '',
        description: o.outcomeDescription || ''
      }));
      this.onOutcomesChanged();
    }
  }

  onSaveBasicClick(): void {
    if (!this.courseId) {
      this.openModal('Error', 'Please save basic course info first.');
      return;
    }
    this.isLoading = true;
    this.saveBasicInfoSync()
      .then(() => {
        this.openModal('Success', 'Basic information updated');
        this.selectedThumbnail = null;
        this.captureInitialSnapshot();
      })
      .catch(err => {
        const msg = err?.error?.message || err?.message || 'Failed to update basic info';
        this.openModal('Error', msg);
      })
      .finally(() => this.isLoading = false);
  }

  onPublishCourse(): void {
    if (!this.courseId) {
      this.openModal('Error', 'Cannot publish a new course. Please save it first.');
      return;
    }

    this.isLoading = true;
    this.adminCourseService.publishCourse(this.courseId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.openModal('Success', res.message || 'Course published successfully!');
          }
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to publish course';
          this.openModal('Error', msg);
        }
      });
  }

  onPreviewCourse(): void {
    // TODO: route/modal
  }

  /* =========================
    Discard Changes (FUNCTIONAL)
  ========================= */

  private initialSnapshot: CourseDetailsSnapshot | null = null;

  discardChanges(): void {
    if (!this.initialSnapshot) return;

    this.revokeAllObjectUrls();

    const snap = this.deepClone(this.initialSnapshot);

    this.progress = snap.progress;
    this.requiredFieldsTotal = snap.requiredFieldsTotal;

    this.basicInfo = snap.basicInfo;
    this.courseOverview = snap.courseOverview;
    this.learningOutcomes = snap.learningOutcomes;

    this.courseModules = snap.courseModules;
    this.materialsTab = snap.materialsTab;

    this.assignedInstructors = snap.assignedInstructors;
    this.availableInstructors = snap.availableInstructors;

    this.instructorSort = snap.instructorSort;
    this.showInstructorFilters = snap.showInstructorFilters;

    // re-calc derived UI
    this.recalcBasicInfoProgress();
    this.recalcCourseOverview();
    this.recalcLearningOutcomes();
    this.recalcCourseModules();
    this.syncMaterialsFromModules();
    this.recalcOverallProgress();
  }

  private captureInitialSnapshot(): void {
    this.initialSnapshot = this.deepClone({
      progress: this.progress,
      requiredFieldsTotal: this.requiredFieldsTotal,

      basicInfo: this.basicInfo,
      courseOverview: this.courseOverview,
      learningOutcomes: this.learningOutcomes,

      courseModules: this.courseModules,
      materialsTab: this.materialsTab,

      assignedInstructors: this.assignedInstructors,
      availableInstructors: this.availableInstructors,

      instructorSort: this.instructorSort,
      showInstructorFilters: this.showInstructorFilters,
    });
  }

  private deepClone<T>(v: T): T {
    try {
      return structuredClone(v);
    } catch {
      return JSON.parse(JSON.stringify(v)) as T;
    }
  }

  /* =========================
    Header + Section Progress
  ========================= */

  progress: CourseProgress = {
    completionPercent: 0,
    sectionTitle: 'Basic Information',
    sectionStatus: 'incomplete',
    completedFields: 0,
    totalFields: 5,
  };

  goBackToCourseManagement(): void {
    this.router.navigate([`${getAdminBasePath()}/course-management`]);
  }
  /* =========================
    Basic Info
  ========================= */

  basicInfo: BasicInfoForm = {
    title: '',
    category: '',
    subCategory: '',
    ageGroup: '',
    price: 0,
    currency: 'USD',
    thumbnailUrl: 'assets/admin/course-manage/courses.svg',
    courseAccess: '',
    courseEnrollementType: 'recorded',
    courseVisibility: false,
  };

  categories: string[] = ['Select category'];
  fullCategories: any[] = [];
  ageGroups: string[] = ['Select Age Group'];
  levels: string[] = ['Beginner', 'Intermediate', 'Advanced'];
  subCategories: string[] = [];
  currencies: string[] = ['USD', 'PKR', 'EUR'];

  get isThumbnailComplete(): boolean {
    return (this.basicInfo.thumbnailUrl ?? '').trim().length > 0;
  }

  onBasicChanged(): void {
    this.recalcBasicInfoProgress();
    this.recalcOverallProgress();

    // If category changed, update sub-data lists from local fullCategories
    if (this.basicInfo.category && this.basicInfo.category !== 'Select category') {
      this.updateCategoryDynamicLists(this.basicInfo.category);
    }
  }

  private updateCategoryDynamicLists(catName: string): void {
    const cat = this.fullCategories.find(c => c.categoryName === catName);
    if (cat) {
      // Use locally available data from category object
      this.subCategories = cat.subCategory || [];
      this.ageGroups = ['Select Age Group', ...(cat.categoryAgeGroup || [])];
      this.levels = cat.categoryLevel || [];
    } else {
      // Fallback: If category not found in current fullCategories, clear lists
      this.subCategories = [];
      this.ageGroups = ['Select Age Group'];
    }
  }

  changeImage(input: HTMLInputElement): void {
    input.click();
  }

  onThumbnailPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    this.selectedThumbnail = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.basicInfo.thumbnailUrl = String(reader.result || '');
      this.onBasicChanged();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  recalcBasicInfoProgress(): void {
    const titleOk = (String(this.basicInfo.title ?? '')).trim().length > 0;
    const categoryOk = (String(this.basicInfo.category ?? '')).trim().length > 0 && this.basicInfo.category !== 'Select category';
    const ageOk = (String(this.basicInfo.ageGroup ?? '')).trim().length > 0 && this.basicInfo.ageGroup !== 'Select Age Group';
    const priceOk = Number(this.basicInfo.price ?? 0) > 0;
    const thumbOk = (String(this.basicInfo.thumbnailUrl ?? '')).trim().length > 0;

    const completed = [titleOk, categoryOk, ageOk, priceOk, thumbOk].filter(Boolean).length;

    this.progress.totalFields = 5;
    this.progress.completedFields = completed;
    this.progress.sectionStatus = completed === 5 ? 'complete' : 'incomplete';
  }

  /* =========================
    Course Overview (DYNAMIC COMPLETE)
  ========================= */

  courseOverview: CourseOverviewForm = {
    status: 'incomplete',
    completedFields: 0,
    totalFields: 5,
    description: '',
    duration: null,
    durationUnit: 'weeks',
    level: '',
    prerequisites: '',
    targetAudience: '',
  };

  durationUnits: Array<CourseOverviewForm['durationUnit']> = ['weeks', 'days', 'months'];

  onOverviewChanged(): void {
    this.recalcCourseOverview();
    this.recalcOverallProgress();
  }

  isCourseOverviewFieldComplete(
    k: 'description' | 'duration' | 'level' | 'prerequisites' | 'targetAudience'
  ): boolean {
    if (k === 'duration') return Number(this.courseOverview.duration ?? 0) > 0;
    return (String((this.courseOverview as any)[k] ?? '')).trim().length > 0;
  }

  private recalcCourseOverview(): void {
    const okDesc = (this.courseOverview.description ?? '').trim().length > 0;
    const okDuration = Number(this.courseOverview.duration ?? 0) > 0;
    const okLevel = (this.courseOverview.level ?? '').trim().length > 0;
    const okPre = (this.courseOverview.prerequisites ?? '').trim().length > 0;
    const okAud = (this.courseOverview.targetAudience ?? '').trim().length > 0;

    const completed = [okDesc, okDuration, okLevel, okPre, okAud].filter(Boolean).length;
    this.courseOverview.totalFields = 5;
    this.courseOverview.completedFields = completed;
    this.courseOverview.status = completed === 5 ? 'complete' : 'incomplete';
  }

  /* =========================
    Learning Outcomes (Strict API-driven)
  ========================= */

  learningOutcomes: LearningOutcomesForm = {
    status: 'incomplete',
    completedFields: 0,
    totalFields: 1,
    minOutcomes: 3,
    items: [],
  };

  onOutcomesChanged(): void {
    this.recalcLearningOutcomes();
    this.recalcOverallProgress();
  }

  addOutcome(): void {
    const cid = this.courseId;
    if (!cid || this.isAddingOutcome) {
      if (!cid) this.openModal('Error', 'Please save basic course info first.');
      return;
    }

    const placeholderDesc = 'Write a learning outcome...';

    this.isAddingOutcome = true;
    this.adminCourseService.createLearningOutcome(cid, placeholderDesc).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.learningOutcomes.items.push({
            id: res.data._id || res.data.id,
            description: res.data.outcomeDescription || placeholderDesc
          });
          this.recalcLearningOutcomes();
          this.recalcOverallProgress();
          this.openModal('Success', res.message || 'Learning outcome added successfully');
        } else {
          this.openModal('Error', res.message || 'Failed to add learning outcome');
        }
        this.isAddingOutcome = false;
      },
      error: (err) => {
        this.isAddingOutcome = false;
        const msg = err?.error?.message || 'Failed to add learning outcome';
        this.openModal('Error', msg);
      }
    });
  }

  removeOutcome(index: number): void {
    const item = this.learningOutcomes.items[index];
    const cid = this.courseId;

    if (!item || !cid) return;

    if (item.id) {
      this.isLoading = true;
      this.adminCourseService.deleteLearningOutcome(cid, item.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.learningOutcomes.items.splice(index, 1);
            this.recalcLearningOutcomes();
            this.recalcOverallProgress();
            this.openModal('Success', res.message || 'Learning outcome deleted successfully');
          } else {
            this.openModal('Error', res.message || 'Failed to delete outcome');
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message || 'Failed to delete outcome';
          this.openModal('Error', msg);
        }
      });
    } else {
      this.learningOutcomes.items.splice(index, 1);
      this.onOutcomesChanged();
    }
  }

  saveOutcome(index: number): void {
    const item = this.learningOutcomes.items[index];
    const cid = this.courseId;
    if (!item?.id || !cid) return;

    this.adminCourseService.updateLearningOutcome(cid, item.id, item.description).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('Outcome updated in DB');
        }
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to update outcome';
        this.openModal('Error', msg);
      }
    });
  }

  private fetchLearningOutcomes(courseId: string): void {
    this.adminCourseService.getCourseLearningOutcomes(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.learningOutcomes.items = res.data.map((o: any) => ({
            id: o._id || '',
            description: o.outcomeDescription || ''
          }));
          this.onOutcomesChanged();
        }
      },
      error: (err) => console.error('Failed to fetch outcomes', err)
    });
  }

  private fetchCourseModules(courseId: string): void {
    this.adminCourseService.getCourseModules(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courseModules.items = res.data.map((m: any) => ({
            id: m._id || '',
            title: m.moduleName || '',
            status: 'incomplete',
            expanded: false,
            isNew: false,
            description: m.moduleDescription || '',
            sessions: m.noOfSession || 0,
            durationMinutes: m.sessionDuration || 0,
            materials: [],
            draftMaterials: []
          }));
          this.recalcCourseModules();
          this.syncMaterialsFromModules();
          this.recalcOverallProgress();
        }
      },
      error: (err) => {
        console.error('Failed to fetch modules', err);
        // Keep empty array on error
        this.courseModules.items = [];
      }
    });
  }

  recalcLearningOutcomes(): void {
    const placeholderDesc = 'Write a learning outcome...';
    const filled = this.learningOutcomes.items
      .map((x) => (x.description ?? '').trim())
      .filter((d) => d && d !== placeholderDesc);

    const isComplete = filled.length >= this.learningOutcomes.minOutcomes;
    this.learningOutcomes.completedFields = isComplete ? 1 : 0;
    this.learningOutcomes.status = isComplete ? 'complete' : 'incomplete';
  }

  public trackById(index: number, item: any): string {
    return item.id || index.toString();
  }

  /* =========================
    Course Modules (Draft NOT saved until Save Module)
  ========================= */

  courseModules: CourseModulesSection = {
    status: 'incomplete',
    completedModules: 0,
    totalModules: 0,
    items: [],
  };

  toggleModule(m: CourseModuleItem): void {
    m.expanded = !m.expanded;
  }

  addModule(): void {
    const cid = this.courseId;
    if (!cid) {
      this.openModal('Error', 'Please save basic course info first.');
      return;
    }

    // Collapse all modules
    this.courseModules.items.forEach((x) => (x.expanded = false));

    // Create module via API with placeholder data
    this.isLoading = true;
    this.adminCourseService.createCourseModule({
      courseId: cid,
      moduleName: 'Enter module name...',
      moduleDescription: 'Enter module description...',
      noOfSession: 1,
      sessionDuration: 60
    })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const newModule: CourseModuleItem = {
              id: res.data._id || `m${Date.now()}`,
              title: res.data.moduleName || 'Enter module name...',
              status: 'incomplete',
              expanded: true,
              isNew: true,
              description: res.data.moduleDescription || 'Enter module description...',
              sessions: res.data.noOfSession || 1,
              durationMinutes: res.data.sessionDuration || 60,
              materials: [],
              draftMaterials: []
            };
            this.courseModules.items.push(newModule);
            this.recalcCourseModules();
            this.syncMaterialsFromModules();
            this.recalcOverallProgress();
            this.openModal('Success', res.message || 'Module created successfully');
          }
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to create module';
          this.openModal('Error', msg);
        }
      });
  }

  deleteModule(index: number): void {
    const mod = this.courseModules.items[index];
    const cid = this.courseId;

    if (!mod || !cid) return;

    // If module has no ID or is newly created local item, just remove it
    if (!mod.id || mod.id.startsWith('m')) {
      mod.materials?.forEach((m) => m.blobUrl && this.safeRevoke(m.blobUrl));
      this.courseModules.items.splice(index, 1);
      this.recalcCourseModules();
      this.syncMaterialsFromModules();
      this.recalcOverallProgress();
      return;
    }

    // Delete from backend using courseId and courseModuleId
    this.isLoading = true;
    this.adminCourseService.deleteCourseModule(cid, mod.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.openModal('Success', res.message || 'Module deleted successfully');
            mod.materials?.forEach((m) => m.blobUrl && this.safeRevoke(m.blobUrl));
            this.courseModules.items.splice(index, 1);
            this.recalcCourseModules();
            this.syncMaterialsFromModules();
            this.recalcOverallProgress();
          }
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to delete module';
          this.openModal('Error', msg);
        }
      });
  }

  onModuleFieldChange(
    index: number,
    field: keyof Pick<CourseModuleItem, 'title' | 'description' | 'sessions' | 'durationMinutes'>,
    value: any
  ): void {
    const mod = this.courseModules.items[index];
    if (!mod) return;

    if (field === 'sessions' || field === 'durationMinutes') {
      const n = value === '' || value === null || value === undefined ? 0 : Number(value);
      (mod as any)[field] = Number.isFinite(n) ? n : 0;
    } else {
      (mod as any)[field] = String(value ?? '');
    }

    this.recalcCourseModules();
    this.recalcOverallProgress();
  }

  private isModuleComplete(m: CourseModuleItem): boolean {
    const t = (m.title ?? '').trim().length > 0;
    const d = (m.description ?? '').trim().length > 0;
    const s = Number(m.sessions ?? 0) > 0;
    const dur = Number(m.durationMinutes ?? 0) > 0;
    return t && d && s && dur;
  }

  recalcCourseModules(): void {
    const completed = this.courseModules.items.filter((m) => this.isModuleComplete(m)).length;
    const total = this.courseModules.items.length;

    this.courseModules.completedModules = completed;
    this.courseModules.totalModules = total;

    this.courseModules.items.forEach((m) => {
      m.status = this.isModuleComplete(m) ? 'complete' : 'incomplete';
    });

    if (total === 0) this.courseModules.status = 'incomplete';
    else if (completed === total) this.courseModules.status = 'complete';
    else if (completed > 0) this.courseModules.status = 'partial';
    else this.courseModules.status = 'incomplete';
  }

  trackByModuleId(_i: number, item: CourseModuleItem): string {
    return item.id;
  }

  /* =========================
    Save Module (ONLY point where upload is committed)
  ========================= */

  private savingModuleIds = new Set<string>();

  isModuleSaving(id: string): boolean {
    return this.savingModuleIds.has(id);
  }

  canSaveModule(m: CourseModuleItem): boolean {
    return this.isModuleComplete(m);
  }

  async saveModule(index: number): Promise<void> {
    const mod = this.courseModules.items[index];
    const cid = this.courseId;

    if (!mod || !cid) return;
    if (!this.isModuleComplete(mod)) return;
    if (this.savingModuleIds.has(mod.id)) return;

    this.savingModuleIds.add(mod.id);

    try {
      // commit drafts => saved materials
      if (mod.draftMaterials?.length) {
        const committed = mod.draftMaterials.map((d) => this.fileToMaterial(d.file));
        mod.materials = [...(mod.materials ?? []), ...committed];
        mod.draftMaterials = [];
      }

      const payload = {
        courseId: cid,
        courseModuleId: mod.id,
        moduleName: (mod.title || '').trim(),
        moduleDescription: (mod.description || '').trim(),
        noOfSession: Number(mod.sessions || 0),
        sessionDuration: Number(mod.durationMinutes || 0)
      };

      // Call Update API
      const res = await this.adminCourseService.updateCourseModule(cid, mod.id, payload).toPromise();

      if (res.success) {
        mod.isNew = false;
        this.openModal('Success', res.message || 'Module updated successfully');
        this.recalcCourseModules();
        this.syncMaterialsFromModules();
        this.recalcOverallProgress();
      } else {
        throw new Error(res.message || 'Failed to update module');
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to save module';
      this.openModal('Error', msg);
    } finally {
      this.savingModuleIds.delete(mod.id);
    }
  }

  /* =========================
    Course Materials UI (READS ONLY SAVED MATERIALS)
  ========================= */

  materialsTab: MaterialsTab = 'recorded';

  recordedModules: MaterialsModuleRow[] = [];
  pdfModules: MaterialsModuleRow[] = [];

  private readonly videoExt = ['mp4', 'avi', 'mov'];
  private readonly docExt = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];

  private syncMaterialsFromModules(): void {
    // Fetch materials from API instead of local sync
    const cid = this.courseId;
    if (!cid) return;

    this.fetchCourseMaterials(cid);
  }

  private fetchCourseMaterials(courseId: string): void {
    // Fetch lectures
    this.adminCourseService.getLecturesByModule(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recordedModules = res.data.map((module: any) => ({
            id: module._id,
            title: module.moduleName || 'Untitled Module',
            files: (module.lectures || []).map((lecture: any) => ({
              id: lecture._id,
              name: lecture.title || 'Untitled Lecture',
              size: this.parseFileSize(lecture.fileSize || '0 MB'),
              type: 'video/mp4',
              addedAt: lecture.createdAt,
              blobUrl: lecture.lectureInfo?.secureUrl || ''
            }))
          }));
        }
      },
      error: (err) => console.error('Failed to fetch lectures', err)
    });

    // Fetch PDFs
    this.adminCourseService.getPdfsByModule(courseId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.pdfModules = res.data.map((module: any) => ({
            id: module._id,
            title: module.moduleName || 'Untitled Module',
            files: (module.materials || []).map((pdf: any) => ({
              id: pdf._id,
              name: pdf.title || 'Untitled PDF',
              size: 0, // Size not provided in API
              type: 'application/pdf',
              addedAt: pdf.createdAt,
              blobUrl: pdf.pdfMaterialInfo?.secureUrl || ''
            }))
          }));
        }
      },
      error: (err) => console.error('Failed to fetch PDFs', err)
    });
  }

  private parseFileSize(sizeStr: string): number {
    // Convert "61.37 MB" to bytes
    const match = sizeStr.match(/([\d.]+)\s*(MB|KB|GB)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case 'GB': return value * 1024 * 1024 * 1024;
      case 'MB': return value * 1024 * 1024;
      case 'KB': return value * 1024;
      default: return value;
    }
  }

  private getExt(name: string): string {
    const n = (name ?? '').toLowerCase();
    return n.includes('.') ? n.split('.').pop() || '' : '';
  }

  private isVideoMaterial(m: ModuleMaterial): boolean {
    const ext = this.getExt(m?.name || '');
    const type = (m?.type || '').toLowerCase();
    return type.startsWith('video/') || this.videoExt.includes(ext);
  }

  private isDocMaterial(m: ModuleMaterial): boolean {
    const ext = this.getExt(m?.name || '');
    const type = (m?.type || '').toLowerCase();
    return type === 'application/pdf' || this.docExt.includes(ext);
  }

  get uploadedFilesCount(): number {
    return (this.courseModules.items ?? []).reduce((acc, m) => acc + (m.materials?.length ?? 0), 0);
  }

  get totalFilesCount(): number {
    return this.uploadedFilesCount;
  }

  get currentTabUploadedCount(): number {
    const list = this.materialsTab === 'recorded' ? this.recordedModules : this.pdfModules;
    return list.reduce((acc, m) => acc + (m.files?.length ?? 0), 0);
  }

  get currentTabTotalCount(): number {
    return (this.courseModules.items ?? []).length;
  }

  get courseMaterialsStatus(): 'complete' | 'partial' | 'incomplete' {
    const totalModules = (this.courseModules.items ?? []).length;
    if (totalModules === 0) return 'incomplete';

    const withAny = (this.courseModules.items ?? []).filter((m) => (m.materials?.length ?? 0) > 0).length;
    if (withAny === 0) return 'incomplete';
    if (withAny === totalModules) return 'complete';
    return 'partial';
  }

  trackByMaterialsModuleId(_i: number, item: { id: string }): string {
    return item.id;
  }

  trackByMaterialFileId(_i: number, item: ModuleMaterial): string {
    return item.id;
  }

  sumSize(files: ModuleMaterial[]): number {
    return (files ?? []).reduce((acc, f) => acc + Number(f.size || 0), 0);
  }

  clearModuleFiles(kind: MaterialsModalKind, index: number): void {
    const mod = this.courseModules.items[index];
    if (!mod) return;

    const keep = (mod.materials ?? []).filter((x) => {
      if (kind === 'recorded') return !this.isVideoMaterial(x);
      return !this.isDocMaterial(x);
    });

    (mod.materials ?? []).forEach((x) => {
      const removed = !keep.find((k) => k.id === x.id);
      if (removed && x.blobUrl) this.safeRevoke(x.blobUrl);
    });

    mod.materials = keep;

    this.recalcCourseModules();
    this.syncMaterialsFromModules();
    this.recalcOverallProgress();
  }

  /* =========================
    Materials Modal (SAVED materials only)
  ========================= */

  showMaterialsModal = false;
  materialsModalKind: MaterialsModalKind = 'recorded';
  materialsModalIndex = -1;
  materialsModalTitle = '';
  materialsWorkingFiles: ModuleMaterial[] = [];

  openMaterialsModal(kind: MaterialsModalKind, index: number): void {
    this.materialsModalKind = kind;
    this.materialsModalIndex = index;

    // Get the module from the appropriate list (API data)
    const moduleList = kind === 'recorded' ? this.recordedModules : this.pdfModules;
    const moduleRow = moduleList[index];

    if (!moduleRow) return;

    this.materialsModalTitle = moduleRow.title;

    // Use files from API data
    this.materialsWorkingFiles = (moduleRow.files || []).map((f) => ({ ...f }));
    this.showMaterialsModal = true;
  }

  closeMaterialsModal(save: boolean): void {
    if (save) {
      const mod = this.courseModules.items[this.materialsModalIndex];
      if (mod) {
        const other = (mod.materials ?? []).filter((x) => {
          if (this.materialsModalKind === 'recorded') return !this.isVideoMaterial(x);
          return !this.isDocMaterial(x);
        });

        const oldSlice =
          this.materialsModalKind === 'recorded'
            ? (mod.materials ?? []).filter((x) => this.isVideoMaterial(x))
            : (mod.materials ?? []).filter((x) => this.isDocMaterial(x));

        const oldUrls = new Set(oldSlice.map((x) => x.blobUrl).filter(Boolean) as string[]);
        const newUrls = new Set((this.materialsWorkingFiles ?? []).map((x) => x.blobUrl).filter(Boolean) as string[]);

        oldUrls.forEach((u) => {
          if (!newUrls.has(u)) this.safeRevoke(u);
        });

        mod.materials = [...other, ...this.materialsWorkingFiles.map((x) => ({ ...x }))];

        this.recalcCourseModules();
        this.syncMaterialsFromModules();
        this.recalcOverallProgress();
      }
    }

    this.showMaterialsModal = false;
    this.materialsModalIndex = -1;
    this.materialsModalTitle = '';
    this.materialsWorkingFiles = [];
  }

  onMaterialsPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const allowed = this.materialsModalKind === 'recorded' ? this.videoExt : this.docExt;

    const filtered = files.filter((f) => allowed.includes(this.getExt(f.name)));
    filtered.forEach((f) => this.materialsWorkingFiles.push(this.fileToMaterial(f)));

    input.value = '';
  }

  removeMaterialFile(index: number): void {
    const item = this.materialsWorkingFiles[index];
    if (!item) return;

    // If it doesn't have an ID (locally added), just remove from list
    if (!item.id) {
      if (item.blobUrl) this.safeRevoke(item.blobUrl);
      this.materialsWorkingFiles.splice(index, 1);
      return;
    }

    // Call API for existing lecture or PDF soft-delete
    const cid = this.courseId;
    if (!cid) return;

    this.isDeleting = true;
    const isLecture = this.materialsModalKind === 'recorded';
    const deleteObservable = isLecture
      ? this.adminCourseService.deleteCourseLecture(cid, item.id)
      : this.adminCourseService.deleteCoursePdf(cid, item.id);

    deleteObservable.subscribe({
      next: (res) => {
        if (res.success) {
          this.redirectOnModalClose = true;
          this.openModal('Success', res.message || 'File moved to trash.');
          this.fetchCourseMaterials(cid); // Refresh list
        } else {
          this.openModal('Error', res.message || 'Failed to delete file.');
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Delete failed', err);
        const msg = err?.error?.message || 'Failed to delete file';
        this.openModal('Error', msg);
        this.isDeleting = false;
      }
    });
  }

  renameMaterialFile(index: number): void {
    this.openRenameModal(index, 'material');
  }

  downloadMaterialFile(index: number): void {
    const item = this.materialsWorkingFiles[index];
    if (!item) return;

    const url = this.resolveFileUrl(item);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name || 'download';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* =========================
    Upload Modal (API-based with Progress)
  ========================= */

  showUploadModal = false;
  dragOver = false;

  selectedFiles: File[] = [];
  uploadError = '';
  uploadTitle = '';
  fileUploadProgress: Record<number, number> = {};
  isUploading = false;

  private uploadModuleIndex = -1;

  showAttachOptions = false;
  attachPickKind: AttachPickKind = null;

  get acceptForPicker(): string {
    if (this.attachPickKind === 'video') return '.mp4,.avi,.mov';
    if (this.attachPickKind === 'doc') return '.pdf,.doc,.docx,.ppt,.pptx';
    return '';
  }

  openUploadMaterialModal(moduleIndex: number): void {
    this.showUploadModal = true;
    this.uploadModuleIndex = moduleIndex;

    this.selectedFiles = [];
    this.uploadError = '';
    this.uploadTitle = '';
    this.dragOver = false;
    this.fileUploadProgress = {};
    this.isUploading = false;

    this.showAttachOptions = false;
    this.attachPickKind = null;
  }

  closeUploadMaterialModal(): void {
    this.showUploadModal = false;
    this.uploadModuleIndex = -1;

    this.selectedFiles = [];
    this.uploadError = '';
    this.uploadTitle = '';
    this.dragOver = false;
    this.fileUploadProgress = {};
    this.isUploading = false;

    this.showAttachOptions = false;
    this.attachPickKind = null;
  }

  onAttachClick(picker: HTMLInputElement): void {
    this.uploadError = '';
    if (!this.attachPickKind) {
      this.showAttachOptions = true;
      return;
    }
    picker.click();
  }

  pickAttachKind(kind: 'video' | 'doc', picker: HTMLInputElement): void {
    this.attachPickKind = kind;
    this.uploadError = '';
    this.showAttachOptions = false;
    picker.click();
  }

  onBrowsePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    input.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) this.uploadError = '';
  }

  renameSelectedFile(index: number): void {
    this.openRenameModal(index, 'selected');
  }

  /* =========================
    Rename Modal Helpers
  ========================= */

  openRenameModal(index: number, type: 'selected' | 'material'): void {
    this.renameIndex = index;
    this.renameType = type;
    if (type === 'selected') {
      this.renameInputValue = this.selectedFiles[index]?.name || '';
    } else {
      this.renameInputValue = this.materialsWorkingFiles[index]?.name || '';
    }
    this.showRenameModal = true;

    // Fast focus
    setTimeout(() => {
      if (this.renameInput) {
        this.renameInput.nativeElement.focus();
        this.renameInput.nativeElement.select();
      }
    }, 10);
  }

  saveRename(): void {
    const v = this.renameInputValue.trim();
    if (!v || this.renameIndex === -1) {
      this.closeRenameModal();
      return;
    }

    if (this.renameType === 'selected') {
      const f = this.selectedFiles[this.renameIndex];
      if (f) {
        // File rename needs creating a new File object
        const renamed = new File([f], v, { type: f.type, lastModified: f.lastModified });
        this.selectedFiles.splice(this.renameIndex, 1, renamed);
      }
      this.closeRenameModal();
    } else if (this.renameType === 'material') {
      this.confirmRenameWithApi(v);
    }
  }

  private confirmRenameWithApi(newTitle: string): void {
    const item = this.materialsWorkingFiles[this.renameIndex];
    const cid = this.courseId;
    if (!item || !cid || !item.id) {
      if (item) item.name = newTitle;
      this.closeRenameModal();
      return;
    }

    this.isRenaming = true;
    const isLecture = this.materialsModalKind === 'recorded';
    const renameObservable = isLecture
      ? this.adminCourseService.updateLectureTitle(cid, item.id, newTitle)
      : this.adminCourseService.updatePdfTitle(cid, item.id, newTitle);

    renameObservable.subscribe({
      next: (res) => {
        this.isRenaming = false;
        this.closeRenameModal();

        if (res.success) {
          this.redirectOnModalClose = true;
          this.openModal('Success', res.message || 'File renamed successfully');
          this.fetchCourseMaterials(cid); // Refresh list
        } else {
          this.openModal('Error', res.message || 'Failed to rename file');
        }
      },
      error: (err) => {
        console.error('Rename failed', err);
        const msg = err?.error?.message || 'Failed to rename file';
        this.isRenaming = false;
        this.closeRenameModal();
        this.openModal('Error', msg);
      }
    });
  }

  closeRenameModal(): void {
    this.showRenameModal = false;
    this.renameInputValue = '';
    this.renameIndex = -1;
    this.renameType = null;
  }

  async confirmUploadWithApi(): Promise<void> {
    this.uploadError = '';

    if (this.uploadModuleIndex < 0) return;
    const mod = this.courseModules.items[this.uploadModuleIndex];
    const cid = this.courseId;

    if (!mod || !cid) return;

    if (!this.selectedFiles.length) {
      this.uploadError = 'Please select at least one file.';
      return;
    }

    if (!this.uploadTitle.trim()) {
      this.uploadError = 'Please enter a title for the material.';
      return;
    }

    this.isUploading = true;
    this.fileUploadProgress = {};

    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        this.fileUploadProgress[i] = 0;

        await this.uploadSingleFile(file, i, cid, mod.id);
      }

      this.openModal('Success', 'All files uploaded successfully!');
      this.closeUploadMaterialModal();

      // Refresh materials to show newly uploaded files
      if (cid) {
        this.fetchCourseMaterials(cid);
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Failed to upload files';
      this.uploadError = msg;
    } finally {
      this.isUploading = false;
    }
  }

  private uploadSingleFile(file: File, index: number, courseId: string, moduleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('title', this.uploadTitle);
      formData.append('courseId', courseId);
      formData.append('moduleId', moduleId);

      const ext = this.getExt(file.name);
      const isVideo = this.videoExt.includes(ext);

      if (isVideo) {
        formData.append('lecture', file);
      } else {
        formData.append('pdf', file);
      }

      const uploadObservable = isVideo
        ? this.adminCourseService.uploadCourseLecture(formData)
        : this.adminCourseService.uploadCoursePdf(formData);

      uploadObservable.subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Real-time progress tracking
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              this.fileUploadProgress[index] = progress;
            }
          } else if (event.type === HttpEventType.Response) {
            // Upload completed
            if (event.body?.success) {
              this.fileUploadProgress[index] = 100;
              resolve();
            } else {
              reject(new Error(event.body?.message || 'Upload failed'));
            }
          }
        },
        error: (err) => reject(err)
      });
    });
  }

  private addFiles(files: File[]): void {
    this.uploadError = '';

    if (!this.attachPickKind) {
      this.uploadError = 'Please choose Video or Doc first.';
      return;
    }

    const pick = this.attachPickKind;
    const filtered = files.filter((f) => this.isAllowedFileByPick(f, pick));

    if (files.length && filtered.length === 0) {
      this.uploadError = pick === 'video'
        ? 'Only Video files allowed (MP4, AVI, MOV).'
        : 'Only Doc files allowed (PDF, DOC, PPT).';
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...filtered];
  }

  private isAllowedFileByPick(file: File, pick: 'video' | 'doc'): boolean {
    const ext = this.getExt(file.name);
    if (pick === 'video') return this.videoExt.includes(ext);
    return this.docExt.includes(ext);
  }

  getUploadRowIcon(file: File): string {
    const ext = this.getExt(file.name);
    if (this.videoExt.includes(ext)) return '/assets/admin/course-manage/video.svg';
    return '/assets/admin/course-manage/pdf.svg';
  }

  /* =========================
    Instructors
  ========================= */

  assignedInstructors: InstructorItem[] = [];
  availableInstructors: InstructorItem[] = [];

  instructorSort: 'rating_desc' | 'rating_asc' = 'rating_desc';
  showInstructorFilters = false;

  get assignedCount(): number {
    return this.assignedInstructors?.length ?? 0;
  }

  get availableCount(): number {
    return this.availableInstructors?.length ?? 0;
  }

  get visibleAvailableInstructors(): InstructorItem[] {
    const list = [...(this.availableInstructors ?? [])];
    list.sort((a, b) => {
      const ra = Number(a.rating ?? 0);
      const rb = Number(b.rating ?? 0);
      return this.instructorSort === 'rating_desc' ? rb - ra : ra - rb;
    });
    return list;
  }

  showInstructorProfileModal = false;
  profileInstructor: InstructorItem | null = null;

  openInstructorProfile(i: InstructorItem): void {
    this.profileInstructor = i;
    this.showInstructorProfileModal = true;
  }

  closeInstructorProfile(): void {
    this.showInstructorProfileModal = false;
    this.profileInstructor = null;
  }

  showInstructorConfirmModal = false;
  confirmAction: InstructorConfirmAction = 'assign_instructor';
  confirmInstructor: InstructorItem | null = null;

  openConfirm(action: InstructorConfirmAction, i: InstructorItem): void {
    this.confirmAction = action;
    this.confirmInstructor = i;
    this.showInstructorConfirmModal = true;
  }

  closeConfirm(): void {
    this.showInstructorConfirmModal = false;
    this.confirmInstructor = null;
  }

  confirmYes(): void {
    const i = this.confirmInstructor;
    const cid = this.courseId;
    if (!i || !cid) return;

    if (this.confirmAction === 'assign_instructor' || this.confirmAction === 'assign_course') {
      this.adminCourseService.assignInstructor(cid, i.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.openModal('Success', res.message || 'Instructor assigned successfully');
            const idx = (this.availableInstructors ?? []).findIndex((x) => x.id === i.id);
            if (idx > -1) {
              const picked = this.availableInstructors.splice(idx, 1)[0];
              picked.status = 'Assigned';
              picked.assignedDateText = this.formatTodayAsMMDDYYYY();
              this.assignedInstructors.unshift(picked);
            }
          }
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Failed to assign instructor';
          this.openModal('Error', msg);
          console.error('Failed to assign instructor', err);
        }
      });
    }

    if (this.confirmAction === 'remove_instructor') {
      this.adminCourseService.removeInstructor(cid, i.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.openModal('Success', res.message || 'Instructor removed successfully');
            const idx = (this.assignedInstructors ?? []).findIndex((x) => x.id === i.id);
            if (idx > -1) {
              const picked = this.assignedInstructors.splice(idx, 1)[0];
              picked.status = 'Available';
              picked.assignedDateText = '—';
              this.availableInstructors.unshift(picked);
            }
          }
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Failed to remove instructor';
          this.openModal('Error', msg);
          console.error('Failed to remove instructor', err);
        }
      });
    }

    this.closeConfirm();
    this.closeInstructorProfile();
  }

  private formatTodayAsMMDDYYYY(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
  }

  get confirmTitleText(): string {
    const n = this.confirmInstructor?.name || '';
    if (this.confirmAction === 'assign_instructor') return `Do you want to add ${n} as a Instructor?`;
    if (this.confirmAction === 'assign_course') return `Do you want to assign course ${n}?`;
    return `Do you want to remove ${n} as a Instructor?`;
  }

  get profilePrimaryBtnText(): string {
    const i = this.profileInstructor;
    if (!i) return 'Confirm';
    return i.status === 'Assigned' ? 'Remove Instructor' : 'Assign Course';
  }

  onProfilePrimaryClick(): void {
    const i = this.profileInstructor;
    if (!i) return;

    if (i.status === 'Assigned') this.openConfirm('remove_instructor', i);
    else this.openConfirm('assign_course', i);
  }


  /* =========================
    Modal Helpers
  ========================= */

  openModal(title: 'Success' | 'Error', message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = title;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    if (this.redirectOnModalClose) {
      this.redirectOnModalClose = false;
      // Close the materials popup to return to the main course details view
      this.showMaterialsModal = false;
    }
  }

  avatarFallback(name: string): string {
    const parts = (name ?? '').trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts[1]?.[0] ?? '';
    return `${a}${b}`.toUpperCase();
  }

  /* =========================
    Helpers (Object URL safety)
  ========================= */

  private createdObjectUrls = new Set<string>();

  private fileToMaterial(f: File): ModuleMaterial {
    const now = new Date().toISOString();
    const blobUrl = URL.createObjectURL(f);
    this.createdObjectUrls.add(blobUrl);

    return {
      id: `mat_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'file',
      addedAt: now,
      blobUrl,
    };
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const v = bytes / Math.pow(k, i);
    return `${v.toFixed(i === 0 ? 0 : 1)}${sizes[i]}`;
  }

  private resolveFileUrl(file: ModuleMaterial): string {
    if (file.blobUrl) return file.blobUrl;
    return `/assets/${encodeURIComponent(file.name || '')}`;
  }

  private safeRevoke(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch { }
    this.createdObjectUrls.delete(url);
  }

  private revokeAllObjectUrls(): void {
    this.createdObjectUrls.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch { }
    });
    this.createdObjectUrls.clear();
  }


}
