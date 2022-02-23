import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GamePlayer, Round } from './model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }
  
  newUser(username:any) {
    return this.http.post(environment.url + "/newuser",username);
  }

  removeUser(body:any) {
    return this.http.post(environment.url + "/removeuser",body);
  }

  getPlayerList(id:any) {
    return this.http.get<GamePlayer[]>(environment.url + `/getPlayerList/${id}`);
  }

  getRoundDetail(id: any) {
    return this.http.get<Round[]>(environment.url + `/getRoundDetail/${id}`);
  }
}
