import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {

	private currentAssistIsActive: boolean = false;
	
	private socketEvents = {
		endOfTracking: "closingAssist",
		sendMyPosition: "sendMyPosition",
		receiverAnotherPosition: "receiverAnotherPosition",
		catchAssist: "catchAssist",
		requestAssist: "requestAssist"
	}

	constructor(public navCtrl: NavController, public socket: Socket, public geo: Geolocation) { }

	//Socket Connection and configuration
	openSocket() {
		this.socket.connect();
	}

	closeSocket () {
		this.socket.removeAllListeners();
		this.socket.disconnect();
	}

	sendEndOfTracking() {
		this.socket.emit(this.socketEvents.endOfTracking, {
			over: true
		}, () => {
			this.currentAssistIsActive = false;
		})
	}

	//Emit events
	startingEmitLocation() {
		this.sendLocalizationInfo();
		this.startingReceiveLocationData();
	}

	private sendLocalizationInfo() {
		var geoLocationWatcher = this.geo.watchPosition({
			enableHighAccuracy: true,
			timeout: 1 * 1000,
		}).subscribe(data => {
			this.socket.emit(this.socketEvents.sendMyPosition, {
				latitude: data.coords.latitude,
				longitude: data.coords.longitude
			}, () => {
				console.log("Sended position.");
			});

			if (!this.currentAssistIsActive) {
				geoLocationWatcher.unsubscribe();
			}
		})
	}

	catchAssist(anotherSocketId: String){
		this.socket.emit(this.socketEvents.catchAssist, anotherSocketId, () => {
			this.currentAssistIsActive = true;
		})
	}

	sendRequestAssist() {
		this.socket.emit(this.socketEvents.requestAssist, this.getCurrentLocation(), (data) => {

		});
	}

	//Receive events
	private startingReceiveLocationData() {
		this.socket.on(this.socketEvents.receiverAnotherPosition, (data) => {
			this.plotPositionOnMap(data);
		});


	}
 

	//map utils
	private plotPositionOnMap(posicao) {

	}

	//GeoUtils
	private async getCurrentLocation () {
		var position = await this.geo.getCurrentPosition({ enableHighAccuracy: true });

		return {
			lat: position.coords.latitude,
			long: position.coords.longitude
		}
	}

}
