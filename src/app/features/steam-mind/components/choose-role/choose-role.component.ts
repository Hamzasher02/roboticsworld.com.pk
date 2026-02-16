import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignupDraftService } from '../../../../core/services/steam-mind/signup-draft.service';
import { SignupDraft, UserRole } from '../../../../core/interfaces/steam-mind/signup';
 
@Component({
  selector: 'app-choose-role',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './choose-role.component.html',
  styleUrl: './choose-role.component.css',
})
export class ChooseRoleComponent implements OnInit {
  signupDraft: SignupDraft | null = null;
 
  constructor(
    private signupDraftService: SignupDraftService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.signupDraft = this.signupDraftService.getLatest();
 
    // agar signup data hi nahi (direct url open), wapas signup
    if (!this.signupDraft) {
      this.router.navigate(['/steam-mind/signup']);
    }
  }
 
  selectRole(role: UserRole) {
    this.signupDraftService.setRole(role);
 
    if (role === 'instructor') {
      this.router.navigate(['/steam-mind/teacher-profile']); // aapka route
    } else {
      this.router.navigate(['/steam-mind/student-profile']); // aapka route
    }
  }
}