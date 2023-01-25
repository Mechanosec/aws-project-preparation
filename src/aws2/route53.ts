import {
  Change,
  ChangeResourceRecordSetsCommand,
  HostedZone,
  ListHostedZonesByNameCommand,
  ListHostedZonesByNameCommandOutput,
  Route53Client,
} from '@aws-sdk/client-route-53';
import { awsConfig } from '../config';

const client = new Route53Client(awsConfig);

const route53CreateRecord = async (hostedZoneId: string, changes: Change[]) => {
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
    await client.send(distributionRecord);

    console.log('_____RECORD CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

const route53Get = async (domainName: string): Promise<HostedZone> => {
  const route = new ListHostedZonesByNameCommand({ DNSName: domainName });
  try {
    const response: ListHostedZonesByNameCommandOutput = await client.send(
      route
    );

    return response.HostedZones.find((route) => {
      console.log(route.Name);
      return route.Name.slice(0, -1) === domainName; //remove dot at last symbol
    });
  } catch (error) {
    console.log(error);
  }
};

export { route53CreateRecord, route53Get };
