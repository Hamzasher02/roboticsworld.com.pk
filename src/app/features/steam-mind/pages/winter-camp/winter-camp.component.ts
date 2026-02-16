import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type CampCard = {
  img: string;
  titleTop: string;
  titleBottom: string;
  meta1: string; // e.g. Ages 7-10 years
  meta2: string; // e.g. 6 x 45-minute Sessions
  desc: string;
  outcomesLabel: string;
  outcomes: string[];
  cta: string;
};
type Testimonial = {
  stars: number;
  text: string;
  name: string;
  roleLine1: string;
  roleLine2: string;
  avatar: string;
};

type AdvantageCard = {
  title: string;
  desc: string;
};
@Component({
  selector: 'app-winter-camp',
  imports: [CommonModule, RouterModule],
  templateUrl: './winter-camp.component.html',
  styleUrl: './winter-camp.component.css'
})
export class WinterCampComponent {

camps: CampCard[] = [
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    // second row (same design)
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
    {
      img: 'assets/steam-mind/camp/Rectangle 34625993.svg',
      titleTop: 'Scratch Explorer:',
      titleBottom: 'Foundations of Coding',
      meta1: 'Ages 7-10 years',
      meta2: '6 x 45-minute Sessions',
      desc: 'Designed to enhance problem-solving with animation and game creation.',
      outcomesLabel: 'Learning outcomes',
      outcomes: ['Learn basic coding', 'Make games and animations', 'Get creative with digital tools'],
      cta: 'Claim your Spot',
    },
  ];
  // ✅ testimonials (dynamic)
  testimonials: Testimonial[] = [
    {
      stars: 5,
      text:
        "I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I'm more confident in my skills than ever!",
      name: 'Emily J.',
      roleLine1: 'Frontend Developer',
      roleLine2: 'at Spotify',
      avatar: 'assets/steam-mind/camp/Avatar.svg',
    },
    {
      stars: 5,
      text:
        "I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I'm more confident in my skills than ever!",
      name: 'Emily J.',
      roleLine1: 'Frontend Developer',
      roleLine2: 'at Spotify',
      avatar: 'assets/steam-mind/camp/Avatar.svg',
    },
    {
      stars: 5,
      text:
        "I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I'm more confident in my skills than ever!",
      name: 'Emily J.',
      roleLine1: 'Frontend Developer',
      roleLine2: 'at Spotify',
      avatar: 'assets/steam-mind/camp/Avatar.svg',
    },
    {
      stars: 5,
      text:
        "I never imagined I'd be able to design my own website from scratch so quickly! The lessons were clear and the projects were fun and challenging. I'm more confident in my skills than ever!",
      name: 'Emily J.',
      roleLine1: 'Frontend Developer',
      roleLine2: 'at Spotify',
      avatar: 'assets/steam-mind/camp/Avatar.svg',
    },
  ];
  
  advantages: AdvantageCard[] = [
    {
      title: 'Hands-on Learning',
      desc: 'Practical projects in Scratch, Python, Roblox & more.',
    },
    {
      title: 'Expert Guidance',
      desc: 'Learn directly from certified instructors.',
    },
    {
      title: 'Future-Ready Skills',
      desc: 'Build coding, problem-solving & logical thinking.',
    },
    {
      title: 'Creative Confidence',
      desc: 'Boost imagination through fun & interactive challenges.',
    },
    {
      title: 'Achievement Certificate',
      desc: 'Get recognized for your skills with an official certificate.',
    },
  ];

  // helper for stars in template
  starArray(n: number) {
    return Array.from({ length: n });
  }
}