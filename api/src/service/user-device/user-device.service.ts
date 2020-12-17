import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { UserDeviceModel } from 'src/model/add-user-device.dto';

@Injectable()
export class UserDeviceService {
	constructor(
		@InjectModel('UserDeviceModel') private readonly feedModel: Model<UserDeviceModel>,
		private httpService: HttpService
	) { }

	/**
	 * Adds feed
	 * @param addFeedDTO 
	 * @returns feed 
	 */
	async addUserDevice(addUserDeviceDTO: AddUserDeviceDTO): Promise<UserDeviceModel> {
		const newFeed = await new this.feedModel(addUserDeviceDTO);
		return newFeed.save();
	}

	//
	async sendPush() {
		const webpush = require('web-push');

		const vapidKeys = {
			"publicKey": "BABVaD-J9FwpvbmT4DgThDa_A4LCMAJoczPqItpEcTq16KRSaMIKyhv6kLBVjcYJVQD2BOgcfrRSzEtA-nOTac8",
			"privateKey": "RJ64bu9NWz3XrAZU6-RPfHfHQzmC0T8mkiZaXXxDG7s"
		};

		webpush.setVapidDetails(
			'mailto:example@yourdomain.org',
			vapidKeys.publicKey,
			vapidKeys.privateKey
		);



		const notificationPayload = {
			"notification": {
				"title": "Angular News",
				"body": "Newsletter Available!",
				"icon": "assets/main-page-logo-small-hat.png",
				"vibrate": [100, 50, 100],
				"data": {
					"dateOfArrival": Date.now(),
					"primaryKey": 1
				},
				"actions": [{
					"action": "explore",
					"title": "Go to the site"
				}]
			}
		};
		const allSubscriptions = [
			{
				"endpoint": "https://fcm.googleapis.com/fcm/send/dVRSvtNjdk8:APA91bHS8c2GZJLUE9pGxe57vhlfn8whseLtU6AUO_HMBFaA1Nf9PcPcOstoU_Mxdz-t7R3lfv0-npTbxFylz1cVUGgCnx7UgiDldFmOHGvZvDAQOBiGI-jjyqguI-NnpkiBAXotTBaM",
				"expirationTime": null,
				"keys": {
					"p256dh": "BM0wZAcoaXLaQdsXLvXscw4OP3IvVL9CzVl3eiJJJBFJToOEbc6mxE2G1-OhIqZN9ajTdYkBrZcdY3NXxizW910",
					"auth": "jxcm7XRKLJD49A3ADZiXNA"
				}
			}
		];
		// webpush.sendNotification(subscription, notificationPayload)
		// 	.catch(error => console.error(error))
		// };

		Promise.all(allSubscriptions.map(sub => webpush.sendNotification(
			sub, JSON.stringify(notificationPayload))))
			.then(() => console.log('a'))
			.catch(err => {
				console.error("Error sending notification, reason: ", err);

			});
	}
}
