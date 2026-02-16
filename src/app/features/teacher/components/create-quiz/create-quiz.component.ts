import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

type MethodKey = 'ai' | 'manual';

type BenefitCard = {
  title: string;
  subtitle: string;
  iconBg: string;
  icon: string;
};

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-quiz.component.html',
})
export class CreateQuizComponent {
  constructor(private router: Router) {}

  // Top bar
  header = {
    title: 'Create New Quiz',
    subtitle: 'Choose your preferred creation method',
    backIcon: '/assets/instructor-images/quiz/backarrow.svg',          // 👈 replace
    headerIcon: '/assets/instructor-images/quiz/Vector (3).svg',      // 👈 replace (small square icon)
  };

  // Main cards
  methods = [
    {
      key: 'ai' as MethodKey,
      icon: '/assets/instructor-images/quiz/Vector (4).svg', // 👈 replace (purple icon)
      title: 'AI-Powered Quiz Generator',
      desc:
        'Upload your course materials or provide text prompts to let AI create comprehensive, contextual quizzes',
      items: [
        'Upload PDF, DOCX, PPT, TXT files',
        'Or provide text prompts for content',
        'AI generates MCQs and other question types',
        'Review, edit, and customize before publishing',
      ],
      tagTitle: 'SMART FEATURES',
      tagDesc: 'Content analysis • Auto-difficulty • Learning alignment',
      cardBg: 'bg-[#F6F3FF]',
      iconBg: 'bg-[#6D4CFF]',
      tagText: 'text-[#8A3FFC]',
      tagDot: '/assets/instructor-images/quiz/tick.svg', // 👈 replace (tiny icon)
      decoDot: true,
    },
    {
      key: 'manual' as MethodKey,
      icon: '/assets/instructor-images/quiz/Vector (6).svg', 
      title: 'Manual Quiz Builder',
      desc:
        'Create custom quizzes from scratch with full control using our intuitive builder and question library',
      items: [
        'Multiple question types & templates',
        'Drag-and-drop question builder',
        'Question bank integration',
        'Advanced customization options',
      ],
      tagTitle: 'PRECISION CONTROL',
      tagDesc: 'Custom scoring • Advanced settings • Template library',
      cardBg: 'bg-[#EEF5FF]',
      iconBg: 'bg-[#11B4D6]',
      tagText: 'text-[#2563EB]',
      tagDot: '/assets/instructor-images/quiz/tick.svg', // 👈 replace (tiny icon)
      closeIcon: '/assets/instructor-images/quiz/Vector (5).svg', // 👈 replace (top-right X)
    },
  ];

  // Bottom benefit cards (3)
  benefits: BenefitCard[] = [
    {
      title: 'Save Time',
      subtitle: 'Create quizzes 5× faster with AI assistance',
      iconBg: 'bg-[#E9FBEE]',
      icon: '/assets/instructor-images/quiz/Vector (7).svg', // 👈 replace
    },
    {
      title: 'Better Outcomes',
      subtitle: 'Aligned with learning objectives',
      iconBg: 'bg-[#EAF2FF]',
      icon: '/assets/instructor-images/quiz/Vector (16).svg', // 👈 replace
    },
    {
      title: 'Full Control',
      subtitle: 'Edit and customize every detail',
      iconBg: 'bg-[#F4ECFF]',
      icon: '/assets/instructor-images/quiz/Vector (8).svg', // 👈 replace
    },
  ];

  goBack(): void {
    window.history.back();
  }


  closeManualCard(): void {
    // only UI action (optional)
    console.log('Close manual card');
  }
  chooseMethod(method: MethodKey): void {
  if (method === 'ai') {
    this.router.navigate(['/instructor/instructor-quiz/create-ai-quiz']);
    return;
  }

  // manual route (jab bana lo)
  this.router.navigate(['/instructor/instructor-quiz/create-manual-quiz']); // optional
}
}
