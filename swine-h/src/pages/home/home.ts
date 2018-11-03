import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public socket: Socket, public geo:Geolocation) {

  }

  startingEmmitLocation(){
    this.socket.connect()
  }

  private sendLocalizationInfo(){
    this.geo.watchPosition({
      enableHighAccuracy:true,
      timeout: 1 * 1000,
    })
  }

}
