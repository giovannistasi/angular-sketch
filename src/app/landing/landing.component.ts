import { Component, OnInit } from '@angular/core';
import { SocketApiService } from '../socket-api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  loggedIn: boolean = false;
  name: string;

  constructor(private socketApiService: SocketApiService) { }

  ngOnInit(): void {
  }

  logIn(): void {
    if(!this.name) return;
    this.socketApiService.sendUser(this.name);
    this.loggedIn = true;
  }
}
