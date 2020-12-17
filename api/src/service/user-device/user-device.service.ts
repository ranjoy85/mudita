import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { UserDeviceModel } from 'src/model/add-user-device.dto';

@Injectable()
export class UserDeviceService {
	constructor(
		@InjectModel('UserDeviceModel') private readonly userDeviceModel: Model<UserDeviceModel>,
		private httpService: HttpService
	) { }

	/**
	 * Adds feed
	 * @param addFeedDTO 
	 * @returns feed 
	 */
	async addUserDevice(addUserDeviceDTO: AddUserDeviceDTO): Promise<UserDeviceModel> {
		const newFeed = await new this.userDeviceModel(addUserDeviceDTO);
		return newFeed.save();
	}

	async sendPushToAllDevices(addFeedDTO: AddFeedDTO) {

		const webPush = require('web-push');

		const vapidKeys = {
			"publicKey": "BABVaD-J9FwpvbmT4DgThDa_A4LCMAJoczPqItpEcTq16KRSaMIKyhv6kLBVjcYJVQD2BOgcfrRSzEtA-nOTac8",
			"privateKey": "RJ64bu9NWz3XrAZU6-RPfHfHQzmC0T8mkiZaXXxDG7s"
		};

		webPush.setVapidDetails(
			'mailto:example@yourdomain.org',
			vapidKeys.publicKey,
			vapidKeys.privateKey
		);

		const notificationPayload = {
			"notification": {
				"title": addFeedDTO.score,
				"body": addFeedDTO.title,
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

		const allAllUserDevice = await this.userDeviceModel.find().exec();
		allAllUserDevice.forEach(async pushSubscription => {
			return webPush.sendNotification(
				pushSubscription,
				JSON.stringify(notificationPayload)
			  ).catch( error => {
				  console.log(error.body);
			  }) ;

		})

		// webpush.sendNotification(subscription, notificationPayload)
		// 	.catch(error => console.error(error))
		// };

		// Promise
		// 	.all(
		// 	allAllUserDevice
		// 		.map
		// 		(
		// 			userDeviceModel => webpush.sendNotification(userDeviceModel, JSON.stringify(notificationPayload))
		// 		)
		// 	)
		// 	.then(() => console.log('a'))
		// 	.catch(
		// 		err => {
		// 			console.error("Error sending notification, reason: ", err);
		// 		}
		// 	);
	}
}
