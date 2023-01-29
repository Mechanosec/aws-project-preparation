import {
  Change,
  ChangeResourceRecordSetsCommand,
  HostedZone,
  ListHostedZonesByNameCommand,
  ListHostedZonesByNameCommandOutput,
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

  async getAll(): Promise<HostedZone[]> {
    const hostedZoneList = new ListHostedZonesByNameCommand({});
    try {
      const response: ListHostedZonesByNameCommandOutput =
        await this.client.send(hostedZoneList);

      return response.HostedZones;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
