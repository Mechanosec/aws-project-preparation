import { Module } from '@nestjs/common';
import { CloudFrontService } from './cloud-front.service';

@Module({
  providers: [CloudFrontService],
  exports: [CloudFrontService],
})
export class CloudFrontModule {}
