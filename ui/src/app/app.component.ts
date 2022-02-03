import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { HttpService } from './http.service';
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
  constructor(private socketService: SocketService, private route: Router, private http: HttpService) {
    this.socketService.$forceOut().pipe(take(1)).subscribe(x => { 
      console.info('force out');
      if (this.socketService.user) {
        localStorage.removeItem('user');
        this.route.navigate(['login']);
      }
    })
  }


  
}
