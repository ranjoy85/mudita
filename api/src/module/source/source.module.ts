import { HttpModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SourceController } from "src/controller/source/source.controller";
import { SourceSchema } from "src/schema/source.schema";
import { SourceService } from "src/service/source/source.service";
import { LoggerModule } from "../logger/logger.module";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'SourceModel', schema: SourceSchema }]),
		HttpModule,
		LoggerModule
	],
	controllers: [SourceController],
    providers: [SourceService],
    exports: [SourceService]
})
export class SourceModule { }
