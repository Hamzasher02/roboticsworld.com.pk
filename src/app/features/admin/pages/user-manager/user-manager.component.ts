import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InstructorComponent } from "../../components/manage-user/instructor/instructor.component";
import { ProfileComponent } from "../../components/manage-user/profile/profile.component";
import { StudentComponent } from "../../components/manage-user/student/student.component";
import { StudentProfileComponent } from "../../components/manage-user/student-profile/student-profile.component";
import { RoleComponent } from "../../components/manage-user/role/role.component";

@Component({
  selector: 'app-user-manager',
  imports: [CommonModule, InstructorComponent, StudentComponent, RoleComponent],
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.css'
})
export class UserManagerComponent {
  tabs = ['Instructors', 'Students', 'Access Role'];
  activeTab = 'Instructors'; // default tab name should match the array

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
