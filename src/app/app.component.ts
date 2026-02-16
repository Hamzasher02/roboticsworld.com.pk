import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { initFlowbite } from 'flowbite';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ToastModule]
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    initFlowbite();
  }
  title = 'Robotics World';

}



