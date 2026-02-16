import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { StudentHeaderComponent } from '../../components/student-header/student-header.component';
import { filter } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-routing',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, StudentHeaderComponent, ToastModule, ConfirmDialogModule],
  providers: [MessageService],
  templateUrl: './routing.component.html',
  styleUrl: './routing.component.css',
})
export class RoutingComponent {

  // ✅ MUST BE DECLARED
  showStudentHeader: boolean = true;
  isFullscreen: boolean = false;
  noContainer: boolean = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let current = this.router.routerState.root;

        while (current.firstChild) {
          current = current.firstChild;
        }

        const routeData = current.snapshot.data || {};

        this.showStudentHeader = !routeData['hideStudentHeader'];
        this.isFullscreen = !!routeData['fullscreen'];
        this.noContainer = !!routeData['noContainer'];
      });
  }
}
