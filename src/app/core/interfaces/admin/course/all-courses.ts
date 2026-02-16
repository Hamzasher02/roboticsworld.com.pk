
export interface CourseListItemDTO {
    _id: string;
    courseTitle: string;
}

export interface GetAllCoursesResponse {
    success: boolean;
    message: string;
    data: CourseListItemDTO[];
}
