import {NgModule} from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import {ChatComponent} from './chat/chat.component';




const appRoutes: Routes = [
  {path: '', component: ChatComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes,{useHash: false})],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
