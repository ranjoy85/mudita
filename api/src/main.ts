import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// initialize firebase-admin
	var admin = require("firebase-admin");

	var serviceAccount = require("../fcm.json");

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	});

	app.enableCors();
	await app.listen(process.env.PORT);
}
bootstrap();
