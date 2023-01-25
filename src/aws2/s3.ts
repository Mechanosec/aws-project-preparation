import {
  S3Client,
  CreateBucketCommand,
  BucketCannedACL,
  PutBucketPolicyCommand,
  PutBucketWebsiteCommand,
} from '@aws-sdk/client-s3';
import { awsConfig } from '../config';

const client = new S3Client(awsConfig);

const S3Handler = async (bucketName: string) => {
  const bucket = new CreateBucketCommand({
    Bucket: bucketName,
    ACL: BucketCannedACL.public_read_write,
  });

  const police = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    }),
  });

  const website = new PutBucketWebsiteCommand({
    Bucket: bucketName,
    WebsiteConfiguration: {
      IndexDocument: { Suffix: 'index.html' },
      ErrorDocument: { Key: 'index.html' },
    },
  });

  try {
    await client.send(bucket);
    await client.send(police);
    await client.send(website);

    console.log('_____BUCKET CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

export { S3Handler };
