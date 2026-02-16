import { Injectable } from '@angular/core';
import { CourseDetailData } from '../../../interfaces/student/course-detail/course-detail';

export type EnrollmentType = 'Recorded Lectures' | 'Live Classes';

export interface EnrollmentState {
    courseData: CourseDetailData | null;
    enrollmentType: EnrollmentType | null;
    selectedTimeSlot: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class StudentEnrollmentStateService {
    private readonly STORAGE_KEY = 'enrollment_state';

    private state: EnrollmentState = this.loadState();

    private loadState(): EnrollmentState {
        const saved = sessionStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse enrollment state', e);
            }
        }
        return {
            courseData: null,
            enrollmentType: null,
            selectedTimeSlot: null
        };
    }

    private saveState(): void {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    }

    /**
     * Set the course data when user clicks "Buy Now"
     */
    setCourse(course: CourseDetailData): void {
        console.log('StudentEnrollmentStateService - setCourse - Received:', course?.course?.courseTitle);
        this.state.courseData = course;
        // Reset other fields when a new course is selected
        this.state.enrollmentType = null;
        this.state.selectedTimeSlot = null;
        this.saveState();
    }


    /**
     * Set the enrollment type (Recorded or Live)
     */
    setEnrollmentType(type: EnrollmentType): void {
        this.state.enrollmentType = type;
        if (type === 'Recorded Lectures') {
            this.state.selectedTimeSlot = null; // No time slot for recorded
        }
        this.saveState();
    }


    /**
     * Set the selected time slot for Live classes
     */
    setTimeSlot(time: string): void {
        this.state.selectedTimeSlot = time;
        this.saveState();
    }


    /**
     * Get the current state
     */
    getState(): EnrollmentState {
        return { ...this.state };
    }

    /**
     * Check if state is valid for checkout
     */
    isValid(): boolean {
        if (!this.state.courseData) return false;
        if (!this.state.enrollmentType) return false;
        if (this.state.enrollmentType === 'Live Classes' && !this.state.selectedTimeSlot) return false;
        return true;
    }

    /**
     * Clear state after successful enrollment
     */
    clearState(): void {
        this.state = {
            courseData: null,
            enrollmentType: null,
            selectedTimeSlot: null
        };
        sessionStorage.removeItem(this.STORAGE_KEY);
    }

}
