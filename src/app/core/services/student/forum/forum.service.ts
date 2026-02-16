import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    ForumCategory,
    ForumPost,
    ForumComment,
    ForumAuthor,
    PostQueryParams,
    ForumPostListResponse,
    ForumCommentListResponse,
    ToggleLikeResponse,
    CommentQueryParams,
    CreatePostRequest
} from '../../../interfaces/student/forum/forum.interface';

/**
 * Service for discussion forum operations.
 */
@Injectable({ providedIn: 'root' })
export class ForumService {
    private readonly DISCUSSION_PATH = '/discussion';
    private readonly CATEGORY_PATH = '/category';

    constructor(private api: ApiClientService) { }

    // ─────────────────────────────────────────────────────────────
    // Categories
    // ─────────────────────────────────────────────────────────────

    /**
     * Get all forum categories.
     * GET /category/getAllCategory
     */
    getCategories(): Observable<ForumCategory[]> {
        return this.api.get<any>(`${this.CATEGORY_PATH}/getAllCategory`).pipe(
            map((res: any) => {
                // The provided response has categories in the 'data' array
                const cats = Array.isArray(res) ? res : (res?.data || res?.items || res?.categories || []);
                return cats.map((cat: any) => ({
                    ...cat,
                    id: cat.id || cat._id
                }));
            })
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Posts
    // ─────────────────────────────────────────────────────────────

    /**
     * Create a new forum post.
     * POST /discussion/createPost
     */
    createPost(data: CreatePostRequest): Observable<ForumPost> {
        return this.api.post<any>(
            `${this.DISCUSSION_PATH}/createPost`,
            data
        ).pipe(
            map(res => res?.data || res)
        );
    }

    /**
     * Get all forum posts with optional filters.
     * GET /discussion/getPosts
     */
    getPosts(params?: PostQueryParams): Observable<ForumPostListResponse> {
        return this.api.get<any>(
            `${this.DISCUSSION_PATH}/getPosts`,
            params
        ).pipe(
            map(res => {
                // The provided response has posts in res.data.posts or res.posts
                const data = res?.data || res;
                const rawItems = Array.isArray(data.posts) ? data.posts : (Array.isArray(res) ? res : []);
                const items = rawItems.map((post: any) => ({
                    ...post,
                    id: post._id || post.id || post.postId,
                    postId: post.postId || post.id || post._id,
                    author: this.normalizeAuthor(post.author),
                    isLikedByUser: post.isLikedByUser !== undefined ? post.isLikedByUser : (post.isLiked !== undefined ? post.isLiked : (post.liked !== undefined ? post.liked : (post.likedByUser !== undefined ? post.likedByUser : false))),
                    likeCount: post.likeCount !== undefined ? post.likeCount : (post.likes !== undefined ? post.likes : 0)
                }));
                const pagination = data.pagination || res?.pagination || {
                    page: 1,
                    limit: items.length,
                    total: items.length,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false
                };
                return { items, pagination };
            })
        );
    }

    /**
     * Get a single post details.
     * GET /discussion/getPost/:postId
     */
    getPostById(postId: string): Observable<ForumPost> {
        return this.api.get<any>(`${this.DISCUSSION_PATH}/getPost/${postId}`).pipe(
            map(res => {
                const post = res?.data || res;
                return {
                    ...post,
                    id: post._id || post.id || post.postId,
                    postId: post.postId || post.id || post._id,
                    author: this.normalizeAuthor(post.author),
                    isLikedByUser: post.isLikedByUser !== undefined ? post.isLikedByUser : (post.isLiked !== undefined ? post.isLiked : (post.liked !== undefined ? post.liked : (post.likedByUser !== undefined ? post.likedByUser : false))),
                    likeCount: post.likeCount !== undefined ? post.likeCount : (post.likes !== undefined ? post.likes : 0)
                };
            })
        );
    }

    /**
     * Toggle like on a post.
     * POST /discussion/toggleLike/:postId
     */
    toggleLikePost(postId: string): Observable<ToggleLikeResponse> {
        // Send a broad payload to cover different potential backend expectations
        const payload = {
            postId,
            post: postId,
            id: postId,
            itemId: postId
        };
        return this.api.post<any>(
            `${this.DISCUSSION_PATH}/toggleLike/${postId}`,
            payload
        ).pipe(
            map(res => {
                const data = res?.data || res;
                return {
                    postId,
                    isLikedByUser: data.liked !== undefined ? data.liked : (data.isLikedByUser !== undefined ? data.isLikedByUser : (data.isLiked !== undefined ? data.isLiked : false)),
                    likeCount: data.likeCount !== undefined ? data.likeCount : (data.likes !== undefined ? data.likes : 0)
                };
            })
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Comments
    // ─────────────────────────────────────────────────────────────

    /**
     * Get comments for a post.
     * GET /discussion/getComments/:postId
     */
    getComments(postId: string, params?: CommentQueryParams): Observable<ForumCommentListResponse> {
        return this.api.get<any>(
            `${this.DISCUSSION_PATH}/getComments/${postId}`,
            params
        ).pipe(
            map(res => {
                const data = res?.data || res;
                const rawItems = Array.isArray(data.comments) ? data.comments : (Array.isArray(res) ? res : (res?.items || []));
                const items = rawItems.map((comment: any) => ({
                    ...comment,
                    id: comment.id || comment.commentId || comment._id,
                    commentId: comment.commentId || comment.id || comment._id,
                    author: this.normalizeAuthor(comment.author)
                }));
                const pagination = res?.pagination || {
                    page: 1,
                    limit: items.length,
                    total: items.length,
                    hasNext: false,
                    hasPrev: false
                };
                return { items, pagination };
            })
        );
    }

    /**
     * Add a comment to a post.
     * POST /discussion/addComment/:postId
     */
    addComment(
        postId: string,
        data: {
            content: string,
            parentCommentId?: string
        }
    ): Observable<ForumComment> {
        return this.api.post<any>(
            `${this.DISCUSSION_PATH}/addComment/${postId}`,
            data
        ).pipe(
            map(res => {
                const comment = res?.data || res;
                return {
                    ...comment,
                    id: comment.id || comment._id || comment.commentId,
                    commentId: comment.commentId || comment.id || comment._id,
                    author: this.normalizeAuthor(comment.author)
                };
            })
        );
    }

    private normalizeAuthor(author: any): ForumAuthor {
        if (!author) return { id: '', firstName: 'Unknown', lastName: 'User' };

        // Handle nested profilePicture object or string
        let profilePicture = '';
        if (typeof author.profilePicture === 'object' && author.profilePicture?.secureUrl) {
            profilePicture = author.profilePicture.secureUrl;
        } else if (typeof author.profilePicture === 'string') {
            profilePicture = author.profilePicture;
        }

        return {
            id: author.id || author._id || '',
            firstName: author.firstName || '',
            lastName: author.lastName || '',
            name: author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim(),
            avatarUrl: author.avatarUrl || profilePicture,
            profilePicture: profilePicture || author.avatarUrl
        };
    }

    /**
     * Accept a comment as the answer (post owner only).
     * PATCH /discussion/acceptAnswer/:commentId
     */
    acceptAnswer(commentId: string): Observable<{ commentId: string, postId: string, isAcceptedAnswer: true }> {
        return this.api.patch<any>(
            `${this.DISCUSSION_PATH}/acceptAnswer/${commentId}`,
            {}
        ).pipe(
            map(res => res?.data || res)
        );
    }

    /**
     * Toggle like on a comment.
     * POST /discussion/toggleCommentLike/:commentId
     */
    toggleCommentLike(commentId: string): Observable<ToggleLikeResponse> {
        return this.api.post<any>(
            `${this.DISCUSSION_PATH}/toggleCommentLike/${commentId}`,
            {}
        ).pipe(
            map(res => {
                const data = res?.data || res;
                return {
                    commentId: data.commentId || data.id || data._id || commentId,
                    isLikedByUser: data.isLikedByUser !== undefined ? data.isLikedByUser : (data.isLiked !== undefined ? data.isLiked : false),
                    likeCount: data.likeCount !== undefined ? data.likeCount : (data.likes !== undefined ? data.likes : 0)
                };
            })
        );
    }
}

