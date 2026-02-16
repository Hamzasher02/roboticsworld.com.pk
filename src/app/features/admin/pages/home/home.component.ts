import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { SideBarComponent } from "../../components/side-bar/side-bar.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, SideBarComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
