import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsiteHeaderComponent } from "../../components/website-header/website-header.component";
import { WebsiteFooterComponent } from "../../components/website-footer/website-footer.component";

@Component({
  selector: 'app-website-routing',
  imports: [RouterOutlet, WebsiteHeaderComponent, WebsiteFooterComponent,],
  templateUrl: './website-routing.component.html',
  styleUrl: './website-routing.component.css'
})
export class WebsiteRoutingComponent {

}
