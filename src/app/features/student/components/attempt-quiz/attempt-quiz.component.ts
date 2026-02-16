// attempt quiz component
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { StudentQuizService } from '../../../../core/services/student/quiz/quiz.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { QuizQuestion, QuizAnswer, QuestionType } from '../../../../core/interfaces/student/quiz/quiz.interface';
import { Subscription, interval, switchMap, of, map } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-attempt-quiz',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './attempt-quiz.component.html',
  styleUrl: './attempt-quiz.component.css'
})
export class AttemptQuizComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  submitting = false;

  quizTitle = '';
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;

  answersMap: {
    [key: string]: {
      response: {
        optionIds?: string[];
        boolean?: boolean;
        text?: string;
      };
      timeTakenSeconds: number;
    }
  } = {};

  totalTimeSeconds = 0;
  questionTimerSeconds = 0;
  private timerSub: Subscription | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: StudentQuizService,
    private enrollmentService: EnrollmentService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const attempt = this.quizService.getCurrentAttempt();

    if (attempt && attempt.questions?.length > 0) {
      this.quizTitle = attempt.quiz.title;
      this.initAttempt(attempt.questions);
      return;
    }

    const quizId = this.route.snapshot.queryParamMap.get('quizId');
    if (quizId) {
      this.loading = true;
      this.quizService.startAttempt(quizId).pipe(
        switchMap(response => {
          if (!response || !response.course) {
            return of({ response, isEnrolled: true });
          }
          const courseId = (response.course as any)._id || response.course;
          return this.enrollmentService.checkEnrollmentStatus(courseId).pipe(
            map(enrollmentStatus => ({ response, isEnrolled: enrollmentStatus.isEnrolled }))
          );
        })
      ).subscribe({
        next: ({ response, isEnrolled }) => {
          if (!isEnrolled) {
            this.messageService.add({ severity: 'error', summary: 'Access Denied', detail: 'You must be enrolled in this course to take the quiz.' });
            this.router.navigate(['/student/quiz']);
            return;
          }

          if (response && response.questions && response.questions.length > 0) {
            this.quizTitle = (typeof response.quiz === 'object') ? response.quiz?.title : 'Quiz';
            this.initAttempt(response.questions);
          } else {
            const courseId = (response.course as any)?._id || response.course;

            if (courseId) {
              this.quizService.getAvailableQuizzes(courseId).subscribe({
                next: (quizzes) => {
                  const targetQuiz = quizzes.find(q => q._id === quizId);
                  if (targetQuiz && (targetQuiz as any).questions?.length > 0) {
                    this.quizTitle = targetQuiz.title;
                    this.initAttempt((targetQuiz as any).questions);
                  } else {
                    this.error = 'Failed to load quiz questions. Please contact support.';
                    this.loading = false;
                  }
                },
                error: (err) => {
                  this.error = 'Failed to load quiz details.';
                  this.loading = false;
                }
              });
            } else {
              this.error = 'Failed to load quiz questions (No course ID found).';
              this.loading = false;
            }
          }
        },
        error: (err) => {
          this.error = 'Failed to start quiz. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No active quiz session found. Please start from the quiz list.';
      this.loading = false;
    }
  }

  initAttempt(questions: any[]): void {
    if (!questions || questions.length === 0) {
      this.error = 'Failed to load quiz questions.';
      this.loading = false;
      return;
    }

    this.questions = questions.map(q => {
      let type = q.type;
      if (type === 'single_choice') type = 'trueFalse';
      if (type === 'multiple_choice') type = 'multipleChoice';
      if (type === 'short_answer') type = 'shortAnswer';

      return {
        ...q,
        _id: q._id || q.questionId || q.id,
        prompt: q.prompt || q.text || q.questionText,
        type: type,
        options: (q.options || []).map((opt: any) => ({
          ...opt,
          _id: opt._id || opt.optionId || opt.id,
          text: opt.text || opt.optionText
        }))
      };
    });

    this.questions.forEach(q => {
      this.answersMap[q._id] = {
        response: {},
        timeTakenSeconds: 0
      };
    });

    this.loading = false;
    this.startTimer();
  }

  startTimer(): void {
    if (this.timerSub) return;
    this.timerSub = interval(1000).subscribe(() => {
      this.totalTimeSeconds++;
      this.questionTimerSeconds++;

      const currentQ = this.questions[this.currentQuestionIndex];
      if (currentQ && this.answersMap[currentQ._id]) {
        this.answersMap[currentQ._id].timeTakenSeconds++;
      }
    });
  }

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  toggleOption(optionId: string): void {
    const q = this.currentQuestion;
    const qId = q._id;
    const currentResponse = this.answersMap[qId].response;

    if (q.type === 'trueFalse' || q.type === 'multipleChoice') {
      currentResponse.optionIds = [optionId];
    }
  }

  isOptionSelected(optionId: string): boolean {
    const qId = this.currentQuestion._id;
    return this.answersMap[qId]?.response.optionIds?.includes(optionId) || false;
  }

  handleShortAnswer(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.answersMap[this.currentQuestion._id].response.text = text;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.questionTimerSeconds = 0;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.questionTimerSeconds = 0;
    }
  }

  submitQuiz(): void {
    const attempt = this.quizService.getCurrentAttempt();
    if (!attempt) return;

    this.submitting = true;

    const answers: any[] = Object.keys(this.answersMap).map(questionId => {
      const answerData = this.answersMap[questionId];
      const question = this.questions.find(q => q._id === questionId);

      const payload: any = { questionId };

      if (answerData.response.optionIds && answerData.response.optionIds.length > 0) {
        payload.optionId = answerData.response.optionIds[0];
        const option = question?.options.find(opt => opt._id === payload.optionId);
        payload.selectedOption = option?.label;
        payload.selectedAnswer = option?.text;
      } else if (answerData.response.text) {
        payload.text = answerData.response.text;
        payload.selectedAnswer = answerData.response.text;
      }

      payload.timeSpent = answerData.timeTakenSeconds;
      payload.skipped = !payload.optionId && !payload.text;

      return payload;
    });

    this.quizService.submitQuiz(attempt.attemptId, answers).subscribe({
      next: (results) => {
        this.router.navigate(['/student/quiz']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit quiz. Please try again.' });
        this.submitting = false;
      }
    });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}



