import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { StudentCourseService } from '../../../../core/services/student/course/course.service';
import { forkJoin } from 'rxjs';
import { EnrolledCourseData, ModuleWithMaterials, ModuleWithLectures, PdfDetail } from '../../../../core/interfaces/student/enrollments/enrollment.interface';

@Component({
  selector: 'app-recorded-sessions',
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './recorded-sessions.component.html',
  styleUrl: './recorded-sessions.component.css'
})
export class RecordedSessionsComponent implements OnInit {
  courseData: EnrolledCourseData | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private studentCourseService: StudentCourseService
  ) { }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseData(courseId);
    } else {
      this.error = 'Course ID not found';
      this.loading = false;
    }
  }

  private loadCourseData(courseId: string): void {
    this.loading = true;

    forkJoin({
      enrolledData: this.enrollmentService.getEnrolledCourseData(courseId),
      pdfsData: this.studentCourseService.getPdfsModuleWise(courseId),
      lecturesData: this.studentCourseService.getLecturesModuleWise(courseId)
    }).subscribe({
      next: ({ enrolledData, pdfsData, lecturesData }) => {
        // Redirection Check
        if (enrolledData.enrollment?.enrollmentType === 'Live Classes') {
          this.router.navigate(['/student/live-sessions', courseId], { replaceUrl: true });
          return;
        }

        const data = enrolledData;

        // Process Lectures and PDFs
        // ApiClientService unwraps the response, so pdfsData/lecturesData IS the data array/object.
        // We cast them to any first to avoid type check issues if they are not exactly matching yet, 
        // or strictly type them if we trust the interface mismatch is handled.
        const pdfModules: ModuleWithMaterials[] = (Array.isArray(pdfsData) ? pdfsData : (pdfsData?.data || [])) as ModuleWithMaterials[];
        const lectureModules: ModuleWithLectures[] = (Array.isArray(lecturesData) ? lecturesData : (lecturesData?.data || [])) as ModuleWithLectures[];

        // Base modules from enrollment data (Source of Truth for curriculum structure)
        let baseModules = data.modules || [];
        // Handle mongoose _doc if present
        if (baseModules.length > 0) {
          baseModules = baseModules.map((m: any) => m._doc || m);
        }

        // Merge logic: Iterate over baseModules and attach lectures/PDFs
        let mergedModules = baseModules.map((baseMod: any) => {
          // Find matching lecture module (for videos and extra metadata like index)
          const lMod = lectureModules.find(lm => lm._id === baseMod._id);
          // Find matching PDF module
          const pMod = pdfModules.find(pm => pm._id === baseMod._id);

          return {
            ...baseMod,
            // Ensure title/name is populated
            title: baseMod.moduleName || baseMod.title || (lMod ? lMod.moduleName : '') || (pMod ? pMod.moduleName : ''),
            // Use metadata from lMod if available, else fallback to base
            moduleIndex: lMod ? lMod.moduleIndex : (baseMod.moduleIndex || 0),
            moduleDescription: lMod ? lMod.moduleDescription : (baseMod.moduleDescription || ''),
            // Attach lectures (ensure array)
            lectures: lMod && lMod.lectures ? lMod.lectures : [],
            // Attach PDFs (ensure array)
            pdfs: pMod && pMod.materials ? pMod.materials : []
          };
        });

        // Fallback: If baseModules was empty but we have lectureModules (API discrepancy case), use lectureModules
        if (mergedModules.length === 0 && lectureModules.length > 0) {
          mergedModules = lectureModules.map(lMod => {
            const matchingPdfMod = pdfModules.find(pMod => pMod._id === lMod._id);
            return {
              ...lMod,
              title: lMod.moduleName,
              lectures: lMod.lectures,
              pdfs: matchingPdfMod ? matchingPdfMod.materials : []
            };
          });
        }

        // Sort modules by index
        mergedModules.sort((a: any, b: any) => (a.moduleIndex || 0) - (b.moduleIndex || 0));

        // Assign merged modules to courseData
        data.modules = mergedModules;

        // Normalize course properties if needed
        if (data.course) {
          data.course.title = data.course.courseTitle || data.course.title;
          if (data.course.courseThumbnail?.secureUrl) {
            data.course.thumbnail = data.course.courseThumbnail.secureUrl;
          }
        }

        // Ensure progress object exists
        if (!data.progress) {
          data.progress = {
            completed: data.enrollment?.completedLectures?.length || 0,
            total: data.course?.totalLectures || 0,
            percentage: 0
          };

          // Calculate percentage if missing
          const total = data.progress.total || data.course?.totalLectures || 0;
          const completed = data.enrollment?.completedLectures?.length || 0;
          if (total > 0 && (!data.progress.percentage || data.progress.percentage === 0)) {
            data.progress.percentage = Math.round((completed / total) * 100);
          }
        }

        this.courseData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load course data:', err);
        this.error = 'Failed to load course data';
        this.loading = false;
      }
    });
  }

  isCompleted(lectureId: string): boolean {
    return this.courseData?.enrollment.completedLectures?.includes(lectureId) || false;
  }

  isActive(lectureId: string): boolean {
    // For now, simplicity: if not completed and it's the first incomplete one
    // Real logic would be based on last-watched status from backend
    return false;
  }

  getLectureClass(lectureId: string): string {
    if (this.isCompleted(lectureId)) {
      return 'border-[#aae2c5] bg-[#D1FAE5]';
    }
    if (this.isActive(lectureId)) {
      return 'border-[#bae0eb] bg-[#CEEBF3]';
    }
    return 'border-[#E5E7EB] bg-[#F9FAFB]';
  }

  get currentLesson(): any {
    if (!this.courseData || !this.courseData.modules) return null;

    // Sort modules by index just to be safe, though already sorted in loadCourseData
    const sortedModules = [...this.courseData.modules].sort((a, b) => (a.moduleIndex || 0) - (b.moduleIndex || 0));

    for (const module of sortedModules) {
      if (module.lectures && module.lectures.length > 0) {
        // Find the first uncompleted lecture in this module
        const firstUncompleted = module.lectures.find((l: any) => !this.isCompleted(l._id));

        if (firstUncompleted) {
          return {
            lecture: firstUncompleted,
            moduleTitle: module.title,
            // 1-based index within the module
            lectureIndex: module.lectures.indexOf(firstUncompleted) + 1,
            totalLessons: module.lectures.length
          };
        }
      }
    }

    // If all videos are completed, show the last watched or a "Course Completed" state?
    // For now, returning null hides the block, which is acceptable or we can show the first one again.
    return null;
  }

  playLecture(module: any, lecture: any): void {
    if (!this.courseData) return;
    this.router.navigate(['/student/recorded-course-video', this.courseData.course._id], {
      queryParams: {
        moduleId: module._id,
        lectureId: lecture._id
      }
    });
  }

  openPdf(module: any, pdf: any): void {
    // 1. Try to open PERMANENT secure links directly if available
    const strictSecureUrl =
      (pdf.pdfMaterialInfo && pdf.pdfMaterialInfo.secureUrl) ||
      pdf.secureUrl;

    if (strictSecureUrl) {
      window.open(strictSecureUrl, '_blank');
      return;
    }

    if (!pdf?._id) {
      alert('Cannot open PDF: Invalid data');
      return;
    }

    // 2. Fetch fresh details from API 2
    this.studentCourseService.getSinglePdf(pdf._id).subscribe({
      next: (res: any) => {
        let detail = res;
        // Handle array response
        if (Array.isArray(res) && res.length > 0) {
          detail = res[0];
        } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          detail = res.data[0];
        }

        let url =
          (detail.pdfMaterialInfo && detail.pdfMaterialInfo.secureUrl) ||
          detail.secureUrl ||
          (detail.pdf && detail.pdf.pdfUrl) ||
          detail.pdfUrl;

        // FIX: If URL is a Cloudinary API download link (which is often broken/signed incorrectly),
        // try to construct a direct delivery URL.
        if (url && url.includes('api.cloudinary.com') && url.includes('/download')) {
          try {
            // Extract Cloud Name
            const cloudNameMatch = url.match(/v1_1\/([^/]+)\//);
            const cloudName = cloudNameMatch ? cloudNameMatch[1] : 'dvizkrkox'; // Fallback to known cloud name if parsing fails

            // Extract Public ID
            const urlObj = new URL(url);
            let publicId = urlObj.searchParams.get('public_id');

            if (publicId) {
              // Start of the fix: Construct direct URL
              // Ensure it starts with the folder if needed (it usually is in public_id)
              // AND ensure it ends with .pdf
              if (!publicId.toLowerCase().endsWith('.pdf')) {
                publicId = publicId + '.pdf';
              }

              const directUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
              console.log('Repaired Cloudinary URL:', directUrl);
              url = directUrl;
            }
          } catch (e) {
            console.error('Failed to parse/repair Cloudinary URL', e);
          }
        }

        if (url) {
          window.open(url, '_blank');
        } else {
          alert('PDF file URL not found.');
        }
      },
      error: (err: any) => {
        console.error('Failed to retrieve PDF access:', err);
        alert('Failed to retrieve PDF access. Please try again.');
      }
    });
  }

}




