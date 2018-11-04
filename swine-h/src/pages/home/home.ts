import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import { StateControl } from '../../model/stateControl';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {

	private currentAssistIsActive: boolean = false;
	private posFix = "Response";
	private socketEvents = {
		endOfTracking: "closingAssist",
		sendMyPosition: "sendMyPosition",
		receiveAnotherPosition: "receiveAnotherPosition",
		catchAssist: "catchAssist",
		requestAssist: "requestAssist",
		receiveAssist: "receiveAssist",
		receiveEndAssist: "receiveEndOfAssist",
		findPeople: "findPeople"
	}

	url:string = "https://project-swine.herokuapp.com/";
	pessoasProximasNecessitandoDeAjuda:Array<Object> ;

	stateControl: StateControl;

	constructor(public navCtrl: NavController, public socket: Socket, public geo: Geolocation, public http: HTTP) { 
		this.pessoasProximasNecessitandoDeAjuda = [];
		this.stateControl = new StateControl();
	}

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

	assistPeople(socketId: String) {
		this.openSocket();
		this.catchAssist(socketId);
	}

	private catchAssist(anotherSocketId: String){
		this.socket.emit(this.socketEvents.catchAssist, anotherSocketId, () => {
			this.currentAssistIsActive = true;
		})
	}

	//Receive events
	private startingReceiveLocationData() {
		this.socket.on(this.socketEvents.receiveAnotherPosition, (data) => {
			this.plotPositionOnMap(data);
		});
	}

	finalizedAssist() {
		this.socket.on('teste', data => {
			this.currentAssistIsActive = false;
			//this.closeSocket();
			console.log(data);
		})
	}

	receiverAssist() {
		this.socket.on(this.socketEvents.receiveAssist, data => {
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
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}
	}

	//List Peoples for Assist
	getListOfPeopleToAssist() {
		this.socket.emit(this.socketEvents.findPeople, {
			name: "Helena Dutra",
			position: this.getCurrentLocation()
		});
	}

	receiveListOfPeoples() {
		this.socket.on(`${this.socketEvents.findPeople}${this.posFix}`, data => {	
			if(data){
				this.pessoasProximasNecessitandoDeAjuda = data;
			}
		});
	}

}
