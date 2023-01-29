import { Module } from '@nestjs/common';
import { S3Module } from './modules/s3/s3.module';
import { CloudFrontModule } from './modules/cloud-front/cloud-front.module';
import { AcmModule } from './modules/acm/acm.module';
import { Route53Module } from './modules/route53/route53.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    S3Module,
    CloudFrontModule,
    AcmModule,
    Route53Module,
  ],
  controllers: [AppController],
})
export class AppModule {}
