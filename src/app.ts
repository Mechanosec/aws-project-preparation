import { cloudFrontHandler } from './aws/cloud_front';
import { S3Handler } from './aws/s3';

const run = async () => {
  const globalName = 'try.test.lumi';

  await S3Handler(globalName);

  await cloudFrontHandler(
    globalName,
    'arn:aws:acm:us-east-1:830658900665:certificate/8d72d961-5da8-4f2c-8f81-3ae166b969a5'
  );
};

run();
