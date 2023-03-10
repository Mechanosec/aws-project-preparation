import {
  CertificateDetail,
  CertificateStatus,
  CertificateSummary,
  DomainValidation,
} from '@aws-sdk/client-acm';
import {
  CacheBehavior,
  DefaultCacheBehavior,
  Distribution,
  EventType,
  Origin,
  OriginProtocolPolicy,
  ViewerProtocolPolicy,
} from '@aws-sdk/client-cloudfront';
import { ChangeAction, RRType } from '@aws-sdk/client-route-53';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AcmService } from './modules/acm/acm.service';
import { CloudFrontService } from './modules/cloud-front/cloud-front.service';
import { Route53Service } from './modules/route53/route53.service';
import { sleep } from './utils/utils';

@Injectable()
export class AppService {
  private readonly retryCount = 5;

  constructor(
    private readonly cloudFrontService: CloudFrontService,
    private readonly acmService: AcmService,
    private readonly route53Service: Route53Service,
  ) {}

  async validateAcm(domainName: string): Promise<{
    certificate: CertificateDetail;
    certificateDomainValidation: DomainValidation;
  }> {
    let retryCount = this.retryCount;

    const certificateList = await this.acmService.getList();
    const issetCertificate = certificateList.find(
      (certificate: CertificateSummary) =>
        certificate.DomainName === domainName,
    );

    let certificateArn = issetCertificate?.CertificateArn;
    let certificate: CertificateDetail;
    let certificateDomainValidation: DomainValidation;

    if (!certificateArn) {
      certificateArn = await this.acmService.create(domainName);

      while (true) {
        await sleep(2000);
        certificate = await this.acmService.getByArn(certificateArn);
        certificateDomainValidation = certificate.DomainValidationOptions.pop();

        if (!retryCount) {
          throw new BadRequestException('Some problem with acm validation');
        }

        if (certificateDomainValidation.ResourceRecord) {
          break;
        }

        retryCount--;
      }
    } else {
      certificate = await this.acmService.getByArn(certificateArn);
      certificateDomainValidation = certificate.DomainValidationOptions.pop();
    }

    return { certificate, certificateDomainValidation };
  }

  async aggregateStatusAcm(
    certificateArn: string,
    certificateDomainValidation: DomainValidation,
    hostedZoneId: string,
  ): Promise<boolean> {
    let certificate: CertificateDetail;
    certificate = await this.acmService.getByArn(certificateArn);

    if (certificate.Status === CertificateStatus.ISSUED) {
      return true;
    }

    let retryCount = this.retryCount;

    await this.route53Service.create(hostedZoneId, [
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

    while (true) {
      await sleep(5000);
      certificate = await this.acmService.getByArn(certificateArn);

      if (!retryCount) {
        throw new BadRequestException('Some problem with validate status acm');
      }

      if (certificate.Status === CertificateStatus.ISSUED) {
        break;
      }

      retryCount--;
    }

    return true;
  }

  async aggregateCloudFront(
    domainName: string,
    certificateArn: string,
    isConstructor: boolean,
  ): Promise<Distribution> {
    const origins: Origin[] = [];

    const cacheBehaviors: CacheBehavior[] = [];
    const defaultOrigin: Origin = {
      Id: `${domainName}.s3-website-us-east-1.amazonaws.com`,
      DomainName: `${domainName}.s3-website.-us-east-1.amazonaws.com`,
      CustomOriginConfig: {
        HTTPPort: 80,
        HTTPSPort: 80,
        OriginProtocolPolicy: OriginProtocolPolicy.https_only,
      },
    };
    let defaultCacheBehavior: DefaultCacheBehavior;
    if (isConstructor) {
      origins.push(
        {
          Id: `${process.env.FUNNEL_FUEL_ORIGIN_NAME}`,
          DomainName: `${process.env.FUNNEL_FUEL_ORIGIN_NAME}`,
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 80,
            OriginProtocolPolicy: OriginProtocolPolicy.https_only,
          },
        },
        defaultOrigin,
      );

      cacheBehaviors.push({
        PathPattern: 'main/*',
        TargetOriginId: `${domainName}.s3-website-us-east-1.amazonaws.com`,
        ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
        MinTTL: 0,
        ForwardedValues: {
          QueryString: true,
          Cookies: {
            Forward: 'none',
          },
        },
        LambdaFunctionAssociations: {
          Quantity: 1,
          Items: [
            {
              EventType: EventType.origin_request,
              LambdaFunctionARN: process.env.FUNNEL_FUEL_LAMBDA,
            },
          ],
        },
      });

      defaultCacheBehavior = {
        TargetOriginId: `${process.env.FUNNEL_FUEL_ORIGIN_NAME}`,
        ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
        MinTTL: 0,
        ForwardedValues: {
          QueryString: true,
          Cookies: {
            Forward: 'none',
          },
        },
      };
    } else {
      origins.push(defaultOrigin);

      defaultCacheBehavior = {
        TargetOriginId: `${domainName}.s3-website-us-east-1.amazonaws.com`,
        ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
        MinTTL: 0,
        ForwardedValues: {
          QueryString: true,
          Cookies: {
            Forward: 'none',
          },
        },
      };
    }

    const cloudFront = await this.cloudFrontService.create(
      domainName,
      certificateArn,
      origins,
      cacheBehaviors,
      defaultCacheBehavior,
    );

    // if (isConstructor) {
    //   cacheBehaviors.push(
    //     {
    //       PathPattern: '*',
    //       TargetOriginId: `${domainName}.s3-website-us-east-1.amazonaws.com`,
    //       ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
    //     },
    //     {
    //       PathPattern: 'main/*',
    //       TargetOriginId: `${domainName}.s3-website-us-east-1.amazonaws.com`,
    //       ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
    //       LambdaFunctionAssociations: {
    //         Quantity: 1,
    //         Items: [
    //           {
    //             EventType: EventType.origin_request,
    //             LambdaFunctionARN: process.env.FUNNEL_FUEL_LAMBDA,
    //           },
    //         ],
    //       },
    //     },
    //   );
    // }

    return cloudFront;
  }
}
