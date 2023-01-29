import {
  CertificateDetail,
  CertificateStatus,
  DomainValidation,
} from '@aws-sdk/client-acm';
import { ChangeAction, HostedZone, RRType } from '@aws-sdk/client-route-53';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { AcmService } from './modules/acm/acm.service';
import { CloudFrontService } from './modules/cloud-front/cloud-front.service';
import { Route53Service } from './modules/route53/route53.service';
import { S3Service } from './modules/s3/s3.service';
import { sleep } from './utils/utils';

@Controller()
export class AppController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly cloudFrontService: CloudFrontService,
    private readonly acmService: AcmService,
    private readonly route53Service: Route53Service,
  ) {}

  @Post('/create-project')
  async createProject(
    @Body()
    dataProject: CreateProjectDto,
  ) {
    const certificateArn = await this.acmService.create(dataProject.domainName);

    let certificate: CertificateDetail;
    let certificateDomainValidation: DomainValidation;
    while (true) {
      await sleep(2000);
      certificate = await this.acmService.get(certificateArn);
      certificateDomainValidation = certificate.DomainValidationOptions.pop();
      if (certificateDomainValidation.ResourceRecord) {
        break;
      }
    }

    await this.route53Service.create(dataProject.hostedZoneId, [
      {
        Action: ChangeAction.CREATE,
        ResourceRecordSet: {
          Type: RRType.CNAME,
          TTL: 300,
          Name: certificateDomainValidation.ResourceRecord.Name,
          ResourceRecords: [
            { Value: certificateDomainValidation.ResourceRecord.Value },
          ],
        },
      },
    ]);

    await this.s3Service.create(dataProject.domainName);

    while (true) {
      await sleep(5000);
      certificate = await this.acmService.get(certificateArn);
      if (certificate.Status === CertificateStatus.ISSUED) {
        break;
      }
    }

    const cloudFront = await this.cloudFrontService.create(
      dataProject.domainName,
      certificateArn,
    );

    await this.route53Service.create(dataProject.hostedZoneId, [
      {
        Action: ChangeAction.CREATE,
        ResourceRecordSet: {
          Name: dataProject.domainName,
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
