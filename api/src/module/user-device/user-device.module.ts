import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceController } from 'src/controller/user-device/user-device.controller';
import { UserDeviceSchema } from 'src/schema/user-device.schema';
import { UserDeviceService } from 'src/service/user-device/user-device.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'UserDeviceModel', schema: UserDeviceSchema }]),
		HttpModule,
		LoggerModule
	],
	controllers: [UserDeviceController],
	providers: [UserDeviceService],
	exports: [UserDeviceService]
})
export class UserDeviceModule { }
