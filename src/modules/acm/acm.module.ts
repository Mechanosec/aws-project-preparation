import { Module } from '@nestjs/common';
import { AcmService } from './acm.service';

@Module({
  providers: [AcmService],
  exports: [AcmService],
})
export class AcmModule {}
