import {
  CloudFrontClient,
  CreateDistributionCommand,
  MinimumProtocolVersion,
  Origin,
  OriginProtocolPolicy,
  SSLSupportMethod,
  ViewerProtocolPolicy,
} from '@aws-sdk/client-cloudfront';
import { BadRequestException, Injectable } from '@nestjs/common';
import { awsConfig } from '../../utils/awsConfig';

@Injectable()
export class CloudFrontService {
  private readonly client: CloudFrontClient;

  constructor() {
    this.client = new CloudFrontClient(awsConfig);
  }

  async create(bucketName: string, ACMCertificateArn: string) {
    const origins: Origin[] = [
      {
        Id: `${bucketName}.s3-website-us-east-1.amazonaws.com`,
        DomainName: `${bucketName}.s3-website.-us-east-1.amazonaws.com`,
        CustomOriginConfig: {
          HTTPPort: 80,
          HTTPSPort: 80,
          OriginProtocolPolicy: OriginProtocolPolicy.https_only,
        },
      },
    ];

    const distribution = new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: bucketName,
        Enabled: false,
        Origins: {
          Quantity: origins.length,
          Items: origins,
        },
        Aliases: {
          Quantity: 1,
          Items: [bucketName],
        },
        ViewerCertificate: {
          ACMCertificateArn,
          SSLSupportMethod: SSLSupportMethod.sni_only,
          MinimumProtocolVersion: MinimumProtocolVersion.TLSv1_2_2021,
        },
        DefaultCacheBehavior: {
          TargetOriginId: `${bucketName}.s3-website-us-east-1.amazonaws.com`,
          ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
          MinTTL: 0,
          ForwardedValues: {
            QueryString: true,
            Cookies: {
              Forward: 'none',
            },
          },
        },
        Comment: '',
      },
    });

    try {
      const response = await this.client.send(distribution);

      console.log('_____DISTRIBUTION CREATED_____');
      return response.Distribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}