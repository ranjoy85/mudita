import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceController } from 'src/controller/user-device/user-device.controller';
import { UserDeviceSchema } from 'src/schema/user-device.schema';
import { UserDeviceService } from 'src/service/user-device/user-device.service';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'UserDeviceModel', schema: UserDeviceSchema }]),
        HttpModule
      ],
      controllers: [UserDeviceController],
      providers: [UserDeviceService]
})
export class UserDeviceModule {}
