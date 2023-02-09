import {
  CertificateDetail,
  CertificateStatus,
  DomainValidation,
} from '@aws-sdk/client-acm';
import { ChangeAction, HostedZone, RRType } from '@aws-sdk/client-route-53';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Route53Service } from './modules/route53/route53.service';
import { S3Service } from './modules/s3/s3.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: S3Service,
    private readonly route53Service: Route53Service,
  ) {}

  @Post('/create-project')
  async test(
    @Body()
    dataProject: CreateProjectDto,
  ) {
    const { certificate, certificateDomainValidation } =
      await this.appService.validateAcm(dataProject.domainName);

    let aggregateDomain = dataProject.subdomainName;
    if (dataProject.subdomainName) {
      aggregateDomain = `${dataProject.subdomainName}.${dataProject.domainName}`;
    }

    await this.appService.aggregateStatusAcm(
      certificate.CertificateArn,
      certificateDomainValidation,
      dataProject.hostedZoneId,
    );

    await this.s3Service.create(aggregateDomain);

    const cloudFront = await this.appService.aggregateCloudFront(
      aggregateDomain,
      certificate.CertificateArn,
      dataProject.isConstructor,
    );

    await this.route53Service.create(dataProject.hostedZoneId, [
      {
        Action: ChangeAction.CREATE,
        ResourceRecordSet: {
          Name: aggregateDomain,
          Type: RRType.A,
          AliasTarget: {
            HostedZoneId: 'Z2FDTNDATAQYW2', //This is always the hosted zone ID when you create an alias record that routes traffic to a CloudFront distribution.
            DNSName: cloudFront.DomainName,
            EvaluateTargetHealth: false,
          },
        },
      },
    ]);

    console.log('_____ALL CREATED_____');

    return {
      domain: dataProject.domainName,
      cloudFrontId: cloudFront.Id,
    };
  }

  @Get('/hosted-zones')
  async getRouters() {
    const hostedZoneNames = await this.route53Service.getAll();
    return hostedZoneNames.map((hostedZone: HostedZone) => {
      return {
        id: hostedZone.Id.replace('/hostedzone/', ''),
        name: hostedZone.Name,
      };
    });
  }
}
