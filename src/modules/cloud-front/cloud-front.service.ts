import {
  CacheBehavior,
  CloudFrontClient,
  CreateDistributionCommand,
  DefaultCacheBehavior,
  Distribution,
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

  async create(
    bucketName: string,
    ACMCertificateArn: string,
    origins: Origin[],
    cacheBehaviors: CacheBehavior[],
    defaultCacheBehavior: DefaultCacheBehavior,
  ): Promise<Distribution> {
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
        CacheBehaviors: {
          Quantity: cacheBehaviors.length,
          Items: cacheBehaviors,
        },
        ViewerCertificate: {
          ACMCertificateArn,
          SSLSupportMethod: SSLSupportMethod.sni_only,
          MinimumProtocolVersion: MinimumProtocolVersion.TLSv1_2_2021,
        },
        DefaultCacheBehavior: defaultCacheBehavior,
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
