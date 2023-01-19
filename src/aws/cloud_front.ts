import {
  CloudFrontClient,
  CreateDistributionCommand,
  ViewerProtocolPolicy,
} from '@aws-sdk/client-cloudfront';
import { awsConfig } from '../config';

const client = new CloudFrontClient(awsConfig);

const createCloudFront = async (cloudFrontName: string) => {
  const distribution = new CreateDistributionCommand({
    DistributionConfig: {
      CallerReference: 'testdistribution',
      Enabled: true,
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: cloudFrontName,
            DomainName: `${cloudFrontName}.s3-website-us-east-1.amazonaws.com`,
            S3OriginConfig: {
              OriginAccessIdentity: ``,
            },
          },
        ],
      },
      DefaultCacheBehavior: {
        TargetOriginId: `${cloudFrontName}.s3-website-us-east-1.amazonaws.com`,
        ViewerProtocolPolicy: ViewerProtocolPolicy.allow_all,
      },
      Comment: 'test distribution',
    },
  });

  try {
    await client.send(distribution);
    console.log('_____DISTRIBUTION CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

export { createCloudFront };
