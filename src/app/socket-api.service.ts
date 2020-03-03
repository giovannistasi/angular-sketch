import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

export class SocketApiService {
  private url = 'https://serene-anchorage-72495.herokuapp.com/80';
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  public sendMouse(mouseX, mouseY, pmouseX, pmouseY) {

    var data = {
      x: mouseX,
      y: mouseY,
      px: pmouseX,
      py: pmouseY
    };

    this.socket.emit('mouse', data);
  }

  public getMouse(callback) {
    return this.socket.on('mouse', callback);
  }

  public clearCanvas() {
    this.socket.emit('clear');
  }

  public getClear() {
    return Observable.create(observer => {
      this.socket.on('clear', () => {
        observer.next();
      });
    });
  }

  public sendMessage(message) {
    this.socket.emit('guess', message);
  }

  public getMessages() {
    return Observable.create(observer => {
      this.socket.on('new-message', message => {
        observer.next(message);
      });
    });
  }

  public sendUser(name) {
    this.socket.emit('name', name);
  }

  public getUsers() {
    return Observable.create(observer => {
      this.socket.on('users', users => {
        observer.next(users);
      });
    });
  }

  public resetTurn() {
    this.socket.emit('reset-turn');
  }

  public getTimeLeft() {
    return Observable.create(observer => {
      this.socket.on('time-left', timeLeft => {
        observer.next(timeLeft);
      });
    });
  }

  public getCurrentWord() {
    return Observable.create(observer => {
      this.socket.on('current-word', word => {
        observer.next(word);
      });
    });
  }

  public getTurnEnd() {
    return Observable.create(observer => {
      this.socket.on('turn-end', data => {
        observer.next(data);
      });
    });
  }

  public changeColor(color) {
    this.socket.emit('change-color', color);
  }

  public getColor() {
    return Observable.create(observer => {
      this.socket.on('change-color', color => {
        observer.next(color);
      });
    });
  }

  public disableInput() {
    return Observable.create(observer => {
      this.socket.on('disable-input', () => {
        observer.next();
      });
    });
  }

  public getWaiting() {
    return Observable.create(observer => {
      this.socket.on('waiting', waiting => {
        observer.next(waiting);
      });
    });
  }
}