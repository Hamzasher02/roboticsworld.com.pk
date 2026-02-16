import { Injectable } from '@angular/core';
import { SignupDraft, SignupForm, UserRole } from '../../../interfaces/steam-mind/signup/signup';

@Injectable({ providedIn: 'root' })
export class SignupDraftService {
  private drafts: SignupDraft[] = [];
  private selectedRole: UserRole | null = null;

  add(form: SignupForm): SignupDraft {
    const draft: SignupDraft = {
      ...form,
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: Date.now(),
    };
    this.drafts.push(draft);
    return draft;
  }

  getLatest(): SignupDraft | null {
    return this.drafts.length ? { ...this.drafts[this.drafts.length - 1] } : null;
  }

  setRole(role: UserRole): void {
    this.selectedRole = role;
  }

  getRole(): UserRole | null {
    return this.selectedRole;
  }

  getState() {
    return { draft: this.getLatest(), role: this.getRole() };
  }

  clear(): void {
    this.drafts = [];
    this.selectedRole = null;
  }
}
