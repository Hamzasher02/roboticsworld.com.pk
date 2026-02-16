export interface DeletionPerformedBy {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface DeletionAffectedRef {
    model: string;
    refId: string;
}

export interface DeletionHistoryItem {
    _id: string;
    itemId: string;
    itemName: string; // Name of the deleted item
    itemModel: string; // The "Type" (e.g., 'User', 'Course')
    performedBy: DeletionPerformedBy | null;
    affectedRefs: DeletionAffectedRef[];
    createdAt: string; // Deletion Date
    updatedAt: string;
}

export interface DeletionHistoryPagination {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
}

export interface GetAllDeletionHistoryResponse {
    success: boolean;
    message: string;
    pagination: DeletionHistoryPagination;
    data: DeletionHistoryItem[];
}
