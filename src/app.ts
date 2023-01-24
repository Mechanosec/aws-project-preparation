import { cloudFrontHandler } from './aws/cloud_front';
import { route53Handler } from './aws/route53';
import { S3Handler } from './aws/s3';

const run = async () => {
  const bucketName = 'test.mycapsule.place';

  // await S3Handler(bucketName);

  // await cloudFrontHandler(
  //   bucketName,
  //   'arn:aws:acm:us-east-1:830658900665:certificate/a5517f2d-28d7-465f-a273-f7fef6225512'
  // );

  // await route53Handler(
  //   'Z055208932793K9V9CNJI',
  //   {
  //     hostedZoneId: 'Z2FDTNDATAQYW2', //This is always the hosted zone ID when you create an alias record that routes traffic to a CloudFront distribution.
  //     name: 'd3lyfxgzpgcekf.cloudfront.net',
  //   },
  //   bucketName,
  // );
};

run();
