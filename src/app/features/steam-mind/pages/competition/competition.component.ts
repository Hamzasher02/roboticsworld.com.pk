import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

type CompetitionCard = {
  titleTop: string;      // "HPE Codewars"
  titleBottom: string;   // "Practice Arena"
  hostedBy: string;      // "STEAM Minds"
  endsIn?: string;       // practice only
  endedAt?: string;      // completed only
  teamSize: string;      // "1 Member"
  grade: string;         // "1-12"
  prizeText?: string;    // completed only
  endedNote?: string;    // completed only: "Competition has ended"
  logoSrc: string;       // left logo image
  actionText: string;    // button text
  actionType: 'start' | 'view'; // start=green, view=border orange
};

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competition.component.html',
  styleUrl: './competition.component.css',
})
export class CompetitionComponent {
  activeTab: 'practice' | 'completed' = 'practice';
  constructor(private router: Router) {}
  practiceCards: CompetitionCard[] = [
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endsIn: '241 days, 6hrs, 5 min',
      teamSize: '1 Member',
      grade: '1-12',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'Register & Start',
      actionType: 'start',
    },
  ];

  completedCards: CompetitionCard[] = [
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
    {
      titleTop: 'HPE Codewars',
      titleBottom: 'Practice Arena',
      hostedBy: 'STEAM Minds',
      endedAt: '03:30 PM, PST 13 April, 2025',
      teamSize: '1 Member',
      grade: '1-12',
      endedNote: 'Competition has ended',
      prizeText: 'Prize Worth PKR 100,000',
      logoSrc: '/assets/steam-mind/competition/steamlogo.svg',
      actionText: 'View Competetion',
      actionType: 'view',
    },
  ];

  setTab(tab: 'practice' | 'completed') {
    this.activeTab = tab;
  }

  onCardAction(item: CompetitionCard) {
    // yahan routing / api / modal jo chaho add kar sakte ho
    console.log('Action:', item.actionText, item.titleTop, item.titleBottom);
  }
  // ✅ Register & Start
  goToCompetitionForm(item: any) {
    console.log('Register:', item.titleTop, item.titleBottom);
    this.router.navigate(['/steam-mind/competition/competition-form']);
  }

  // ✅ View Competition
  goToCompetitionDetails(item: any) {
    console.log('View:', item.titleTop, item.titleBottom);
    this.router.navigate(['/steam-mind/competition/competition-details']);
  }
  trackByIdx = (i: number) => i;
}
