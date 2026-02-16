import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

type HeroData = { img: string; title: string; subtitle: string };
type FAQItem = { q: string; a: string };

type NavSection = { id: string; label: string };

@Component({
  selector: 'app-view-competition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-competition.component.html',
})
export class ViewCompetitionComponent implements AfterViewInit, OnDestroy {
    constructor(private router: Router) {}

  goToCompetitions() {
    console.log('clicked');
    this.router.navigateByUrl('/steam-mind/competition');
  }

  // -----------------------
  // HERO
  // -----------------------
  hero: HeroData = {
    img: 'assets/steam-mind/competition/hero.png',
    title: 'STEAM Minds Code Quest 2025',
    subtitle: 'Empowering young innovators to think, code, and create.',
  };

  // -----------------------
  // LEFT NAV (Dynamic)
  // -----------------------
  sections: NavSection[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'event-details', label: 'Event Details' },
    { id: 'about-competition', label: 'About Competition' },
    { id: 'rules-guidelines', label: 'Rules & Guidelines' },
    { id: 'rounds-evaluation', label: 'Rounds & Evaluation' },
    { id: 'prizes', label: 'Prizes' },
    { id: 'important-dates', label: 'Important Dates' },
    { id: 'why-participate', label: 'Why Participate' },
    { id: 'faq', label: 'FAQ' },
  ];

  activeSectionId = 'overview';

  private io?: IntersectionObserver;

  // -----------------------
  // CENTER DATA (Dynamic)
  // -----------------------
  overview = {
    bannerImg: 'assets/steam-mind/competition/overview.svg',
    description:
      'STEAM Minds, in partnership with leading technology educators, presents Code Quest 2025 – a dynamic online coding competition for students aged 8-18. Challenge yourself with programming problems across three exciting categories and showcase your coding skills on a global stage.',
    formatTitle: 'Format:',
    formatText:
      'Multiple coding challenges to be solved within the competition timeframe using category- appropriate tools and languages. Each challenge carries points based on difficulty level. The competition features real-time progress tracking, and students with the highest points in each category will be declared winners.',
    categoriesTitle: 'Categories:',
    categories: [
      { name: 'Scratch (Beginner)', text: 'Visual programming for ages 8-12.' },
      { name: 'Python (Intermediate)', text: 'Text-based coding for ages 11-15.' },
      { name: 'Web Development (Advanced)', text: 'HTML, CSS, JavaScript for ages 14-18' },
    ],
  };

  eventDetails = {
    leftTitle: 'Competition Details',
    leftRows: [
      { key: 'event', label: 'Event Name', value: 'STEAM Minds Code Quest 2025' },
      { key: 'org', label: 'Organizer', value: 'STEAM Minds' },
      { key: 'mode', label: 'Mode', value: 'Online' },
      { key: 'elig', label: 'Eligibility', value: 'Students aged 8-18' },
      { key: 'fee', label: 'Registration Fee', value: 'Free' },
    ],
    rightTitle: 'Important Dates',
    rightRows: [
      { key: 'reg', label: 'Registration Deadline', value: 'March 10, 2025' },
      { key: 'comp', label: 'Competition Dates', value: 'March 15-17, 2025' },
      { key: 'res', label: 'Results Announcement', value: 'March 24, 2025' },
      { key: 'prize', label: 'Prize Distribution', value: 'March 31, 2025' },
    ],
  };

  about = {
    paragraphs: [
      'STEAM Minds Code Quest 2025 is designed to inspire the next generation of programmers, problem-solvers, and digital innovators. Our competition provides a platform for young minds to showcase their creativity, logical thinking, and technical skills in a supportive and encouraging environment.',
      'The competition emphasizes learning through practice, collaboration, and healthy competition. Participants will work on real-world coding challenges that mirror the kind of problems professional developers solve daily, adapted for different skill levels and age groups.',
    ],
    missionTitle: 'Our Mission',
    missionText:
      'To democratize coding education and provide equal opportunities for all young learners to explore, learn, and excel in the field of computer science and technology innovation.',
  };

  rules = {
    registrationTitle: 'Registration Process',
    registrationSteps: [
      'Click the “Register Now” button on this page',
      'Fill out the registration form with accurate information',
      'Select your appropriate category based on age and skill level',
      'Confirm your registration via email verification',
    ],
    guidelinesTitle: 'Competition Guidelines',
    guidelines: [
      'Participants must work individually on all challenges',
      'Use of external help or collaboration is strictly prohibited',
      'All submissions must be original work',
      'Plagiarism will result in immediate disqualification',
      'Technical issues should be reported immediately to support',
      'Participants must have a stable internet connection',
      'Age verification may be required for prize claims',
    ],
    conductTitle: 'Code of Conduct',
    conduct: [
      'Maintain respectful behavior towards all participants',
      'Follow fair play principles throughout the competition',
      'Report any suspicious activities to organizers',
      'Respect intellectual property rights',
    ],
  };

  rounds = {
    structureTitle: 'Competition Structure',
    structure: [
      { no: 1, title: 'Qualification Round', subtitle: 'Initial challenges to assess basic skills', color: 'orange' },
      { no: 2, title: 'Main Competition', subtitle: 'Advanced problems and creative challenges', color: 'purple' },
      { no: 3, title: 'Final Showcase', subtitle: 'Present your best solution', color: 'orange' },
    ],
    criteriaTitle: 'Evaluation Criteria',
    criteriaLeft: [
      { title: 'Technical Skills (40%)', items: ['Code correctness and functionality', 'Algorithm efficiency', 'Problem-solving approach'] },
      { title: 'Code Quality (20%)', items: ['Clean, readable code', 'Proper documentation', 'Best practices'] },
    ],
    criteriaRight: [
      { title: 'Creativity & Innovation (30%)', items: ['Original thinking', 'Creative solutions', 'User experience design'] },
      { title: 'Presentation (10%)', items: ['Clear explanation', 'Demo quality', 'Communication skills'] },
    ],
  };

  prizes = {
    top: [
      { icon: '🥇', title: '1st Prize', amount: 'Rs. 30,000', color: 'gold', items: ['+ STEAM Minds Certificate', '+ Mentorship Program'] },
      { icon: '🥈', title: '2nd Prize', amount: 'Rs. 20,000', color: 'silver', items: ['+ STEAM Minds Certificate', '+ Coding Resources'] },
      { icon: '🥉', title: '3rd Prize', amount: 'Rs. 10,000', color: 'bronze', items: ['+ STEAM Minds Certificate', '+ Learning Materials'] },
    ],
    leftTitle: 'Additional Recognition',
    leftBlocks: [
      { title: 'Category Winners', text: 'Best performer in each category receives special recognition and prizes' },
      { title: 'Innovation Award', text: 'Most creative and innovative solution receives special recognition' },
    ],
    rightTitle: 'Participation Certificates',
    rightBlocks: [
      { title: 'Participation Certificates', text: 'All participants receive digital certificates of participation' },
      { title: 'Young Coder Award', text: 'Outstanding performance by youngest participants' },
    ],
  };

  importantDates = [
    { no: 1, title: 'Registration Opens', date: 'February 1, 2025', color: 'orange' },
    { no: 2, title: 'Registration Deadline', date: 'March 10, 2025', color: 'purple' },
    { no: 3, title: 'Competition Period', date: 'March 15–17, 2025', color: 'orange' },
    { no: 4, title: 'Results Announcement', date: 'March 24, 2025', color: 'purple' },
    { no: 5, title: 'Prize Distribution', date: 'March 31, 2025', color: 'orange' },
  ];

  why = {
    leftTitle: 'Skills You’ll Develop',
    rightTitle: 'Competition Benefits',
    skills: [
      { no: 1, title: 'Problem-Solving Skills', text: 'Learn to break down complex problems into manageable solutions' },
      { no: 2, title: 'Logical Thinking', text: 'Develop systematic approaches to coding challenges' },
      { no: 3, title: 'Creative Innovation', text: 'Express creativity through code and digital solutions' },
      { no: 4, title: 'Technical Proficiency', text: 'Master programming languages and development tools' },
    ],
    benefits: [
      { title: 'Global Recognition', text: 'Showcase your skills on an international platform' },
      { title: 'Networking Opportunities', text: 'Connect with like-minded young programmers worldwide' },
      { title: 'Career Preparation', text: 'Build a strong foundation for future tech careers' },
      { title: 'Confidence Building', text: 'Gain confidence through achievement and recognition' },
    ],
    futureTitle: 'Future Opportunities',
    futureText:
      'Participants in STEAM Minds Code Quest 2025 will be eligible for our year-round mentorship programs, advanced coding workshops, and priority consideration for our summer coding camps. Top performers may also receive recommendations for technology scholarships and internship opportunities.',
  };

  // -----------------------
  // FAQ (Dynamic)
  // -----------------------
  openIndex: number | null = null;
  faqs: FAQItem[] = [
    { q: 'What is STEAM Minds Code Quest 2025?', a: 'STEAM Minds Code Quest 2025 is an online coding competition for students aged 8–18.' },
    { q: 'Who can participate in the competition?', a: 'Students aged 8–18 can participate by registering in the relevant category.' },
    { q: 'Is there any registration fee?', a: 'No, registration is free.' },
    { q: 'What programming languages are supported?', a: 'Scratch, Python, and Web Development (HTML/CSS/JavaScript) based on category.' },
    { q: 'How will the competition be conducted?', a: 'It will be conducted online with timed coding challenges and scoring by difficulty.' },
    { q: 'When will results be announced?', a: 'Results will be announced on the published results announcement date.' },
  ];

  // -----------------------
  // RIGHT SIDE (Dynamic)
  // -----------------------
  info = [
    { key: 'mode', label: 'Mode:', value: 'Online' },
    { key: 'duration', label: 'Duration:', value: '3 Days' },
    { key: 'categories', label: 'Categories:', value: '3' },
    { key: 'age', label: 'Age Range:', value: '8–18 years' },
  ];

  shareButtons = [
    { type: 'fb', text: 'f', label: 'Share on Facebook' },
    { type: 'tw', text: 't', label: 'Share on Twitter' },
    { type: 'in', text: 'in', label: 'Share on LinkedIn' },
    { type: 'wa', text: 'w', label: 'Share on WhatsApp' },
  ];

  cta = {
    logo: 'assets/steam-mind/competition/demologo.svg',
    image: 'assets/steam-mind/competition/demoimage.svg',
    buttonText: 'View Latest Competitions',
  };

  // -----------------------
  // Behaviors
  // -----------------------
  toggleFaq(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngAfterViewInit(): void {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-section="true"]'));

    this.io = new IntersectionObserver(
      (entries) => {
        // pick the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) this.activeSectionId = visible.target.id;
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: '-10% 0px -70% 0px',
      }
    );

    targets.forEach((t) => this.io?.observe(t));
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  // -----------------------
  // TrackBys
  // -----------------------
  trackByIdx = (i: number) => i;
  trackById = (_: number, s: NavSection) => s.id;
  trackByKey = (_: number, r: { key: string }) => r.key;
}
