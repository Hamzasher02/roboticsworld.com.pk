import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { CreateQuizRequest, CreateQuizResponse } from '../../../interfaces/teacher/create-quiz/create-quiz';

@Injectable({ providedIn: 'root' })
export class InstructorQuizService {
  private readonly CREATE_QUIZ_URL = `${environment.apiBaseUrl}/quiz/createQuiz`;

  constructor(private http: HttpClient) {}

  // ✅ create quiz (JSON)
  createQuiz(payload: CreateQuizRequest): Observable<CreateQuizResponse> {
    return this.http
      .post<CreateQuizResponse>(this.CREATE_QUIZ_URL, payload, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
