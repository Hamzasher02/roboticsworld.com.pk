import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TabKey = 'overview' | 'questions' | 'settings';
type QuizStatus = 'Published' | 'Under Review' | 'Draft';

type Quiz = {
  title: string;
  id: string;
  instructor: string;
  course: string;
  date: string;
  status: QuizStatus;
  attempts: number;
  avg: number;
  completion: number;
  instructorAvatar: string;
};
type Question = {
  no: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: string;
  text: string;
  options: { text: string; correct?: boolean }[];
};

@Component({
  selector: 'app-quiz-reveiw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-reveiw.component.html',
  styleUrl: './quiz-reveiw.component.css'
})
export class QuizReveiwComponent {
  @Input() quiz: Quiz | null = null;
  @Output() close = new EventEmitter<void>();

  activeTab: TabKey = 'overview';

  // Send back mode (overview screen -> textarea screen)
  sendBackMode = false;
  comments = '';

  // Overview values (dynamic)
  totalQuestions = 4;
  totalPoints = 10;
  estimatedDuration = '15 minutes';
  difficulty = { easy: 2, medium: 1, hard: 1 };

  // Questions mock (dynamic structure)
  questions: Question[] = [
    {
      no: 'Q1',
      type: 'Multiple Choice',
      difficulty: 'Easy',
      points: '2 pts',
      text: 'What is the correct way to declare a variable in JavaScript?',
      options: [
        { text: 'var x = 5;', correct: true },
        { text: 'variable x = 5;' },
        { text: 'x = 5;' },
        { text: 'declare x = 5;' },
      ],
    },
    {
      no: 'Q2',
      type: 'Multiple Choice',
      difficulty: 'Medium',
      points: '2 pts',
      text: 'Which method is used to add an element to the end of an array?',
      options: [
        { text: 'push()', correct: true },
        { text: 'pop()' },
        { text: 'shift()' },
        { text: 'unshift()' },
      ],
    },
  ];

  // Settings model
  attemptsAllowed = '1 attempt';
  passingScore = 70;

  gradingRelease = 'After all attempts';
  lateSubmission = 'Not allowed';
  proctoring = 'Disabled';

  randomization = 'Enabled';

  shuffleAnswers = true;
  autoSaveResponses = false;

  showProgressBar = true;
  allowReviewBeforeSubmit = true;
  showAnswerReview = true;

  accessCode = '';
  ipRestrictions = '';

  setTab(tab: TabKey) {
    this.activeTab = tab;
    if (tab !== 'overview') this.sendBackMode = false;
  }

  openSendBack() {
    this.activeTab = 'overview';
    this.sendBackMode = true;
  }

  cancelSendBack() {
    this.sendBackMode = false;
    this.comments = '';
  }

  submitSendBack() {
    // API call placeholder
    // console.log('Send back', this.quiz?.id, this.comments);
    this.sendBackMode = false;
    this.comments = '';
  }

  approveAndPublish() {
    // API call placeholder
    // console.log('Approve', this.quiz?.id);
    this.close.emit();
  }

  editQuiz() {
    // route / open edit screen placeholder
    // console.log('Edit', this.quiz?.id);
  }

  badgeClassesDifficulty(d: Question['difficulty']) {
    if (d === 'Easy') return 'bg-[#E8F7EE] text-[#16A34A] border-[#D1F2DF]';
    if (d === 'Medium') return 'bg-[#FFF6DF] text-[#D97706] border-[#FDE7B3]';
    return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
  }
}
