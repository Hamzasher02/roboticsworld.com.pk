import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location as NgLocation } from '@angular/common';

type AnswerKey = 'A' | 'B' | 'C' | 'D';

type QuizOption = { key: AnswerKey; text: string };

type QuizQuestion = {
  no: number;
  question: string;
  time: string;
  status: 'Correct' | 'Wrong';
  studentAnswerKey: AnswerKey;
  correctAnswerKey: AnswerKey;
  options: QuizOption[];
};

type StudentAttemptStatus = 'completed' | 'in progress' | 'not started';

type StudentAttemptRow = {
  name: string;
  email: string;
  avatar: string;
  status: StudentAttemptStatus;
  score: string | null;
  timeSpent: string | null;
  attemptDate: string | null;
};

@Component({
  selector: 'app-student-quiz-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-quiz-view.component.html',
  styleUrl: './student-quiz-view.component.css',
})
export class StudentQuizViewComponent {
  quizId!: string;
  attemptId!: string;

  // ✅ attempt data route state se (instant)
  attempt: StudentAttemptRow | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private location: NgLocation) {}

  ngOnInit(): void {
    this.quizId = this.route.parent?.snapshot.paramMap.get('id') || '';
    this.attemptId = this.route.snapshot.paramMap.get('attemptId') || '';

    // state se attempt (fast)
    this.attempt = (history.state?.attempt as StudentAttemptRow) ?? null;

    // TODO: agar refresh ho jaye state na mile, yahan API call kar ke attempt load kar lena via attemptId
    // this.fetchAttemptById(this.attemptId)
  }

  get title(): string {
    const nm = this.attempt?.name || 'Student';
    return `${nm}'s Quiz Attempt`;
  }

  get subTitle(): string {
    const score = this.attempt?.score ?? '-';
    const time = this.attempt?.timeSpent ?? '-';
    return `Score: ${score} - Time: ${time}`;
  }

  close(): void {
    this.location.back();
  }

  // Demo data (API se replace)
  questions: QuizQuestion[] = [
    {
      no: 1,
      question: 'What is the primary programming language for web development?',
      time: '45s',
      status: 'Correct',
      studentAnswerKey: 'A',
      correctAnswerKey: 'A',
      options: [
        { key: 'A', text: 'JavaScript' },
        { key: 'B', text: 'Python' },
        { key: 'C', text: 'Java' },
        { key: 'D', text: 'C++' },
      ],
    },
    {
      no: 2,
      question: 'Which library is commonly used for building user interfaces?',
      time: '60s',
      status: 'Correct',
      studentAnswerKey: 'A',
      correctAnswerKey: 'A',
      options: [
        { key: 'A', text: 'React' },
        { key: 'B', text: 'Express' },
        { key: 'C', text: 'MongoDB' },
        { key: 'D', text: 'MySQL' },
      ],
    },
  ];

  isSelected(q: QuizQuestion, opt: QuizOption): boolean {
    return q.studentAnswerKey === opt.key;
  }

  isCorrect(q: QuizQuestion): boolean {
    return q.status === 'Correct';
  }
}

