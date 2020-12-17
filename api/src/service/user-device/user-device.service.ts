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
}
