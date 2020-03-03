import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import * as p5 from 'p5';
import { SocketApiService } from '../socket-api.service';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})

export class CanvasComponent implements OnInit, OnDestroy {
  private p5;
  message: string;
  messages: string[] = [];
  users: any[] = [];

  currentArtist: boolean = false;
  currentWord: string;
  nextPlayer: string;
  overlay: boolean = false;
  isReadOnly: boolean = false;
  color: string = 'black';
  turnDuration: number = 60;
  timeLeft: number = this.turnDuration;

  clearIcon = faSync;
  colorIcon = faCircle;
  pencilIcon = faPencilAlt;
  oneUserIcon = faUser;
  twoUsersIcon = faUserFriends;
  threePlusUsersIcon = faUsers;

  @Input() name: string;

  @ViewChild('canvascontainer') canvascontainer;

  constructor(private socketApiService: SocketApiService) { }

  ngOnInit(): void {
    this.socketApiService
      .getMessages()
      .subscribe((message: string) => {
        this.messages.push(message);
      });

    this.socketApiService
      .getUsers()
      .subscribe((users: any) => {
        this.users = users;
        this.users.sort((a, b) => a.score < b.score ? 1 : -1);
      });

    this.socketApiService
      .getCurrentWord()
      .subscribe((word: string) => {
        this.currentWord = word;
        this.takeTurn();
      });

    this.socketApiService
      .getTimeLeft()
      .subscribe(timeLeft => {
        this.timeLeft = timeLeft;
      });

    this.socketApiService
      .getTurnEnd()
      .subscribe(data => {
        this.currentWord = data.currentWord;
        this.nextPlayer = data.nextPlayer;
        this.endTurn();
      });

    this.socketApiService
      .disableInput()
      .subscribe(() => {
        this.isReadOnly = true;
      });

    this.socketApiService
      .getClear()
      .subscribe(() => {
        this.p5.clear();
      });

    this.socketApiService
      .getWaiting()
      .subscribe(waiting => {
        this.overlay = waiting;
      });

    this.socketApiService
      .getColor()
      .subscribe(color => {
        this.color = color;
      });
  }

  ngAfterViewInit() {
    this.createCanvas();
  }

  ngOnDestroy(): void {
    this.destroyCanvas();
  }

  takeTurn(): void {
    this.currentArtist = true;
    setTimeout(() => {
      this.currentArtist = false;
    }, this.turnDuration * 1000);
    this.socketApiService.resetTurn();
  }

  endTurn(): void {
    setTimeout(() => {
      this.overlay = false;
      this.p5.clear();
      this.isReadOnly = false;
    }, 5000);
    this.currentArtist = false;
    this.message = '';
    this.overlay = true;
    this.isReadOnly = true;


    //If input field is focused, make it lose focus
    if (document.activeElement)
      (document.activeElement as HTMLElement).blur();
  }

  sendMessage() {
    if (this.currentArtist || this.isReadOnly) return;
    this.socketApiService.sendMessage(this.message);
    this.message = '';
  }

  clearCanvas() {
    if (this.currentArtist) {
      this.socketApiService.clearCanvas();
    }
  };

  changeColor(color) {
    if (this.currentArtist) {
      this.socketApiService.changeColor(color);
    }
  }

  private createCanvas = () => {
    this.p5 = new p5(this.drawing);
  }

  private destroyCanvas = () => {
    this.p5.noCanvas();
  }

  private drawing = (p: any) => {
    p.setup = () => {
      p.createCanvas(this.canvascontainer.nativeElement.offsetWidth, this.canvascontainer.nativeElement.offsetHeight).parent('canvascontainer');

      this.socketApiService.getMouse(data => {
        p.stroke(this.color);
        p.strokeWeight(4);
        p.line(data.x, data.y, data.px, data.py);
      });
    };

    p.windowResized = () => {
      p.resizeCanvas(this.canvascontainer.nativeElement.offsetWidth, this.canvascontainer.nativeElement.offsetHeight);
    }

    p.mouseDragged = () => {
      if (this.currentArtist) {
        p.stroke(this.color);
        p.strokeWeight(4);
        if (p.mouseIsPressed === true)
          p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        this.socketApiService.sendMouse(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
      }
    }
  }
}


