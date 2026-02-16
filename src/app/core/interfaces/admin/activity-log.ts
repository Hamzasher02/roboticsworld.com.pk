export interface ActivityLogItem {
    _id: string;
    email: string | null;
    name: string | null;
    actionType: string | null;
    sessionStatus: string | null;
    ipAddress: string | null;
    location: string | null;
    actionDescription: string | null;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface ActivityLogsPagination {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
}

export interface GetAllActivityLogsResponse {
    success: boolean;
    message: string;
    pagination: ActivityLogsPagination;
    data: ActivityLogItem[];
}
