import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddFeedDTO } from 'src/dto/add-feed.dto';
import { AddUserDeviceDTO } from 'src/dto/add-user-device.dto';
import { UserDeviceModel } from 'src/model/user-device.model';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserDeviceService {
	/**
	 * Creates an instance of user device service.
	 * @param userDeviceModel 
	 * @param httpService 
	 */
	constructor(
		@InjectModel('UserDeviceModel') private readonly userDeviceModel: Model<UserDeviceModel>,
		private httpService: HttpService,
		private loggerService : LoggerService
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

	/**
	 * Deletes subscription
	 * @param addUserDeviceDTO 
	 * @returns subscription 
	 */
	async deleteSubscription(addUserDeviceDTO: AddUserDeviceDTO): Promise<UserDeviceModel> {

		const deleteEntity = await new this.userDeviceModel(addUserDeviceDTO);
		return deleteEntity.remove();
	}

	/**
	 * Sends push to all devices
	 * @param addFeedDTO 
	 */
	async sendPushToAllDevices(addFeedDTO: AddFeedDTO) {

		// initiate webpush
		const webPush = require('web-push');

		// attach webpush generated vapidkeys 
		const vapidKeys = {
			"publicKey": process.env.VAPID_PUBLIC_KEY,
			"privateKey": process.env.VAPID_PRIVATE_KEY
		};

		// set vapid details
		webPush.setVapidDetails(
			'mailto:support@rollingarray.co.in',
			vapidKeys.publicKey,
			vapidKeys.privateKey
		);

		// notification payload
		const notificationPayload = {
			"notification": {
				"title": "A joyful feed to read ...",
				"body": addFeedDTO.title,
				"icon": addFeedDTO.imageUrl,
				"vibrate": [100, 50, 100],
				"data": {
					"dateOfArrival": Date.now(),
					"primaryKey": 1
				},
				"actions": [{
					"action": "explore",
					"title": "Go to the content"
				}]
			}
		};

		// get all user device 
		const allUserDevice = await this.userDeviceModel.find().exec().catch();
		

		// iterate through all the devices
		allUserDevice.forEach(async pushSubscription => {

			this.loggerService.log(`Sending push to endpoint - ${pushSubscription.endpoint}`);

			// send push
			return webPush.sendNotification(
				pushSubscription, JSON.stringify(notificationPayload)
			)
				.catch(async (err) => {
					if (err.statusCode === 404 || err.statusCode === 410) {
						
						return await this.deleteSubscription(pushSubscription)
									.then(_=> this.loggerService.log(`Push endpoint - ${pushSubscription.endpoint} -  deleted success`))
									.catch(_=> this.loggerService.log(`Push endpoint - ${pushSubscription.endpoint} -  could not be deleted`));;
					} else {
						throw err;
					}
				});
		});
	}

	/**
	 * Tests push
	 */
	async testPush() {
		console.log('/api/userDevice/testPush');
		// initiate webpush
		const webPush = require('web-push');

		// attach webpush generated vapidkeys 
		const vapidKeys = {
			"publicKey": process.env.VAPID_PUBLIC_KEY,
			"privateKey": process.env.VAPID_PRIVATE_KEY
		};

		// set vapid details
		webPush.setVapidDetails(
			'mailto:support@rollingarray.co.in',
			vapidKeys.publicKey,
			vapidKeys.privateKey
		);

		// notification payload
		const notificationPayload = {
			"notification": {
				"title": "A joyful feed to read ...",
				"body": 'Test',
				"icon": '',
				"vibrate": [100, 50, 100],
				"data": {
					"dateOfArrival": Date.now(),
					"primaryKey": 1
				},
				"actions": [{
					"action": "explore",
					"title": "Go to the content"
				}]
			}
		};

		// push subscription
		const pushSubscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/dUK_6oD6qrE:APA91bEDNsL12Mr-TJuxB9-TzjP2CxChtlnyxNbozhKJ5kGWshrtNxsw0-pTu9xvvTUR7rtlhOamu0vAModO_ow-8GfJI9PHYT1RV2RX44RqRjxPJVuCP6HHiMD7NqGmywPeMCmkRX_z","expirationTime":null,"keys":{"p256dh":"BFAcM6e-zYmt26tGI-10HB5Fy1-8Ha9GUvDySHJuHYXmknAAhHvQOVJyK9VcBHdLKNfjHvWbFPJEv2-_qgGVkaU","auth":"-7RXuKQ5t21FRSkE4mlryw"}};

		// send push
		webPush.sendNotification(
			pushSubscription, JSON.stringify(notificationPayload)
		)
			.catch(async (err) => {
				console.log(err);
				if (err.statusCode === 404 || err.statusCode === 410) {
					// delete push in db
				} else {
					throw err;
				}
			});
	}
}
