import {
  Change,
  ChangeResourceRecordSetsCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';
import { BadRequestException, Injectable } from '@nestjs/common';
import { awsConfig } from '../../utils/awsConfig';

@Injectable()
export class Route53Service {
  private readonly client: Route53Client;

  constructor() {
    this.client = new Route53Client(awsConfig);
  }

  async create(hostedZoneId: string, changes: Change[]) {
    if (!changes.length) {
      throw new BadRequestException('Need some data for creation');
    }

    const distributionRecord = new ChangeResourceRecordSetsCommand({
      HostedZoneId: hostedZoneId,
      ChangeBatch: {
        Changes: changes,
        // {
        //   Action: ChangeAction.CREATE,
        //   ResourceRecordSet: {
        //     Name: recordName,
        //     Type: RRType.A,
        //     AliasTarget: {
        //       HostedZoneId: 'Z2FDTNDATAQYW2', //This is always the hosted zone ID when you create an alias record that routes traffic to a CloudFront distribution.
        //       DNSName: distributionName,
        //       EvaluateTargetHealth: false,
        //     },
        //   },
        // },
      },
    });

    try {
      await this.client.send(distributionRecord);

      console.log('_____RECORD CREATED_____');
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
