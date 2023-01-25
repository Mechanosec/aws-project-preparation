import { ChangeAction, RRType } from '@aws-sdk/client-route-53';
import { acmCreator, acmGet } from './aws/acm';
import { cloudFrontHandler } from './aws/cloud_front';
import { route53CreateRecord, route53Get } from './aws/route53';
import { sleep } from './utils/utils';

const run = async () => {
  const domainName = 'asdasdasd.place';
  const subDomainName = 'test';

  const certificateArn = await acmCreator(domainName);
  console.log(certificateArn);
  await sleep(1000);
  const certificate = await acmGet(certificateArn);
  console.log(certificate);
  // const route = await route53Get(domainName);
  // await route53CreateRecord(route.Id, [
  //   {
  //       Action: ChangeAction.CREATE,
  //       ResourceRecordSet: {
  //         Name: recordName,
  //         Type: RRType.CNAME,
  //         AliasTarget: {
  //           HostedZoneId: 'Z2FDTNDATAQYW2', //This is always the hosted zone ID when you create an alias record that routes traffic to a CloudFront distribution.
  //           DNSName: distributionName,
  //           EvaluateTargetHealth: false,
  //         },
  //   },
  // ]);

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
