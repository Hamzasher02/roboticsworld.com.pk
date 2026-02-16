import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AiAssistantComponent } from "../ai-assistant/ai-assistant.component";
import { CarouselModule } from 'primeng/carousel';


type HeroSlide = { img: string; word: string };
type WordItem = { id: number; word: string };

@Component({
  selector: 'app-steam-mind-home',
  standalone: true,
  imports: [RouterModule, CommonModule, AiAssistantComponent, CarouselModule, RouterLink],
  templateUrl: './steam-mind-home.component.html',
  styleUrl: './steam-mind-home.component.css',
  animations: [
    trigger('wordScroll', [
      transition(':enter', [
        style({ transform: 'translateY({{enterFrom}})', opacity: 0 }),
        animate(
          '{{scroll}}ms cubic-bezier(0.25,0.8,0.25,1)',
          style({ transform: 'translateY(0px)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '{{scroll}}ms cubic-bezier(0.25,0.8,0.25,1)',
          style({ transform: 'translateY({{leaveTo}})', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class SteamMindHomeComponent implements OnInit, OnDestroy {
  slides: HeroSlide[] = [
    { img: 'assets/steam-mind/steam-mind-home/banner-1.jpg', word: 'Shaping' },
    { img: 'assets/steam-mind/steam-mind-home/banner-2.jpg', word: 'Improvement' },
    { img: 'assets/steam-mind/steam-mind-home/banner.PNG', word: 'Inspiring' },
  ];

  activeIndex = 0;
  activeCategory: string = 'Science';
  scrolled = false;
  isAiOpen = false;

  activeEventId: number | null = null;

  toggleEventOverlay(id: number) {
    this.activeEventId = this.activeEventId === id ? null : id;
  }



  readonly HOLD_MS = 2600;
  readonly SCROLL_MS = 2000;

  private get SLIDE_MS(): number {
    return this.HOLD_MS + this.SCROLL_MS;
  }

  wordItems: WordItem[] = [{ id: 0, word: this.slides[0].word }];
  private wordId = 0;

  // ✅ params used in template
  animParams = {
    scroll: this.SCROLL_MS,
    enterFrom: '-60px', // default forward
    leaveTo: '60px',
  };

  private timer: any;

  ngOnInit(): void {
    this.setWord(this.slides[this.activeIndex].word);
    this.start();
    setTimeout(() => this.onScroll(), 0);

  }

  ngOnDestroy(): void {
    this.stop();
  }

  private start(): void {
    this.stop();
    this.timer = setInterval(() => this.nextSlide(), this.SLIDE_MS);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  nextSlide(): void {
    const next = (this.activeIndex + 1) % this.slides.length;
    this.goTo(next, 'forward');
  }

  prevSlide(): void {
    const prev = (this.activeIndex - 1 + this.slides.length) % this.slides.length;
    this.goTo(prev, 'backward');
  }

  goTo(index: number, forceDir?: 'forward' | 'backward'): void {
    if (index === this.activeIndex) return;

    const dir = forceDir ?? this.getDirection(this.activeIndex, index);

    this.animParams =
      dir === 'forward'
        ? { scroll: this.SCROLL_MS, enterFrom: '-60px', leaveTo: '60px' }
        : { scroll: this.SCROLL_MS, enterFrom: '60px', leaveTo: '-60px' };

    this.activeIndex = index;
    this.setWord(this.slides[index].word);

    this.start();
  }

  private getDirection(from: number, to: number): 'forward' | 'backward' {
    const last = this.slides.length - 1;

    if (from === last && to === 0) return 'forward';

    return to > from ? 'forward' : 'backward';
  }

  private setWord(word: string): void {
    this.wordItems = [{ id: ++this.wordId, word }];
  }

  trackByIdx = (i: number) => i;
  trackByWordId = (_: number, item: WordItem) => item.id;

  // default active tab

  categories: string[] = [
    'Science',
    'Technology',
    'Engineering',
    'Arts',
    'Mathematics',
  ];

  setCategory(category: string): void {
    this.activeCategory = category;
  }


  @ViewChild('aiBtn', { static: true }) aiBtn!: ElementRef<HTMLButtonElement>;

  private initialTop = 0;
  private isFixed = false;

  ngAfterViewInit() {
    const rect = this.aiBtn.nativeElement.getBoundingClientRect();
    this.initialTop = rect.top + window.scrollY;
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollY = window.scrollY;

    // when user reaches the button naturally
    if (scrollY >= this.initialTop - 80 && !this.isFixed) {
      this.isFixed = true;
      this.setFixed();
    }

    // when user scrolls back above
    if (scrollY < this.initialTop - 120 && this.isFixed) {
      this.isFixed = false;
      this.setAbsolute();
    }
  }

  private setFixed() {
    const el = this.aiBtn.nativeElement;
    el.classList.remove('absolute', 'bottom-6');
    el.classList.add('fixed', 'top-6');
  }

  private setAbsolute() {
    const el = this.aiBtn.nativeElement;
    el.classList.remove('fixed', 'top-6');
    el.classList.add('absolute', 'bottom-6');
  }



  openAi() {
    this.isAiOpen = true;
  }

  closeAi() {
    this.isAiOpen = false;
  }

  cards = [
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
    {
      name: 'Emily J.',
      role: 'Frontend Developer',
      company: 'Spotify',
      text: `I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I’m more confident in my skills than ever!`,
      avatar: 'assets/steam-mind/steam-mind-home/userAvatar.svg',
    },
  ];
  testimonialResponsive = [
    { breakpoint: '1200px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];


}
