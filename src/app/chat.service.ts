import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';


@Injectable()


export class ChatService{

  allowFind: boolean;

  private socket = io('https://nvest-chatapp.herokuapp.com');

  constructor() { }

  setupSocketConnection() {
  }
  join(data){
    this.socket.emit('join',data);
  }
  joinedUser()
  {
    let observable = new Observable<{username:string,id:string,rooms:Array<{
      room:string,status:number
      }>}>(observer=>{
      this.socket.on('join', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  joinRoom(data){

    this.socket.emit('joinRoom', data);
  }
  newUserEntered()
  {
    let observable = new Observable<{username:string,date:string,text:string,index:number}>(observer=>{
      this.socket.on('message', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  messagesData()
  {
    let observable = new Observable<{messages:any,index:number}>(observer=>{
      this.socket.on('messagesData', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  roomUsers()
  {
    let observable = new Observable<{room:string,users:Array<{username:string,date:string,text:string}>}>(observer=>{
      this.socket.on('roomUsers', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  roomsUpdate()
  {
    let observable = new Observable<Array<{room:string,status:number}>>(observer=>{
      this.socket.on('rooms', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  sendMessage(data){
    this.socket.emit('chatMessage', data);
  }
  keyPressNotification(data){
    this.socket.emit('typing',data);
  }
  typingNotification()
  {
    let observable = new Observable<{username:string,index:number,message:string}>(observer=>{
      this.socket.on('typing', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;

  }
  timer(){
    let observable = new Observable<{index:number}>(observer=>{
      this.socket.on('removeAccess', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;
  }
  showTimer(){
    let observable = new Observable<{time:any,index:number}>(observer=>{
      this.socket.on('showTimer', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });

    return observable;
  }
  signout(){
    this.socket.emit('signout');
  }
}
