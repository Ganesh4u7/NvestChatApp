import { Component, OnInit } from '@angular/core';
import {ChatService} from '../chat.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  loginForm:FormGroup;
  route =0;
  username;
  userData = {username:'',id:'',rooms:[]};
  room:String = 'Javascript';
  chatRooms;
  users= [];
  message='';
  checkEmail =true;
  roomNumber=0;
  show =0;
  notifications = [0,0,0];
  messageArray = [];
  messageArrays =[[],[],[]];
  style =[1,0,0];
  times=[null,null,null];
  timer=[null,null,null];
  typing =[{status:0,message:null},{status:0,message:null},{status:0,message:null}];


  signupForm: FormGroup;

  constructor(private chatService: ChatService) {
    this.chatService.newUserEntered().subscribe(data=> {
      console.log(data)
      this.messageArrays[data.index].push(data);
      if (data.index != this.roomNumber) {
             if(data.text != 'Welcome to chat room') {
               this.notifications[data.index] = 1;
             }
      }
      document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    });
    this.chatService.roomUsers().subscribe(data=>{
    this.room =data.room;
    this.users=data.users;
    });
    this.chatService.roomsUpdate().subscribe(data=>{this.userData.rooms =data;

    });
    this.chatService.joinedUser().subscribe(data=>{
      this.userData =data;

      this.username = data.username;
      for(let i =0;i<3;i++){
         if(data.rooms[i].status ==1){
           this.show = 1;
           this.messageArray = this.messageArrays[i];
           break;
         }
      }

    });
    this.chatService.typingNotification().subscribe(data=>{
      this.typing[data.index].status =1;
      this.typing[data.index].message =data.message;
      console.log('typing');
      setTimeout(()=>{
        this.typing[data.index].status =0;
        this.typing[data.index].message =null;
      },1500);

    });

    this.chatService.timer().subscribe(data=>{
      this.userData.rooms[data.index].room = null;
      this.messageArrays[data.index] = [];
    });
    this.chatService.showTimer().subscribe(data=>{
      this.times[data.index] = data.time;
  console.log('for time');
      let d = new Date().getTime();

      let e = data.time;

      let noTime = (d - e)/ 1000;
      console.log(noTime);
      this.timer[data.index] = Math.abs(noTime);

    });
  }

  ngOnInit(): void {
     this.chatService.setupSocketConnection();
     this.loginForm = new FormGroup({
       email: new FormControl(null)
     });

  }

  onLogin(){
    var email = this.loginForm.value.email.toLowerCase();
    this.username= email;
    let check = this.validateEmail(this.username);
    this.checkEmail =check;
    if(check == true) {
      this.route = 1;
      console.log(this.room);
      // this.chatService.joinRoom({username:this.username,room:this.room});
      this.chatService.join({username: this.loginForm.value.email.toLowerCase()});
    }
  }
  // joinChat(){
  //
  // }
  joinRoom(index){
    this.show = 1;
    this.style[this.roomNumber] = 0;
    this.style[index]=1;
    this.userData.rooms[index].status = 1;
    this.messageArray = this.messageArrays[index];
    this.chatService.joinRoom({username:this.username,room:this.userData.rooms[index].room,index:index});
  }
  changeRoom(index){
    this.show =1;
    this.style[this.roomNumber] = 0;
    this.style[index]=1;
    this.messageArray = this.messageArrays[index];
    this.roomNumber = index;
    this.notifications[index]=0;
    let d = new Date().getTime();

    let e = this.times[index];

    let noTime = (d - e)/ 1000;
    console.log(noTime);
    this.timer[index] = Math.abs(noTime);
    console.log(this.roomNumber);

  }
  leaveRoom(){
    this.route =0;
    this.chatService.signout();
    this.show =0;
    this.messageArray = [];
    this.messageArrays =[[],[],[]];
    this.style =[1,0,0];
    this.times=[null,null,null];
    this.timer=[null,null,null];
    this.typing =[{status:0,message:null},{status:0,message:null},{status:0,message:null}];
    this.username = null;
    this.userData = {username:'',id:'',rooms:[]};
    this.chatRooms =null;
    this.checkEmail =true;
    this.roomNumber =0;
    this.notifications =[0,0,0];
  }
  sendMessage(){
    this.chatService.sendMessage({username:this.username,message:this.message,room:this.userData.rooms[this.roomNumber].room,
    index:this.roomNumber});
    this.message = '';

  }
  keyPress(){

    this.chatService.keyPressNotification({username:this.userData.username,room:this.userData.rooms[this.roomNumber].room,
    index:this.roomNumber})
  }
   validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


}
