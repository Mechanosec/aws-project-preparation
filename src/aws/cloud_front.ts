import {
  CloudFrontClient,
  CreateDistributionCommand,
  OriginProtocolPolicy,
  ViewerProtocolPolicy,
} from '@aws-sdk/client-cloudfront';
import { awsConfig } from '../config';

const client = new CloudFrontClient(awsConfig);

const createCloudFront = async (cloudFrontName: string) => {
  const distribution = new CreateDistributionCommand({
    DistributionConfig: {
      CallerReference: cloudFrontName,
      Enabled: false,
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: `${cloudFrontName}.s3-website.-us-east-1.amazonaws.com`,
            DomainName: `${cloudFrontName}.s3-website.-us-east-1.amazonaws.com`,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 80,
              OriginProtocolPolicy: OriginProtocolPolicy.http_only,
            },
          },
        ],
      },
      DefaultCacheBehavior: {
        TargetOriginId: `${cloudFrontName}.s3-website.-us-east-1.amazonaws.com`,
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
    await client.send(distribution);
    console.log('_____DISTRIBUTION CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

export { createCloudFront };
