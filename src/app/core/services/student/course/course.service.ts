import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import { ApiResponse } from '../../../http/api.types';
import {
    Course,
    CourseQueryParams,
} from '../../../interfaces/student/course/course.interface';

/**
 * Service for student-side course browsing operations.
 */
@Injectable({ providedIn: 'root' })
export class StudentCourseService {
    private readonly BASE_PATH = '/course';

    constructor(private api: ApiClientService) { }

    /**
     * Get all courses available to students.
     * GET /course/getAllCoursesStudentSide
     */
    getAllCourses(params?: CourseQueryParams): Observable<ApiResponse<Course[]>> {
        return this.api.getFullResponse<Course[]>(
            `${this.BASE_PATH}/getAllCoursesUserSide`,
            params
        );
    }

    /**
     * Get a single course by ID (student view).
     * GET /course/getSingleCourseStudentSide/:courseId
     */
    getCourseById(courseId: string): Observable<Course> {
        return this.api.get<Course>(
            `${this.BASE_PATH}/getSingleCourseStudentSide/${courseId}`
        );
    }

    /**
     * Get course with full API response (including success/message).
     */
    getCourseByIdFull(courseId: string): Observable<ApiResponse<Course>> {
        return this.api.getFullResponse<Course>(
            `${this.BASE_PATH}/getSingleCourseStudentSide/${courseId}`
        );
    }

    /**
     * Get all PDFs module wise for a student given a course ID.
     * GET /coursepdfmaterial/getAllPdfsStudentSideModuleWise/:courseId
     */
    getPdfsModuleWise(courseId: string): Observable<any> {
        return this.api.get<any>(
            `/coursepdfmaterial/getAllPdfsStudentSideModuleWise/${courseId}`
        );
    }

    /**
     * Get all lectures module wise for a student given a course ID.
     * GET /courselectures/getAllLecturesStudentSideModuleWise/:courseId
     */
    getLecturesModuleWise(courseId: string): Observable<any> {
        return this.api.get<any>(
            `/courselectures/getAllLecturesStudentSideModuleWise/${courseId}`
        );
    }


    /**
     * Get single PDF for a student
     * GET /coursepdfmaterial/getSinglePdfStudentSide/:pdfId
     */
    getSinglePdf(pdfId: string): Observable<any> {
        return this.api.get<any>(
            `/coursepdfmaterial/getSinglePdfStudentSide/${pdfId}`
        );
    }

    /**
     * Get single lecture for a student
     * GET /courselectures/getSingleLectureStudentSide/:lectureId
     */
    getSingleLectureStudentSide(lectureId: string): Observable<any> {
        return this.api.get<any>(
            `/courselectures/getSingleLectureStudentSide/${lectureId}`
        );
    }
}

