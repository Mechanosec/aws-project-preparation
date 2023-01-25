import {
  BucketCannedACL,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutBucketWebsiteCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { awsConfig } from '../../config';

export class S3Service {
  constructor(private readonly client: S3Client) {
    this.client = new S3Client(awsConfig);
  }

  async store(bucketName: string) {
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
      await this.client.send(bucket);
      await this.client.send(police);
      await this.client.send(website);

      console.log('_____BUCKET CREATED_____');
    } catch (error) {
      throw new Error(error);
    }
  }

  update() {}

  delete() {}

  get() {}
}
