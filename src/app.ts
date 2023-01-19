import { createCloudFront } from './aws/cloud_front';
import { createS3 } from './aws/s3';

const run = () => {
  const globalName = 'try.test.lumi';

  createS3(globalName).then(() => {
    createCloudFront(
      globalName,
      'arn:aws:acm:us-east-1:830658900665:certificate/8d72d961-5da8-4f2c-8f81-3ae166b969a5'
    );
  });
};

run();
