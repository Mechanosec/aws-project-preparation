import { Module } from '@nestjs/common';
import { Route53Service } from './route53.service';

@Module({
  providers: [Route53Service],
  exports: [Route53Service],
})
export class Route53Module {}
