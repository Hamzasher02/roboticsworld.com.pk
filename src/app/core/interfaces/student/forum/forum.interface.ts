/**
 * Forum interfaces for discussion forum operations.
 */

export interface ForumCategory {
    id: string;
    _id?: string;
    name?: string;
    category?: string;
    categoryName?: string; // Actual field name from API
    slug?: string;
    description?: string;
    postCount?: number;
}

export interface ForumAuthor {
    id: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    profilePicture?: string;
}

export interface ForumAttachment {
    url: string;
    type?: 'image' | 'file' | 'video';
    name?: string;
}

export interface ForumPost {
    postId?: string;
    id: string; // Correctly mapped
    _id?: string; // Original ID from some endpoints
    title: string;
    content: string;
    descriptionPreview?: string; // Preview text from API
    excerpt?: string;
    category: { id: string, _id?: string, name?: string, category?: string, categoryName?: string } | null;
    tags: string[];
    author: ForumAuthor;
    isEdited?: boolean;
    likeCount: number;
    commentCount: number;
    isLikedByUser: boolean;
    status?: string; // e.g., 'pending', 'answered'
    createdAt: string;
    updatedAt: string;
}

export interface ForumComment {
    id: string; // Standard ID
    commentId: string;
    postId: string;
    content: string;
    author: ForumAuthor;
    likeCount: number;
    isLikedByUser: boolean;
    isAcceptedAnswer?: boolean;
    parentCommentId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostRequest {
    title: string;
    description: string;
    categoryId?: string;
    tags?: string[];
    attachments?: ForumAttachment[];
}

export interface AddCommentRequest {
    content: string;
    parentCommentId?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ForumPostListResponse {
    items: ForumPost[];
    pagination: PaginationInfo;
}

export interface ForumCommentListResponse {
    items: ForumComment[];
    pagination: PaginationInfo;
}

export interface ToggleLikeResponse {
    postId?: string;
    commentId?: string;
    isLikedByUser: boolean;
    likeCount: number;
}

export interface PostQueryParams {
    page?: number;
    limit?: number;
    q?: string;
    categoryId?: string;
    tag?: string;
    sort?: 'newest' | 'oldest' | 'most_liked' | 'most_commented';
    [key: string]: string | number | boolean | undefined;
}

export interface CommentQueryParams {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'most_liked';
    [key: string]: string | number | boolean | undefined;
}
