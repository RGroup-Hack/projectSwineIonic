import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Geolocation } from '@ionic-native/geolocation';
import { HTTP } from '@ionic-native/http';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
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

	url: string = "https://project-swine.herokuapp.com/";
	pessoasProximasNecessitandoDeAjuda: Array<any>;
	detalhePessoaNecessitandoAjuda: any;

	stateControl: StateControl;

	public formDePara = {
		name: "Jéssica Castro",
		origem: {
			address: "",
			lat: 0,
			long: 0
		},
		destino: {
			address: "",
			lat: 0,
			long: 0
		},
		info: ""
	}

	private mapURL = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyD1uDuJo8_qV0zPNZLqizEDGUcRpYGRNTc";

	constructor(public navCtrl: NavController,
		public socket: Socket,
		public geo: Geolocation,
		public http: HTTP,
		public platform: Platform,
		public geoCoder: NativeGeocoder) {

		this.pessoasProximasNecessitandoDeAjuda = [];
		this.stateControl = new StateControl();
	}

	createAssist() {
		this.setOrigemAddressByLocation();
		this.stateControl.setState("criarAjuda");
	}

	requestAssist() {
		this.openSocket();
		this.sendRequestAssist();
	}

	//Socket Connection and configuration
	openSocket() {
		this.socket.connect();
	}

	closeSocket() {
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
		this.formDePara.name = "Jéssica Araujo";
		this.socket.emit(this.socketEvents.requestAssist, this.formDePara, (data) => {
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

	private catchAssist(anotherSocketId: String) {
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
	private async getCurrentLocation() {
		var position = await this.geo.getCurrentPosition({ enableHighAccuracy: true });

		return {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}
	}

	//List Peoples for Assist
	getListOfPeopleToAssist() {
		this.getCurrentLocation().then(data => {
			this.socket.emit(this.socketEvents.findPeople, {
				name: "Helena Dutra",
				position: data
			});
		})
	}

	private contadorQueroAjudar = 0;
	receiveListOfPeoples() {
		this.socket.on(`${this.socketEvents.findPeople}${this.posFix}`, data => {
			if (data.list) {
				console.log(data.list);

				this.pessoasProximasNecessitandoDeAjuda = data.list;
			} else {
				this.pessoasProximasNecessitandoDeAjuda = [];
			}

			setTimeout(() => {
				if (this.contadorQueroAjudar < 10) {
					this.contadorQueroAjudar++;
					this.eventsQueroAjudar();
				} else {
					this.contadorQueroAjudar = 0;
				}
			}, 3000);

		});
	}

	queroAjudar() {
		this.openSocket();
		this.eventsQueroAjudar();
	}

	private eventsQueroAjudar() {
		this.receiveListOfPeoples();
		this.getListOfPeopleToAssist();
		this.stateControl.setState("queroAjudar")
	}

	detalhesAjuda(socketId) {
		this.detalhePessoaNecessitandoAjuda = this.pessoasProximasNecessitandoDeAjuda.filter((e, i) => {
			return e.socketId == socketId;
		})
		this.stateControl.setState("detalheAjuda");
	}

	public setOrigemAddressByLocation() {
		if (this.platform.is('android') || this.platform.is('android')) {
			this.getCurrentLocation().then(posicao => {
				this.geoCoder.reverseGeocode(posicao.latitude, posicao.longitude)
					.then((data: NativeGeocoderReverseResult[]) => {
						if (data && data[0]) {
							this.formDePara.origem.lat = posicao.latitude;
							this.formDePara.origem.long = posicao.longitude;
							let address = data[0];
							this.formDePara.origem.address = address.thoroughfare + ', ' + address.subThoroughfare;
						} else {
							this.formDePara.origem.address = ""
						}
					})
					.catch(error => {
						console.log(error);
						this.formDePara.origem.address = "";
					})
			})
		}
	}

	public async getLatLongFromAddress(address) {
		let geocoder = await this.geoCoder.forwardGeocode(address);
		if (geocoder && geocoder[0]) {
			return geocoder[0];
		}
	}

	sendAssistRequest() {
		this.getLatLongFromAddress(this.formDePara.origem.address).then(data => {
			this.formDePara.origem.lat = Number.parseFloat(data.latitude);
			this.formDePara.origem.long = Number.parseFloat(data.longitude);

			this.getLatLongFromAddress(this.formDePara.destino.address).then(data => {
				this.formDePara.destino.lat = Number.parseFloat(data.latitude);
				this.formDePara.destino.long = Number.parseFloat(data.longitude);

				this.requestAssist()
			})
		});
	}
}
