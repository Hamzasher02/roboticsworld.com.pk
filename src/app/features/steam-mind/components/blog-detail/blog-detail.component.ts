import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

type MetaLink = { label: string; url: string };

type BlogCard = {
  id: number;
  title: string;
  meta: string;
  metaLink?: MetaLink;
  body: string[];
  example?: string;
  image?: string;
  imageAlt?: string;
  learningOutcome?: string;
  proTip?: string;
};

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
})
export class BlogDetailComponent {
  constructor(private router: Router) {}

  article = {
    title: 'Top 10 Easy STEM Coding Projects for Elementary School Students',
    author: 'Parul Jain',
    date: 'October 16, 2025',
    coverImg: 'assets/steam-mind/blog/bannerimage.svg',

    intro: [
      'STEM (Science, Technology, Engineering, and Mathematics) is all about hands-on learning, problem-solving, and creativity. And when you add coding to it, STEM learning becomes even more fun and engaging for kids! 👩‍💻✨',
      'Coding projects help young learners understand logic, boost creativity, and develop a love for building things. The best part? They don’t need to be complicated! Even elementary school students (Grades 1–5) can build amazing STEM coding projects using beginner-friendly tools like Scratch, Code.org, or Minecraft Education Edition.',
      'In this blog, we’ll explore the Top 10 Easy STEM Coding Projects that kids can try at school, home, or during an online coding class. 🚀',
    ],

    cards: <BlogCard[]>[
      {
        id: 1,
        title: '1. Create an Animated Story in Scratch',
        meta: 'Platform: Scratch · STEAM Skills: Logic, sequencing, storytelling',
        metaLink: { label: 'scratch.mit.edu', url: 'https://scratch.mit.edu/' },
        body: [
          'Kids love stories, and Scratch lets them bring those stories to life with code!',
          'Using colorful coding blocks, children can create characters (sprites), add backgrounds, and animate them to tell a story.',
        ],
        example:
          'Make a cat and a dog talk to each other. Add sounds, dialogue, and movement.',
        image: 'assets/steam-mind/blog/animation.svg',
        imageAlt: 'Kids learning Scratch story',
        learningOutcome:
          'Students learn sequencing, loops, and events while improving creativity and storytelling skills.',
        proTip:
          'Ask them to create a moral-based story like “Save the Environment” or “Be Kind to Animals”.',
      },
      {
        id: 2,
        title: '2. Build a Simple Maze Game',
        meta:
          'Platform: Scratch or Code.org Game Lab · STEAM Skills: Logic, problem-solving, spatial thinking',
        body: [
          'Kids can design a maze where the player moves a character with arrow keys to reach the goal.',
          'They’ll use conditional statements (like “if touching wall, go back”) and loops for continuous movement.',
        ],
        example:
          'A character collects stars while avoiding obstacles in a colorful maze.',
        image: 'assets/steam-mind/blog/game.svg',
        imageAlt: 'Simple maze game illustration',
        learningOutcome:
          'Helps kids understand conditions, coordinates, and event handling — essential concepts in programming and math.',
      },

      {
        id: 3,
        title: '3. Learn with Python Turtle: Draw Fun Shapes',
        meta: 'Platform: Python (Turtle module) · STEAM Skills: Geometry, coding logic',
        body: [
          'Python Turtle is perfect for older elementary students who are ready to explore text-based coding.',
          'They can use simple commands like forward(), right(), and penup() to draw shapes and patterns.',
        ],
        example: 'Draw a triangle, square, or even a colorful spiral!',
        learningOutcome:
          'Introduces geometry and programming syntax while keeping learning visual and engaging.',
        proTip: 'Combine art and math — make a “coding mandala” or a flower pattern!',
      },

      {
        id: 4,
        title: '4. Code a Musical Instrument',
        meta: 'Platform: Scratch or MakeCode · STEAM Skills: Sound engineering, logic, creativity',
        body: [
          'Turn coding into music! Kids can create a digital piano or a drum pad that plays sounds when keys are pressed.',
        ],
        image: 'assets/steam-mind/blog/animation.svg',
        imageAlt: 'Kids coding a digital instrument',
        example: 'Press “A” for drum, “B” for guitar, “C” for piano — and watch your computer turn into a band! 🎹🎸🥁',
        learningOutcome: 'Teaches input-output logic, sound programming, and pattern recognition.',
        proTip: 'Let kids remix it into a mini music video with animated sprites.',
      },

      {
        id: 5,
        title: '5. Design a Solar System Animation',
        meta: 'Platform: Scratch or Tynker · STEAM Skills: Astronomy, loops, motion control',
        body: [
          'Kids can build an animated solar system where planets orbit around the sun using loops and motion commands.',
        ],
        example: 'Add details like planet names, sound effects, and facts when clicked.',
        image: 'assets/steam-mind/blog/solar.svg',
        imageAlt: 'Animated solar system project',
        learningOutcome:
          'Combines science and coding, helping students visualize astronomical concepts interactively.',
      },

      {
        id: 6,
        title: '6. Make a Rainbow Color Generator',
        meta: 'Platform: Code.org or Scratch · STEAM Skills: Math (RGB values), creativity, design',
        body: [
          'This simple project helps kids understand how colors are made using Red, Green, and Blue values.',
          'They can create sliders or buttons that mix colors and display the output on the screen.',
        ],
        example: 'Change RGB values to generate new colors — and display the code for it!',
        image: 'assets/steam-mind/blog/color.svg',
        imageAlt: 'Rainbow color generator project',
        learningOutcome:
          'Encourages experimentation and logical reasoning, introducing basic data representation.',
      },

      {
        id: 7,
        title: '7. AI Emotion Detector (Beginner Version)',
        meta: 'Platform: Teachable Machine + Scratch Integration · STEAM Skills: Artificial Intelligence, data science basics',
        body: [
          'Using Google’s Teachable Machine, kids can train an AI to recognize happy or sad faces using their webcam — then connect it to a Scratch project.',
        ],
        example: 'When you smile, the sprite dances. When you frown, it plays a sad song. 😊😢',
        image: 'assets/steam-mind/blog/emotion.svg',
        imageAlt: 'AI emotion detector beginner project',
        learningOutcome: 'Introduces kids to machine learning and real-world AI in a fun, visual way.',
        proTip: 'Add characters that “react” to different emotions — like a virtual friend!',
      },

      {
        id: 8,
        title: '8. Math Quiz Game',
        meta: 'Platform: Scratch or Code.org App Lab · STEAM Skills: Math, logic, user input',
        body: [
          'Turn math practice into a game! Kids can build a quiz that asks random math questions and checks the answer using simple logic.',
        ],
        example: '“2 + 3 = ?” If the player answers correctly, the score goes up — if not, a funny sound plays.',
        learningOutcome: 'Strengthens logical thinking, arithmetic skills, and input/output handling.',
        proTip: 'Let them create a leaderboard and award stars for correct answers.',
      },

      {
        id: 9,
        title: '9. Create a Recycling Game',
        meta: 'Platform: Scratch or MIT App Inventor · STEAM Skills: Environmental science, design, game logic',
        body: [
          'In this project, players drag recyclable items into the correct bins — plastic, paper, glass, etc.',
        ],
        example: 'Drop plastic bottles into the blue bin, paper into the green one. Play a sound or show points for correct sorting.',
        learningOutcome: 'Teaches environmental awareness while reinforcing conditional logic in coding.',
      },

      {
        id: 10,
        title: '10. Space Explorer Adventure',
        meta: 'Platform: Code.org Game Lab or Scratch · STEAM Skills: Physics, storytelling, motion logic',
        body: [
          'Kids design a space-themed game where the spaceship avoids asteroids or collects stars.',
        ],
        example: 'Use arrow keys to move the ship, and score points for every star collected.',
        learningOutcome:
          'Teaches velocity, collision detection, and interactive storytelling — blending science and creativity.',
        proTip: 'Add an AI-powered alien friend using Teachable Machine for extra fun!',
      },
    ],

    whyStem: {
      title: 'Why STEM Coding Projects Are Important for Kids',
      intro: 'STEM projects aren’t just about coding — they teach how to think, not just what to think.',
      subIntro: 'Through these activities, children learn to:',
      bullets: [
        { icon: '🧠', text: 'Solve problems logically' },
        { icon: '🎨', text: 'Express creativity through code' },
        { icon: '🤝', text: 'Collaborate and share ideas' },
        { icon: '🌍', text: 'Understand real-world applications of science and math' },
      ],
      footer:
        'STEM coding builds future-ready skills by preparing students for careers in AI, engineering, and digital innovation, while keeping learning exciting and playful.',
    },

    codingal: {
      title: 'How Codingal Makes STEM Fun and Interactive',
      body:
        'At Codingal, we believe every child can be a creator, not just a user of technology. Our STEM and Coding Courses are designed to make learning engaging through real-world projects.',
      subBody: 'Students learn by doing, creating projects like:',
      projects: [
        { icon: '🎮', text: 'AI-based games' },
        { icon: '🤖', text: 'Chatbots' },
        { icon: '🧮', text: 'Math quiz apps' },
        { icon: '✨', text: 'Story animations' },
        { icon: '⚙️', text: 'Robotics simulations' },
      ],
      footer:
        'With live 1:1 and group classes, expert instructors, and gamified learning, kids build confidence while mastering key STEM skills.',
    },

    finalThoughts: {
      title: 'Final Thoughts',
      paras: [
        'STEM coding projects give elementary students a fun way to explore science, technology, and creativity — all at once.',
        'Each project helps them connect what they learn in class to real-world applications.',
        'Whether it’s designing a game, creating digital art, or building an AI project, coding turns curiosity into innovation. 🌟',
        'So let your child start small, one project at a time, and watch their imagination grow into something amazing! 🚀',
      ],
    },

    ready: {
      title: 'Ready to Begin?',
      ctaText: 'Join a free coding class at STEAM Minds',
      ctaUrl: '/steam-mind/book-free-class',
      tailText: 'and help your child start building fun, interactive projects today!',
    },

    share: {
      title: 'Share with your friends',
      logo: 'assets/steam-mind/header/SteamMindLogo.svg',
      heading: 'Personalized Coding for Kids',
      subHeading:
        'Empower your child with hands-on STEAM education and coding excellence. Start their journey today!',
      buttonText: 'Book Free Class Now',
    },
  };

  trackByIdx = (i: number) => i;
  trackByCardId = (_: number, item: BlogCard) => item.id;

  goBack() {
    this.router.navigateByUrl('/steam-mind/blog');
  }

  openCta(url: string) {
    // internal route
    this.router.navigateByUrl(url);
  }

  bookFreeClass() {
    // this.router.navigateByUrl('/steam-mind/book-free-class');
  }
}
