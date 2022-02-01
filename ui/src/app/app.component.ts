import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui';
  socketId: string = "default";
  gameVersion: string = 'v1.0.0';
  constructor(private socketService: SocketService,private route:Router ) {
    socketService.checkMyExist$();
    this.socketService.$404.subscribe(x => { 
      console.log('$404');
      localStorage.removeItem('user');
      this.route.navigate(['login']);
    });
    this.socketService.$200.subscribe(x => console.log(x));
    this.socketService.$createUserName.subscribe(x => {
      localStorage.removeItem('user');
      localStorage.setItem('user', JSON.stringify(x));
    });
  }


  
}
