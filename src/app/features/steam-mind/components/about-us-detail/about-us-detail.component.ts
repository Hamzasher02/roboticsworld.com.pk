import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

type DetailKey = 'vr-labs' | 'kits' | 'steam-words';

interface DetailCta {
  label: string;
  key: DetailKey; // jis detail page par jana ho
  variant: 'solid' | 'outline';
}

interface AboutDetailModel {
  key: DetailKey;
  badge: string;
  paragraphs: string[];
  bulletsTitle?: string;
  bullets?: string[];
  sectionTitle?: string; 
  numbered?: string[];
  rightImage: string;
  rightImageAlt: string;
  rightFrame?: boolean; 
  ctas: DetailCta[];
}

@Component({
  selector: 'app-about-us-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us-detail.component.html',
  styleUrl: './about-us-detail.component.css',
})
export class AboutUsDetailComponent implements OnInit {
  activeKey: DetailKey = 'vr-labs';
  detail!: AboutDetailModel;

  // ✅ aap apni images yahan replace kar lena
  private details: Record<DetailKey, AboutDetailModel> = {
    'vr-labs': {
      key: 'vr-labs',
      badge: 'VR Labs',
      paragraphs: [
        `The VR Labs are immersive, simulation-based science environments that allow students to explore complex topics in Physics, Chemistry, and Biology through virtual experimentation. Built on Unity with high-fidelity 3D models, the labs simulate a real science lab where students can conduct safe, repeatable experiments without physical risks or expensive lab setups.`,
        `Each VR lab module is curriculum-aligned from international and national education boards, including the Single National Curriculum (Pakistan), NGSS (USA), and UK Key Stage standards.`,
      ],
      bulletsTitle: 'These labs include',
      bullets: [
        'Interactive visuals',
        'Drag-and-drop apparatuses',
        'AI powered personalized learning paths.',
      ],
      sectionTitle: '',
      numbered: [],
      rightImage: 'assets/steam-mind/about-us/imac-screen-mockup (4) 1.svg',
      rightImageAlt: 'VR Labs Mockup',
      rightFrame: true,
      ctas: [
        { label: 'Explore DIY Robotics Kits', key: 'kits', variant: 'solid' },
        { label: 'Explore Steam Words Game', key: 'steam-words', variant: 'outline' },
      ],
    },

    kits: {
      key: 'kits',
      badge: 'Kits',
      paragraphs: [
        `Our DIY Kits are complete hardware + curriculum packages that introduce students to electronics, coding, sensors, and real-world automation. These kits are age-specific and come in variations for beginners to advanced learners.`,
        `Kits include pre-configured components such as Arduino boards, LEDs, motors, sensors, breadboards, and LCD displays. Paired with instructional videos, guided coding challenges, and hands-on project cards, they support self-paced and instructor-led learning.`,
      ],
      bulletsTitle: 'Variants',
      bullets: [
        'Arduino-Based DIY Robotics Kit',
        'LEGO-Compatible Robotics (EV3, WeDo 2.0, Spike Prime)',
        'Advanced IoT Robotics with Wi-Fi/Bluetooth integration',
      ],
      sectionTitle: 'Key Capabilities:',
      numbered: [
        'Build circuits, autonomous bots, and sensor-based projects',
        'Integrate motor drivers, ultrasonic distance measurement, IR detection, temperature sensing',
      ],
      rightImage: 'assets/steam-mind/about-us/download 1.svg',
      rightImageAlt: 'DIY Kits Robot',
      rightFrame: false,
      ctas: [
        { label: 'Explore Steam Words Game', key: 'steam-words', variant: 'solid' },
        { label: 'Explore VR Labs', key: 'vr-labs', variant: 'outline' },
      ],
    },

    'steam-words': {
      key: 'steam-words',
      badge: 'Steam Words Game',
      paragraphs: [
        `STEAM Words is an interactive, gamified crossword puzzle game designed for K-5 to K-12 students to build critical thinking, STEM vocabulary, and cognitive associations in a fun and engaging format.`,
        `Students form words related to STEAM, which unlock levels and mini-challenges. Each puzzle is aligned with educational standards and mapped to STEAM subjects, enabling integrated learning.`,
      ],
      bulletsTitle: 'Key Features:',
      bullets: [
        'Unlimited word formation for STEM vocabulary',
        'Hints and feedback to guide learning',
        'Leaderboards and achievements',
        'Multi-device compatibility',
      ],
      sectionTitle: '',
      numbered: [],
      rightImage: 'assets/steam-mind/about-us/iphone-multiple-screens-mockup w.B 1.svg',
      rightImageAlt: 'Steam Words Mockup',
      rightFrame: false,
      ctas: [
        { label: 'Explore DIY Robotics Kits', key: 'kits', variant: 'solid' },
        { label: 'Explore VR Labs', key: 'vr-labs', variant: 'outline' },
      ],
    },
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // ✅ Works for normal navigate + refresh
    const state = (history.state || {}) as any;

    // Aap cards se yeh state bhej rahe ho: { fromCard: c, index: i }
    const title: string = (state?.fromCard?.title || '').toLowerCase();

    // ✅ title se key guess
    const guessedKey = this.pickKeyFromTitle(title);

    // Agar aap chaho to direct state key bhi bhej sakte: [state]="{ detailKey:'vr-labs' }"
    const forcedKey = state?.detailKey as DetailKey | undefined;

    this.activeKey = forcedKey || guessedKey || 'vr-labs';
    this.detail = this.details[this.activeKey];
  }

goTo(key: DetailKey) {
  // ✅ UI instantly update
  this.activeKey = key;
  this.detail = this.details[key];

  // ✅ route/state also update (same page)
  this.router.navigate(['/steam-mind/aboutus-detail'], {
    state: { detailKey: key },
  });
}


  private pickKeyFromTitle(title: string): DetailKey | null {
    if (!title) return null;

    if (title.includes('vr')) return 'vr-labs';
    if (title.includes('kit') || title.includes('robo')) return 'kits';
    if (title.includes('steam words') || title.includes('words')) return 'steam-words';

    return null;
  }
}
