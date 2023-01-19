import { createCloudFront } from './aws/cloud_front';
import { createS3 } from './aws/s3';

const run = () => {
  const globalName = 'try.test.lumi';

  // createS3(globalName);

  createCloudFront(globalName);
};

run();
