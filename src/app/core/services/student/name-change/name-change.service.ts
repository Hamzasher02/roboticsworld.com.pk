import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import { NameChangeRequest, NameChangeResponse } from '../../../interfaces/student/name-change/name-change.interface';

/**
 * Service for student name change operations.
 */
@Injectable({ providedIn: 'root' })
export class NameChangeService {
    private readonly BASE_PATH = '/namechange';

    constructor(private api: ApiClientService) { }

    /**
     * Create a name change request.
     * POST /namechange/createNameChangeRequest
     */
    createNameChangeRequest(payload: NameChangeRequest): Observable<NameChangeResponse> {
        return this.api.post<NameChangeResponse>(
            `${this.BASE_PATH}/createNameChangeRequest`,
            payload
        );
    }
}
