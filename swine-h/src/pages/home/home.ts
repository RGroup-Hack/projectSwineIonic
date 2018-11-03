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
		requestAssist: "requestAssist",
		receiverAssist: "receiverAssist",
		receiverEndAssist: "receiverEndOfAssist"
	}

	constructor(public navCtrl: NavController, public socket: Socket, public geo: Geolocation) { }

	requestAssist() {
		this.openSocket();
		this.sendRequestAssist();
	}


	//Socket Connection and configuration
	openSocket() {
		this.socket.connect();
	}

	closeSocket () {
		this.socket.removeAllListeners();
		this.socket.disconnect();
	}
	
	//Emit events
	sendEndOfTracking() {
		this.socket.emit(this.socketEvents.endOfTracking, {
			over: true
		}, () => {
			this.currentAssistIsActive = false;
		})
	}


	sendRequestAssist() {
		this.socket.emit(this.socketEvents.requestAssist, this.getCurrentLocation(), (data) => {
			this.receiverAssist();
			this.startingEmitLocation()
		});
	}

	startingEmitLocation() {
		this.sendLocalizationInfo();
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

	//Receive events
	private startingReceiveLocationData() {
		this.socket.on(this.socketEvents.receiverAnotherPosition, (data) => {
			this.plotPositionOnMap(data);
		});
	}

	finalizedAssist() {
		this.socket.on(this.socketEvents.receiverEndAssist, data => {
			this.currentAssistIsActive = false;
			this.closeSocket();
		})
	}

	receiverAssist() {
		this.socket.on(this.socketEvents.receiverAssist, data => {
			this.currentAssistIsActive = true;
			this.startingReceiveLocationData();
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
