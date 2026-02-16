import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

type Bullet = { text: string };

type HeroSection = {
  kind: 'hero';
  bgImg: string;
  title: string;
  desc: string;
  ctaText: string;
};

type ContentSection = {
  kind: 'content';
  id: string; // unique
  bg: 'white' | 'gray';
  titleTag: string; // purple tag text
  layout: 'textLeft' | 'textRight'; // match your design
  paragraphs: string[];
  heading1?: string; // Variants / Key Features etc.
  bullets?: Bullet[];
  heading2?: string; // Key Capabilities etc.
  numbered?: string[];
  image?: {
    src: string;
    alt: string;
    wrapperClass: string; // EXACT pixel-perfect wrapper class
    imgClass: string;     // EXACT pixel-perfect img class
    framed?: boolean;     // VR frame
  };
  // optional second list for VR (bullets after a paragraph)
  bullets2?: Bullet[];
  endingParagraph?: string; // VR last paragraph
};

type PageData = {
  hero: HeroSection;
  sections: ContentSection[];
};

@Component({
  selector: 'app-product-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-services.component.html',
  styleUrl: './product-services.component.css',
  animations: [
    trigger('slideInLeft', [
      state('out', style({ opacity: 0, transform: 'translateX(-80px)' })),
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('out => in', animate('650ms cubic-bezier(0.22,1,0.36,1)')),
    ]),
    trigger('slideInRight', [
      state('out', style({ opacity: 0, transform: 'translateX(80px)' })),
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('out => in', animate('650ms cubic-bezier(0.22,1,0.36,1)')),
    ]),
  ],
})
export class ProductServicesComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('observeSection') observeSections!: QueryList<ElementRef<HTMLElement>>;

  // ✅ API ready (tomorrow just assign API response to this.data)
  data: PageData = {
    hero: {
      kind: 'hero',
      bgImg: '/assets/steam-mind/product/hero.jpg',
      title: 'Innovative Products to Power STEAM Learning',
      desc: 'Hands-on kits, interactive games, and immersive VR labs designed to spark creativity & innovation',
      ctaText: 'Explore Our Products',
    },
    sections: [
      {
        kind: 'content',
        id: 'kits',
        bg: 'white',
        layout: 'textLeft',
        titleTag: 'Kits',
        paragraphs: [
          'Our DIY Kits are complete hardware + curriculum packages that introduce students to electronics, coding, sensors, and real-world automation. These kits are age-specific and come in variations for beginners to advanced learners.',
          'Kits include pre-configured components such as Arduino boards, LEDs, motors, sensors, breadboards, and LCD displays. Paired with instructional videos, guided coding challenges, and hands-on project cards, they support self-paced and instructor-led learning.',
        ],
        heading1: 'Variants',
        bullets: [
          { text: 'Arduino-Based DIY Robotics Kit' },
          { text: 'LEGO-Compatible Robotics (EV3, WeDo 2.0, Spike Prime)' },
          { text: 'Advanced IoT Robotics with Wi-Fi/Bluetooth integration' },
        ],
        heading2: 'Key Capabilities:',
        numbered: [
          'Build circuits, autonomous bots, and sensor-based projects',
          'Integrate motor drivers, ultrasonic distance measurement, IR detection, temperature sensing',
        ],
        image: {
          src: 'assets/steam-mind/product/kit.svg',
          alt: 'DIY robotics kit illustration',
          wrapperClass:
            'flex w-full items-center justify-center lg:w-[520px] lg:justify-end',
          imgClass:
            'w-full max-w-[440px] object-contain sm:max-w-[520px] lg:max-w-[520px]',
        },
      },

      {
        kind: 'content',
        id: 'steam-words',
        bg: 'gray',
        layout: 'textRight',
        titleTag: 'STEAM Words Game',
        paragraphs: [
          'STEAM Words is an interactive, gamified crossword puzzle game designed for K-5 to K-12 students to build critical thinking, STEM vocabulary, and cognitive associations in a fun and engaging format. Students form words related to STEAM, which unlock levels and mini-challenges. Each puzzle is aligned with educational standards and mapped to STEAM subjects, enabling integrated learning.',
        ],
        heading2: 'Key Features:',
        numbered: [
          'Unlimited word formation for STEM vocabulary',
          'Hints and feedback to guide learning',
          'Leaderboards and achievements',
          'Multi-device compatibility',
        ],
        image: {
          src: '/assets/steam-mind/product/phone.svg',
          alt: 'STEAM Words Game preview on mobile devices',
          wrapperClass:
            'flex w-full items-center justify-center lg:w-[560px] lg:justify-start',
          imgClass:
            'w-full max-w-[420px] object-contain sm:max-w-[560px] lg:max-w-[520px]',
        },
      },

      {
        kind: 'content',
        id: 'vr-labs',
        bg: 'white',
        layout: 'textLeft',
        titleTag: 'VR Labs',
        paragraphs: [
          'The VR Labs are immersive, simulation-based science environments that allow students to explore complex topics in Physics, Chemistry, and Biology through virtual experimentation. Built on Unity with high-fidelity 3D models, the labs simulate a real science lab where students can conduct safe, repeatable experiments without physical risks or expensive lab setups. Each VR lab module is curriculum-aligned from international and national education boards, including the Single National Curriculum (Pakistan), NGSS (USA), and UK Key Stage standards.',
          'These labs include',
        ],
        bullets: [
          { text: 'Interactive visuals' },
          { text: 'Drag-and-drop apparatuses' },
          { text: 'AI powered personalized learning paths.' },
        ],
        endingParagraph:
          'Compatible with VR headsets and browsers the labs provide low-cost real-time concept reinforcement with 3D interaction',
        image: {
          src: '/assets/steam-mind/product/mockup.svg',
          alt: 'VR Labs preview',
          wrapperClass:
            'flex w-full items-center justify-center lg:w-[560px] lg:justify-end',
          imgClass: 'relative w-full object-contain',
          framed: true,
        },
      },
    ],
  };

  // ✅ animate-per-section (fast + once)
  animated = new Set<string>();
  private observer?: IntersectionObserver;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupObserver();
    this.observeSections.changes.subscribe(() => this.setupObserver(true));
  }

  private setupObserver(reset = false) {
    if (reset) this.observer?.disconnect();

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;

            const id = e.target.getAttribute('data-id');
            if (!id || this.animated.has(id)) continue;

            this.zone.run(() => this.animated.add(id));
            this.observer?.unobserve(e.target);
          }
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -12% 0px',
        }
      );

      this.observeSections.forEach((ref) =>
        this.observer!.observe(ref.nativeElement)
      );
    });
  }

  isAnimated(id: string) {
    return this.animated.has(id);
  }

  trackById = (_: number, s: ContentSection) => s.id;

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
