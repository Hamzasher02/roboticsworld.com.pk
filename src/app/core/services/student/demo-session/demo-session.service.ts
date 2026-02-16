import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    DemoSession,
    CreateDemoSessionRequest,
} from '../../../interfaces/student/demo-session/demo-session.interface';

/**
 * Service for demo session request operations.
 */
@Injectable({ providedIn: 'root' })
export class DemoSessionService {
    private readonly BASE_PATH = '/demosession';

    constructor(private api: ApiClientService) { }

    /**
     * Create a demo session request.
     * POST /demosession/createDemoSessionRequest
     */
    createDemoRequest(payload: CreateDemoSessionRequest): Observable<DemoSession> {
        return this.api.post<DemoSession>(
            `${this.BASE_PATH}/createDemoSessionRequest`,
            payload
        );
    }

    /**
     * Get all demo session requests for current student.
     * GET /demosession/getStudentDemoSessionRequests
     */
    getMyDemoRequests(): Observable<DemoSession[]> {
        return this.api.get<DemoSession[]>(
            `${this.BASE_PATH}/getStudentDemoSessionRequests`
        );
    }

    /**
     * Get a specific demo session request by ID.
     * Uses getMyDemoRequests and filters for now.
     */
    getDemoRequestById(id: string): Observable<DemoSession | undefined> {
        return this.getMyDemoRequests().pipe(
            map(sessions => sessions.find(s => s._id === id))
        );
    }
}

