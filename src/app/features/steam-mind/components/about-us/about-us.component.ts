// about-us.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type FeatureCard = {
  image: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
};
type TeamMember = {
  img: string;
  name: string;
  role: string;
};
type SupportMember = {
  img?: string; // optional (if missing -> gray placeholder)
  name: string;
  roleLine1: string;
  roleLine2?: string;
};


type AwardCard = {
  icon: string;
  title: string;
  year: string;
  desc: string;
  hoverImg: string;
};

type SideInfo = {
  icon: string;
  title: string;
  desc: string;
};
type PartnerCard = {
  logo: string;
  name: string;
    logoBg?: string; // tailwind class

};
@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent {
  hero = {
  bg: 'assets/steam-mind/about-us/1.PNG',

  // ✅ 2 separate images (big + small)
  collageBig: 'assets/steam-mind/about-us/big.svg',
  collageSmall: 'assets/steam-mind/about-us/small.svg',

  badge: 'About us',
  p1: `STEAM Minds is an innovative EdTech company that provides AI-powered personalized,
interactive, simulative and adaptive gamified learning experiences.`,
  p2: `The company offers STEAM solutions for k12 through the use of advanced technology,
including virtual, augmented, and mixed realities based web applications.`,
};


  cards: FeatureCard[] = [
    {
      image: 'assets/steam-mind/about-us/Rectangle.svg',
      icon: 'assets/steam-mind/about-us/mortarboard_5744383 1.svg',
      title: 'AI-Powered 3D Immersive Learning',
      desc: `Our platform features real-time performance tracking, adaptive learning paths,
and AI assistants that deliver intelligent teaching and personalized recommendations
for every student.`,
      cta: 'See More',
    },
    {
      image: 'assets/steam-mind/about-us/imac-screen-mockup (4) 1.svg',
      icon: 'assets/steam-mind/about-us/virtual-reality_15548532 1.svg',
      title: 'Immersive VR-Enabled 3D Learning',
      desc: `Our platform uses SLO-based modeling and simulations to let students explore science
interactively — engaging deeply with concepts, conducting experiments, and understanding
complex ideas with ease.`,
      cta: 'See More',
    },
    {
      image: 'assets/steam-mind/about-us/Rectangle (2).svg',
      icon: 'assets/steam-mind/about-us/copywriting_8978542 1.svg',
      title: 'DIY Robo-Kits & Skill-Based Courses',
      desc: `We offer DIY Robotics Kits and custom skill-based courses that combine simulation
with hands-on experimentation, helping students build problem-solving and analytical
skills.`,
      cta: 'See More',
    },
  ];

  // ✅ NEW: Awards section (dynamic)
  awardsHeader = {
    mini: 'Recognition & Awards',
    title: 'Accolades & Recognition',
    desc:
      'STEAM Minds has earned industry recognition and forged strong partnerships that reflect our commitment to innovation and impact.',
    starIcon: 'assets/steam-mind/about-us/Star.svg',
  };
awards: AwardCard[] = [
  {
    icon: 'assets/steam-mind/about-us/Trophy.svg',
    title: 'Innovator Seed Fund',
    year: '2023',
    desc:
      'Grant of $35k awarded by the Higher Education Commission (HEC) and World Bank to the parent Company (Robotics World), recognizing our excellence in educational technology and product innovation.',
    hoverImg: 'assets/steam-mind/about-us/Rectangle.png', // ✅ change per card
  },
  {
    icon: 'assets/steam-mind/about-us/Medal.svg',
    title: 'National Idea Bank',
    year: 'Regional Winner',
    desc:
      'Honored by the Former President of Pakistan, Dr. Arif Alvi, for our visionary approach in digital education and immersive learning platforms.',
    hoverImg: 'assets/steam-mind/about-us/Rectangle (1).png', // ✅ your 2nd image path
  },
  {
    icon: 'assets/steam-mind/about-us/Trophy.svg',
    title: 'TIE Competition Winner',
    year: '2023',
    desc:
      'Winners of the TIE competition because of its innovative idea and approach in STEAM education.',
    hoverImg: 'assets/steam-mind/about-us/Rectangle (2).png', // ✅ your 3rd image path
  },
];

  // ✅ NEW: Mission/Vision section (dynamic)
  mission: SideInfo = {
    icon: 'assets/steam-mind/about-us/Target.svg',
    title: 'Our Mission',
    desc:
      'Empowering the k12 with AI-powered immersive and adaptive STEAM education through technology-driven interactive and gamified learning experiences.',
  };

  vision: SideInfo = {
    icon: 'assets/steam-mind/about-us/Vision.svg',
    title: 'Our Vision',
    desc:
      'Developing an AI-powered personalized, interactive, adaptive and immersive VR enabled 3D learning platform for students.',
  };
  centerImage = 'assets/steam-mind/about-us/Enhanced Image and edited 1.svg'; 
  partnersHeader = {
    mini: 'Global Network',
    title: 'Strategic Partnerships',
    desc:
      'We collaborate with leading international and national organizations to expand our reach and enhance our educational impact across diverse markets and communities.',
  };

 partners: PartnerCard[] = [
  {
    logo: 'assets/steam-mind/about-us/HERO LOGO 1.svg',
    name: 'Hellenic Educational Robotics Organization (Greece)',
    logoBg: 'bg-[#707070]', 
  },
  {
    logo: 'assets/steam-mind/about-us/StartUp Grind.svg',
    name: 'Startup Grind USA',
    logoBg: 'bg-[#ECECEC]',
  },
  {
    logo: 'assets/steam-mind/about-us/tevta_header_logo 1.svg',
    name: 'TEVTA',
    logoBg: 'bg-[#ECECEC]', // ✅
  },
  {
    logo: 'assets/steam-mind/about-us/Frame-1686559927-1.png 1.svg',
    name: 'PSEB',
    logoBg: 'bg-[#242626]', 
  },
  {
    logo: 'assets/steam-mind/about-us/KPIT LOGO.svg',
    name: 'KPKIT',
    logoBg: 'bg-[#0D4C4A]',
  },
  {
    logo: 'assets/steam-mind/about-us/NAVTTC 1.svg',
    name: 'NAVTTC',
    logoBg: 'bg-[#F1F1F1]', 
  },
];
  trackByIdx(i: number) {
    return i;
  }
  teamHeader = {
    title: 'Core Team',
    desc:
      'A diverse group of passionate educators, technologists, and innovators working together to transform STEAM education through cutting-edge technology.',
  };

  team: TeamMember[] = [
    {
      img: 'assets/steam-mind/about-us/Ellipse 220.svg',
      name: 'Mehtab Anwar Khalid',
      role: 'Chief Executive Officer (CEO)',
    },
    {
      img: 'assets/steam-mind/about-us/Ellipse 216.svg',
      name: 'Dr. Akhtar Hussain',
      role: 'Chief Financial Officer (CFO)',
    },
    {
      img: 'assets/steam-mind/about-us/Ellipse 217.svg',
      name: 'Muhammad Mohsin',
      role: 'Chief Technology Officer (CTO)',
    },
    {
      img: 'assets/steam-mind/about-us/Ellipse 218.svg',
      name: 'Ibrahim Anwar Khalid',
      role: 'Chief Marketing Officer (CMO)',
    },
    {
      img: 'assets/steam-mind/about-us/Ellipse 219.svg',
      name: 'Abdullah Anwar Khalid',
      role: 'Chief Operating Officer (COO)',
    },
    {
      img: 'assets/steam-mind/about-us/Ellipse 221.svg',
      name: 'Rafia Allauddin',
      role: 'Director of Projects',
    },
  ];
 supportingHeader = {
    title: 'Supporting Teams',
  };

  supportingTeam: SupportMember[] = [
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626062.svg',
      name: 'Nauman ahmed',
      roleLine1: 'Director of STEM |',
      roleLine2: 'Research and Development',
    },
    {
      // no img -> placeholder like screenshot
      name: 'Zarmina Nazir',
      roleLine1: 'Head of UI/UX & Graphic',
      roleLine2: 'designing',
    },
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626048.svg',
      name: 'Aneeqa Jadoon',
      roleLine1: 'Digital Marketing Manager',
    },
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626049.svg',
      name: 'Danial Gul',
      roleLine1: 'Project manager TEKNEFY',
      roleLine2: '(Lead 3D designer)',
    },
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626050.svg',
      name: 'Hamza sher',
      roleLine1: 'Manager (Lead, Mobile',
      roleLine2: 'App Development)',
    },
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626051.svg',
      name: 'Raja Muhammad Awais',
      roleLine1: 'DevOps Engineer',
    },

    {
      // placeholder
      name: 'Rimsha Latif',
      roleLine1: 'Graphic designer & UI/UX',
    },
    {
      // placeholder
      name: 'Rafia Allauddin',
      roleLine1: 'Director of Projects',
    },
    {
      // placeholder
      name: 'Zoaia Bibi',
      roleLine1: 'Lead Game Developer',
    },
    {
      img: 'assets/steam-mind/about-us/Rectangle 34626059.svg',
      name: 'Usman Ali',
      roleLine1: 'IT Manager',
    },
    {
      // placeholder
      name: 'Abdar Khan',
      roleLine1: 'Frontend Developer',
    },
  ];

}
